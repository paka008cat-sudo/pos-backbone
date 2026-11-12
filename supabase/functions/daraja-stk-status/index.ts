import { adminClient, caller, corsHeaders, json } from "../_shared/access.ts";
import { darajaStkQuery } from "../_shared/daraja.ts";

const SHOP_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIVE_ATTEMPT_AGE_MS = 15 * 60 * 1000;
const INITIATION_TIMEOUT_MS = 5 * 60 * 1000;
const INITIATION_TIMEOUT_DESCRIPTION =
  "No Safaricom checkout reference was received before the STK initiation timed out.";

function paymentResponse(payment: Record<string, unknown>, message?: string) {
  return {
    success: true,
    payment_status: String(payment.status ?? "initiating"),
    checkout_request_id:
      typeof payment.checkout_request_id === "string" ? payment.checkout_request_id : null,
    result_code: typeof payment.result_code === "number" ? payment.result_code : null,
    message:
      message ??
      (typeof payment.result_description === "string" ? payment.result_description : null),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "method_not_allowed" }, 405);

  const user = await caller(req);
  if (!user) return json({ success: false, error: "unauthorized" }, 401);

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ success: false, error: "invalid_json" }, 400);
  }
  const shopId = typeof payload.shop_id === "string" ? payload.shop_id.trim() : "";
  const checkoutId =
    typeof payload.checkout_request_id === "string" ? payload.checkout_request_id.trim() : "";
  if (!SHOP_ID_PATTERN.test(shopId)) return json({ success: false, error: "invalid_shop_id" }, 400);
  if (checkoutId.length > 128)
    return json({ success: false, error: "invalid_checkout_request_id" }, 400);

  const db = adminClient();
  const { data: member, error: memberError } = await db
    .from("shop_members")
    .select("role,employment_status")
    .eq("shop_id", shopId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (memberError) {
    console.error("Could not verify payment-status membership", memberError.message);
    return json({ success: false, error: "Could not verify business access. Please retry." }, 500);
  }
  if (!member || member.role !== "owner" || member.employment_status !== "active") {
    return json(
      { success: false, error: "Only the active business owner can check subscription payments." },
      403,
    );
  }

  let query = db
    .from("mpesa_subscription_payments")
    .select("id,shop_id,checkout_request_id,status,result_code,result_description,created_at")
    .eq("shop_id", shopId);
  if (checkoutId) {
    query = query.eq("checkout_request_id", checkoutId);
  } else {
    query = query
      .in("status", ["initiating", "pending"])
      .gte("created_at", new Date(Date.now() - ACTIVE_ATTEMPT_AGE_MS).toISOString())
      .order("created_at", { ascending: false })
      .limit(1);
  }
  const { data: payment, error: paymentError } = await query.maybeSingle();
  if (paymentError) {
    console.error("Could not load M-Pesa payment status", paymentError.message);
    return json({ success: false, error: "Could not load payment status. Please retry." }, 500);
  }
  if (!payment)
    return json({
      success: true,
      payment_status: "none",
      checkout_request_id: null,
      message: "No recent M-Pesa payment attempt was found.",
    });
  if (payment.status === "initiating" && !payment.checkout_request_id) {
    const createdAt = Date.parse(String(payment.created_at ?? ""));
    if (Number.isFinite(createdAt) && Date.now() - createdAt >= INITIATION_TIMEOUT_MS) {
      const { error: timeoutError } = await db
        .from("mpesa_subscription_payments")
        .update({
          status: "failed",
          result_description: INITIATION_TIMEOUT_DESCRIPTION,
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "initiating")
        .is("checkout_request_id", null);
      if (timeoutError) console.error("Could not expire stale STK initiation", timeoutError.message);
      return json({
        success: true,
        payment_status: timeoutError ? "initiating" : "failed",
        checkout_request_id: null,
        result_code: null,
        message: timeoutError
          ? "Safaricom has not confirmed an STK prompt yet. Check again shortly."
          : "No STK checkout reference arrived within five minutes. No prompt is confirmed; you can try the payment again.",
      });
    }
    return json(
      paymentResponse(
        payment,
        "Safaricom has not confirmed an STK checkout reference yet. No prompt is confirmed; check again shortly.",
      ),
    );
  }
  if (payment.status !== "pending" || !payment.checkout_request_id)
    return json(paymentResponse(payment));

  try {
    const result = await darajaStkQuery(payment.checkout_request_id);
    if (
      String(result.CheckoutRequestID ?? "") !== payment.checkout_request_id ||
      String(result.ResponseCode ?? "") !== "0"
    ) {
      return json(
        paymentResponse(
          payment,
          "Safaricom has not returned a final payment result yet. Keep the app open or tap Check Now.",
        ),
      );
    }
    const resultCode = Number(result.ResultCode);
    if (Number.isFinite(resultCode) && resultCode !== 0) {
      const description = String(
        result.ResultDesc ?? "The M-Pesa request was not completed.",
      ).slice(0, 500);
      const { error: updateError } = await db
        .from("mpesa_subscription_payments")
        .update({
          status: "failed",
          result_code: resultCode,
          result_description: description,
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "pending");
      if (updateError)
        console.error("Could not save final Daraja failure status", updateError.message);
    } else if (resultCode === 0) {
      // STK Query does not provide the receipt/phone/amount metadata required
      // to finalize billing. The callback is still required for activation.
      return json(
        paymentResponse(
          payment,
          "Safaricom reports the payment succeeded; waiting for the verified callback to finalize the receipt and subscription.",
        ),
      );
    } else {
      return json(paymentResponse(payment, "Safaricom is still processing this request."));
    }
  } catch (error) {
    console.error(
      "Could not query Daraja payment status",
      error instanceof Error ? error.message : String(error),
    );
    return json(
      paymentResponse(
        payment,
        "Could not reach Safaricom to verify this payment. It may still complete; try again shortly.",
      ),
    );
  }

  const { data: latest, error: latestError } = await db
    .from("mpesa_subscription_payments")
    .select("status,checkout_request_id,result_code,result_description")
    .eq("id", payment.id)
    .maybeSingle();
  if (latestError || !latest) return json(paymentResponse(payment));
  return json(paymentResponse(latest));
});
