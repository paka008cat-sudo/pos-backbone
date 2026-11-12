import { adminClient, caller, corsHeaders, json } from "../_shared/access.ts";
import { darajaCallbackSignature, darajaStkPush, normalizeKenyanPhone } from "../_shared/daraja.ts";

const SHOP_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTIVE_ATTEMPT_AGE_MS = 10 * 60 * 1000;
const INITIATION_TIMEOUT_MS = 5 * 60 * 1000;
const INITIATION_TIMEOUT_DESCRIPTION =
  "No Safaricom checkout reference was received before the STK initiation timed out.";

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
  const phone = normalizeKenyanPhone(payload.phone_number);
  if (!SHOP_ID_PATTERN.test(shopId)) return json({ success: false, error: "invalid_shop_id" }, 400);
  if (!phone) return json({ success: false, error: "Enter a valid Kenyan M-Pesa number." }, 400);

  const db = adminClient();
  const { data: member, error: membershipError } = await db
    .from("shop_members")
    .select("role,employment_status")
    .eq("shop_id", shopId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError) {
    console.error("Could not verify subscription payer membership", membershipError.message);
    return json({ success: false, error: "Could not verify business access. Please retry." }, 500);
  }
  if (!member || member.role !== "owner" || member.employment_status !== "active") {
    return json(
      {
        success: false,
        error: "Only the active business owner can initiate a subscription payment.",
      },
      403,
    );
  }

  const { data: shop, error: shopError } = await db
    .from("shops")
    .select("id,name,status,subscription_price_ksh,subscription_plan_days,payment_lock_active,payment_lock_amount_ksh")
    .eq("id", shopId)
    .maybeSingle();
  if (shopError || !shop) {
    console.error("Could not load subscription price", shopError?.message ?? "business_not_found");
    return json(
      { success: false, error: "Could not load this business subscription. Please retry." },
      404,
    );
  }
  if (shop.status === "closed")
    return json({ success: false, error: "This business account is closed." }, 403);

  const amount = shop.payment_lock_active && Number(shop.payment_lock_amount_ksh) > 0
    ? Number(shop.payment_lock_amount_ksh)
    : Number(shop.subscription_price_ksh);
  const planDays = Number(shop.subscription_plan_days);
  if (
    !Number.isSafeInteger(amount) ||
    amount < 1 ||
    amount > 250_000 ||
    !Number.isSafeInteger(planDays) ||
    planDays < 1 ||
    planDays > 365
  ) {
    console.error("Invalid server subscription pricing", shopId, amount, planDays);
    return json(
      { success: false, error: "Subscription pricing is not configured for this business." },
      500,
    );
  }

  const staleInitiationBefore = new Date(Date.now() - INITIATION_TIMEOUT_MS).toISOString();
  const { error: expireError } = await db
    .from("mpesa_subscription_payments")
    .update({
      status: "failed",
      result_description: INITIATION_TIMEOUT_DESCRIPTION,
      completed_at: new Date().toISOString(),
    })
    .eq("shop_id", shopId)
    .eq("status", "initiating")
    .is("checkout_request_id", null)
    .lt("created_at", staleInitiationBefore);
  if (expireError) console.error("Could not expire stale M-Pesa initiation", expireError.message);

  // A network timeout can happen after Safaricom has accepted the prompt. Reuse
  // the active attempt instead of charging the owner twice on a quick retry.
  const recentSince = new Date(Date.now() - ACTIVE_ATTEMPT_AGE_MS).toISOString();
  const { data: existing, error: existingError } = await db
    .from("mpesa_subscription_payments")
    .select("checkout_request_id,merchant_request_id,status,phone_number,amount_ksh,plan_days")
    .eq("shop_id", shopId)
    .in("status", ["initiating", "pending"])
    .gte("created_at", recentSince)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) {
    console.error("Could not check for an active M-Pesa prompt", existingError.message);
    return json(
      { success: false, error: "Could not check for an existing payment. Please retry." },
      500,
    );
  }
  if (existing) {
    if (
      existing.status === "pending" &&
      existing.checkout_request_id &&
      existing.phone_number === phone
    ) {
      return json({
        success: true,
        checkout_request_id: existing.checkout_request_id,
        merchant_request_id: existing.merchant_request_id,
        customer_message: `An M-Pesa prompt for KSh ${existing.amount_ksh} is already active. Complete it on the phone used for that prompt or tap Check Now.`,
        amount_ksh: Number(existing.amount_ksh),
        plan_days: Number(existing.plan_days),
        reused: true,
      });
    }
    return json(
      {
        success: false,
        payment_status: existing.status,
        error:
          existing.status === "initiating" && !existing.checkout_request_id
            ? "A previous M-Pesa request has not received a Safaricom checkout reference yet. Tap Check Payment Status; retry will be available once this attempt times out."
            : existing.status === "pending"
            ? "An M-Pesa prompt for an earlier phone number is still active. Complete or cancel it, then tap Check Now before starting another payment."
            : "A previous M-Pesa request is still being confirmed. Wait briefly and tap Check Now before trying again.",
      },
      409,
    );
  }

  const { data: payment, error: insertError } = await db
    .from("mpesa_subscription_payments")
    .insert({
      shop_id: shopId,
      initiated_by: user.id,
      phone_number: phone,
      amount_ksh: amount,
      plan_days: planDays,
      status: "initiating",
    })
    .select("id")
    .single();
  if (insertError || !payment) {
    console.error("Could not create M-Pesa payment record", insertError?.message ?? "missing_row");
    return json({ success: false, error: "Could not start a payment attempt. Please retry." }, 500);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const callbackBase =
    Deno.env.get("DARAJA_CALLBACK_URL") ||
    `${supabaseUrl.replace(/\/$/, "")}/functions/v1/daraja-stk-callback`;
  let callbackUrl: string;
  try {
    const parsedCallback = new URL(callbackBase);
    if (parsedCallback.protocol !== "https:") throw new Error("https_required");
    // This lets the callback attach the Daraja checkout ID even if it arrives
    // before the STK initiation request has finished saving its response.
    parsedCallback.searchParams.set("payment_id", payment.id);
    parsedCallback.searchParams.set("payment_signature", await darajaCallbackSignature(payment.id));
    callbackUrl = parsedCallback.toString();
  } catch {
    await db
      .from("mpesa_subscription_payments")
      .update({
        status: "failed",
        result_description: "A publicly reachable HTTPS callback URL is required.",
      })
      .eq("id", payment.id)
      .eq("status", "initiating");
    return json(
      {
        success: false,
        error: "Set a publicly reachable HTTPS DARAJA_CALLBACK_URL before accepting payments.",
      },
      500,
    );
  }

  try {
    const result = await darajaStkPush({
      phone,
      amount,
      accountReference: `CP${shopId.replaceAll("-", "").slice(0, 10)}`,
      description: "POS Subscription",
      callbackUrl,
    });
    if (!result.success) {
      await db
        .from("mpesa_subscription_payments")
        .update({
          status: "failed",
          result_description: result.description.slice(0, 500),
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "initiating");
      return json({ success: false, error: result.description }, 502);
    }

    const { error: updateError } = await db
      .from("mpesa_subscription_payments")
      .update({
        status: "pending",
        checkout_request_id: result.checkoutRequestId,
        merchant_request_id: result.merchantRequestId,
      })
      .eq("id", payment.id)
      .eq("status", "initiating");
    if (updateError) {
      console.error(
        "Daraja accepted the STK prompt but payment tracking update failed",
        updateError.message,
      );
    }

    const { data: current, error: readError } = await db
      .from("mpesa_subscription_payments")
      .select("status,checkout_request_id")
      .eq("id", payment.id)
      .maybeSingle();
    if (
      readError ||
      !current ||
      (current.checkout_request_id && current.checkout_request_id !== result.checkoutRequestId)
    ) {
      console.error(
        "Could not confirm persisted Daraja payment state",
        readError?.message ?? "payment_state_mismatch",
      );
    }

    return json({
      success: true,
      checkout_request_id: result.checkoutRequestId,
      merchant_request_id: result.merchantRequestId,
      customer_message: result.customerMessage,
      amount_ksh: amount,
      plan_days: planDays,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Daraja request failed.";
    // Do not mark an ambiguous network failure as failed: Safaricom may have
    // accepted the request and the callback may still arrive.
    if (
      message.startsWith("Daraja is not configured") ||
      message.startsWith("Could not authenticate with Daraja")
    ) {
      await db
        .from("mpesa_subscription_payments")
        .update({
          status: "failed",
          result_description: message.slice(0, 500),
          completed_at: new Date().toISOString(),
        })
        .eq("id", payment.id)
        .eq("status", "initiating");
    }
    console.error("M-Pesa STK Push result is uncertain", message);
    return json(
      {
        success: false,
        payment_status: "initiating",
        error:
          "We could not confirm whether Safaricom sent the prompt. Wait briefly and tap Check Now before trying again.",
      },
      502,
    );
  }
});
