// Edge Function: approvePayout
// Admin-only function to approve or reject a payout request.
// Input JSON: { payoutRequestId: string, action: 'approve' | 'reject', note?: string }
// On approve: payout_requests.status -> approved, payment_records.payout_status -> approved
// On reject: payout_requests.status -> rejected, payment_records.payout_status -> pending

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Action = "approve" | "reject";

// CORS headers
const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Auth check
  const { data: authData, error: authError } = await supabase.auth.getUser(req);
  if (authError || !authData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Check admin role in JWT
  const role = (authData.user.app_metadata as any)?.role || (authData.user as any)?.role;
  if (role !== "admin" && role !== "super_admin") {
    return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
      status: 403,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Parse body
  let body: { payoutRequestId?: string; action?: Action; note?: string };
  try {
    body = await req.json();
  } catch (_) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const { payoutRequestId, action, note } = body;
  if (!payoutRequestId || (action !== "approve" && action !== "reject")) {
    return new Response(JSON.stringify({ error: "Missing or invalid parameters" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Fetch payout request
  const { data: payout, error: payoutErr } = await supabase
    .from("payout_requests")
    .select("id, user_id, status")
    .eq("id", payoutRequestId)
    .single();

  if (payoutErr || !payout) {
    return new Response(JSON.stringify({ error: "Payout request not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (payout.status !== "pending") {
    return new Response(JSON.stringify({ error: "Payout request already processed" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Determine new statuses
  const newPayoutStatus = action === "approve" ? "approved" : "rejected";
  const newPaymentStatus = action === "approve" ? "approved" : "pending";

  // 1) Update payout_requests row
  const { error: updatePayoutErr } = await supabase.from("payout_requests").update({
    status: newPayoutStatus,
    processed_at: new Date().toISOString(),
    admin_id: authData.user.id,
    note,
  })
  .eq("id", payoutRequestId);

  if (updatePayoutErr) {
    console.error("update payout error", updatePayoutErr);
    return new Response(JSON.stringify({ error: "Failed to update payout request" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // 2) Update related payment_records
  const { error: updatePaymentsErr } = await supabase
    .from("payment_records")
    .update({ payout_status: newPaymentStatus, payout_date: action === "approve" ? new Date().toISOString() : null })
    .eq("user_id", payout.user_id)
    .eq("payout_status", "pending");

  if (updatePaymentsErr) {
    console.error("update payments error", updatePaymentsErr);
    return new Response(JSON.stringify({ error: "Failed to update payment records" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}); 