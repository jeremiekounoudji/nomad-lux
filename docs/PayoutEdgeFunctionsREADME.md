# Payout Edge Functions API

## Overview
This document describes the two edge functions used to manage host payout requests:

1. `requestPayout` – called by hosts to create a payout request.
2. `approvePayout` – called by admins to approve or reject a payout request.

All functions require a valid Supabase JWT (verify_jwt = true). Responses are JSON.

---

## 1. `requestPayout`

|               |                                  |
|---------------|----------------------------------|
| **URL**       | `POST /functions/v1/requestPayout` |
| **Auth**      | Host must be logged-in (`role = user` / default) |
| **Payload**   | `{ "amount": number }` *(optional)* – If omitted, full eligible `payout_balance` is requested |
| **Success**   | `201 Created`<br>`{ success: true, payoutRequest: PayoutRequest }` |
| **Validation Rules** | • `payout_balance` ≥ `minimumPayoutAmount` (admin setting)<br>• `amount` must be > 0 and ≤ `payout_balance` |
| **Failure Responses** | `400` validation errors, `401` unauthorized, `404` wallet not found, `500` server error |
| **Side-effects** | • Inserts row in `payout_requests` with `status = 'pending'`<br>• Links eligible `payment_records` to request via RPC `link_payment_records_to_payout` |

### Example
```bash
curl -X POST \
  -H "Authorization: Bearer <JWT>" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 250 }' \
  https://<project>.functions.supabase.co/requestPayout
```

---

## 2. `approvePayout`

|               |                                  |
|---------------|----------------------------------|
| **URL**       | `POST /functions/v1/approvePayout` |
| **Auth**      | Admin (`role = admin` or `super_admin`) |
| **Payload**   | `{ "payoutRequestId": string, "action": "approve" | "reject", "note": string? }` |
| **Success**   | `200 OK` → `{ success: true }` |
| **Failure Responses** | `400` invalid params or already processed<br>`401` unauthorized<br>`403` forbidden<br>`404` not found<br>`500` server error |
| **Side-effects** | • Updates `payout_requests.status` to `approved` or `rejected`<br>• Updates linked `payment_records.payout_status` to `approved` (or reverts to `pending` on reject) |

### Example (approve)
```bash
curl -X POST \
  -H "Authorization: Bearer <ADMIN_JWT>" \
  -H "Content-Type: application/json" \
  -d '{ "payoutRequestId": "<uuid>", "action": "approve", "note": "Manual payout completed" }' \
  https://<project>.functions.supabase.co/approvePayout
```

---

## Error Schema
```
{
  "error": string // Human-readable message
}
```

---

## Versioning
Both functions are deployed via Supabase MCP (`mcp_supabase_deploy_edge_function`) and start at **version 1**.

---

## Change Log
* 2025-07-08 – Initial release (version 1) 