import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  DiagnosticCategory,
  ModuleKind,
  ScriptTarget,
  flattenDiagnosticMessageText,
  transpileModule,
} from "typescript";

const helper = readFileSync("supabase/functions/_shared/daraja.ts", "utf8");
const push = readFileSync("supabase/functions/daraja-stk-push/index.ts", "utf8");
const status = readFileSync("supabase/functions/daraja-stk-status/index.ts", "utf8");
const callback = readFileSync("supabase/functions/daraja-stk-callback/index.ts", "utf8");
const config = readFileSync("supabase/config.toml", "utf8");

describe("Daraja subscription payment contract", () => {
  it("reads credentials only from Edge Function runtime secrets and defaults safely to sandbox", () => {
    for (const key of [
      "DARAJA_CONSUMER_KEY",
      "DARAJA_CONSUMER_SECRET",
      "DARAJA_SHORTCODE",
      "DARAJA_PASSKEY",
    ]) {
      expect(helper).toContain(`Deno.env.get("${key}")`);
    }
    expect(helper).toContain('Deno.env.get("DARAJA_ENV") ?? "sandbox"');
    expect(helper).toContain('timeZone: "Africa/Nairobi"');
    expect(helper).toContain("darajaCallbackSignature");
    expect(helper).toContain("verifyDarajaCallbackSignature");
    expect(helper).not.toContain("toISOString()");
    expect(helper).toContain("https://sandbox.safaricom.co.ke");
    expect(helper).toContain("https://api.safaricom.co.ke");
    expect(helper).not.toMatch(
      /console\.(?:log|info)\([^\n]*(?:consumerKey|consumerSecret|passkey)/i,
    );
  });

  it("uses server-owned pricing and reuses an active STK attempt instead of sending duplicates", () => {
    expect(push).toContain(
      '.select("id,name,status,subscription_price_ksh,subscription_plan_days,payment_lock_active,payment_lock_amount_ksh")',
    );
    expect(push).toContain('.in("status", ["initiating", "pending"])');
    expect(push).toContain("An M-Pesa prompt for KSh");
    expect(push).toContain('parsedCallback.searchParams.set("payment_id", payment.id)');
    expect(push).toContain('parsedCallback.searchParams.set("payment_signature"');
    expect(push).not.toContain("payload.amount");
    expect(push).not.toContain("payload.plan_days");
  });

  it("times out stale no-checkout attempts and preserves recovery for a late signed callback", () => {
    expect(push).toContain("const INITIATION_TIMEOUT_MS = 5 * 60 * 1000;");
    expect(push).toContain('.is("checkout_request_id", null)');
    expect(status).toContain('payment.status === "initiating" && !payment.checkout_request_id');
    expect(status).toContain("No prompt is confirmed; you can try the payment again.");
    expect(callback).toContain("canRecoverTimedOutInitiation");
    expect(callback).toContain("Safaricom callback received; verifying payment.");
  });

  it("restricts payment verification to an active owner and does not activate from STK Query alone", () => {
    expect(status).toContain("const user = await caller(req)");
    expect(status).toContain('member.role !== "owner"');
    expect(status).toContain('member.employment_status !== "active"');
    expect(status).toContain("await darajaStkQuery(payment.checkout_request_id)");
    expect(status).toContain("The callback is still required for activation.");
    expect(status).not.toContain("finalize_mpesa_subscription_payment");
    expect(config).toContain("[functions.daraja-stk-status]\nverify_jwt = true");
  });

  it("correlates the callback with the payment row and verifies with Safaricom before finalizing", () => {
    expect(callback).toContain('callbackParams.get("payment_id")');
    expect(callback).toContain(
      "verifyDarajaCallbackSignature(candidatePaymentId, paymentSignature)",
    );
    expect(callback).toContain("storedCheckoutId !== checkoutId");
    expect(callback).toContain("await darajaStkQuery(checkoutId)");
    expect(callback).toContain('callbackItem(metadata, "Amount")');
    expect(callback).toContain('callbackItem(metadata, "MpesaReceiptNumber")');
    expect(callback).toContain('callbackItem(metadata, "PhoneNumber")');
    expect(callback).toContain("finalize_mpesa_subscription_payment");
    expect(config).toContain("[functions.daraja-stk-callback]\nverify_jwt = false");
  });

  it("transpiles every updated Daraja handler and helper without syntax errors", () => {
    const syntaxErrors = [helper, push, status, callback].flatMap((source) =>
      (
        transpileModule(source, {
          compilerOptions: { module: ModuleKind.ESNext, target: ScriptTarget.ES2022 },
          reportDiagnostics: true,
        }).diagnostics ?? []
      )
        .filter((diagnostic) => diagnostic.category === DiagnosticCategory.Error)
        .map((diagnostic) => flattenDiagnosticMessageText(diagnostic.messageText, "\n")),
    );
    expect(syntaxErrors).toEqual([]);
  });
});
