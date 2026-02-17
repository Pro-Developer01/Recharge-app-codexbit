# UPI Payment Integration – R&D Document

**Project:** Mobile Recharge App  
**Date:** February 2025  
**Scope:** Payment flow, gateway alternatives, and provider comparison for India UPI.

---

## 1. Initial Issue: In-App Pop-up (PhonePe / Paytm)

### What Was Observed
- When paying via **PhonePe** or **Paytm**, a pop-up appears:  
  *"You can pay up to ₹2,000 with QR codes via gallery. For more, pay with mobile number or scan QR code."*
- Screen shows: Pay screen with recipient (e.g. SHASHANK YADAV, 8948492799@upi), amount (e.g. ₹1), message "Test Payment", and a **DISMISS** button.

### Root Cause
- **The pop-up is from the UPI app (PhonePe/Paytm), not from our app.**
- Our app only opens the payment app via a standard UPI deep link (`upi://pay?pa=...&pn=...&am=...`).
- We cannot remove or change this dialog from our codebase.

### Action
- User can tap **DISMISS** and continue; for small amounts (e.g. ₹1) this is informational only.
- Optional: add in-app copy such as: *"When the payment app opens, you may see an info message; tap DISMISS to continue."*

---

## 2. Desired Flow for Recharge App

- User selects amount and a UPI app (from installed apps).
- User completes UPI payment in that app.
- **Our backend** gets a **reliable confirmation** (success/failure) from a trusted source.
- On **success**, backend calls the **recharge API** and then we show status in the app (polling/API/push).

Important: **Confirmation must come from server-side (e.g. webhook), not from the UPI app or deep link alone.**

---

## 3. Industry-Standard Approach (With Payment Gateway)

| Step | Responsibility |
|------|----------------|
| 1 | App asks backend to create payment (amount, order_id). |
| 2 | Backend creates order with **payment gateway**, gets payment/UPI link. |
| 3 | App opens UPI link; user chooses Paytm/PhonePe/GPay and pays. |
| 4 | Gateway receives result from bank/UPI and sends **webhook** to our backend. |
| 5 | Backend treats webhook as source of truth; on success → calls **recharge API**. |
| 6 | App gets status from **our backend** (polling / status API / push). |

**Why this is standard:** We only trigger recharge when the gateway (and thus the bank/UPI) has confirmed payment. We do not rely on the UPI app or deep link for final confirmation.

**Drawback:** Most gateways charge **per-transaction fees** (e.g. ~2% + GST), which reduce margin. So we explored **free / low-cost** options.

---

## 4. Options Without (or With Minimal) Gateway Fees

### 4.1 Skip Gateway Entirely (Direct UPI)

- Use our own UPI ID and build:  
  `upi://pay?pa=OUR_UPI&pn=...&am=...&tr=ORDER_REF`
- Money goes **directly to our bank** → **zero gateway fees**.
- **Problem:** We need **automated confirmation** to safely call the recharge API.

**Ways to get confirmation without a gateway:**

| Method | How it works | Real-time? | Suitable for recharge? |
|--------|----------------|------------|-------------------------|
| **Bank webhook/API** | Bank notifies our backend when UPI credit hits our account. | Yes | Only if our bank offers this (e.g. some merchant APIs). |
| **Manual reconciliation** | Match bank statement with order list using reference. | No | No – not instant recharge. |
| **SMS-based** | Service reads UPI credit SMS and calls our backend. | Near real-time | Possible but fragile (SMS delays, formats). |

**Conclusion:** Skipping the gateway is free, but reliable automated confirmation usually needs either **bank API** or a **thin third-party layer** (see below).

### 4.2 Zero-Fee / No-Commission Layers

These charge **0% per transaction** and either **no** or **low fixed/monthly** fees. They provide **confirmation** (webhook/API) so we can safely trigger recharge.

- **UroPay** – 0% commission; webhook when payment is detected (SMS-based via companion app).
- **Bharat UPI** – 0% MDR, 0% txn fee (claimed); confirm webhook/API on their site.
- **JustUPI** – 0% transaction fee; monthly plans (e.g. ₹599+); webhooks and reconciliation.

### 4.3 Direct UPI + Bank’s Own API

- Some banks (e.g. HSBC India) offer **merchant UPI API** with **post-credit notification** to our server.
- Flow: direct UPI link → user pays → **bank** sends webhook to our backend → we map reference to order and call recharge API.
- **Zero gateway + zero extra fee + automated confirmation**, if our bank supports it.

---

## 5. Provider Comparison (Charges, Features, Docs, Developer Experience)

### 5.1 Charges

| Provider      | Per-transaction fee | Other cost |
|---------------|---------------------|------------|
| **UroPay**    | **0%**              | Free (15 txns/mo), ₹100/mo (200 txns), ₹1000/mo (unlimited) |
| **JustUPI**   | **0%**              | ₹599–9,999/mo by plan (QR request limits) |
| **Bharat UPI**| **0%** (claimed)   | Check bharatupi.com |
| **Razorpay**  | ~2% platform fee + 18% GST on UPI | No setup/AMC |
| **Juspay**    | Often 0% on UPI (MDR); commercial terms | Enterprise |
| **Stripe (India)** | ~2% (e.g. cards); UPI varies | Per-txn |
| **Adyen**     | Interchange++       | Per-txn, no monthly/setup |

### 5.2 Features (Relevant to Recharge)

| Provider    | UPI intent / deep link | Webhook / confirmation | Direct to our bank |
|-------------|------------------------|-------------------------|---------------------|
| **UroPay**  | ✅ (API returns `upiString` + QR) | ✅ (SMS-based) | ✅ |
| **JustUPI** | ✅ Direct UPI intent, all UPI apps | ✅ Webhooks, reconciliation | ✅ |
| **Bharat UPI** | ✅ Dynamic QR, links | ✅ (verify on site) | ✅ |
| **Razorpay** | ✅ Full UPI stack | ✅ Rich webhooks | ❌ (via gateway) |
| **Stripe**  | ✅ UPI (QR + redirect) | ✅ Webhooks | ❌ (via Stripe) |
| **Adyen**   | ✅ UPI | ✅ Webhooks | ❌ (via Adyen) |

### 5.3 Documentation & Developer-Friendliness

| Provider     | Docs quality | Notes |
|--------------|--------------|--------|
| **UroPay**   | **Good**     | Single doc: 3 endpoints (`/order/generate`, `/order/update`, `/order/status`), webhook (payload, headers, HMAC-SHA256), auth (API key + SHA-512 secret), examples (Node/PHP/Python), rate limits. Simple and sufficient to integrate. |
| **JustUPI**  | **Moderate** | Features and plans clear; full API docs typically post-signup. |
| **Bharat UPI** | **Unclear** | bharatupi.com is marketing; BharatX (developer.bharatx.tech) is a different company. Confirm official API on bharatupi.com. |
| **Razorpay** | **Excellent** | Best-in-class APIs, webhooks, testing, SDKs. |
| **Juspay**   | **Very good** | docs.juspay.in – structured, UPI flows. |
| **Stripe**   | **Excellent** | stripe.com/docs – global standard. |
| **Adyen**    | **Excellent** | docs.adyen.com – enterprise. |

### 5.4 UroPay Specifics (Summary)

- **Confirmation:** Android companion app reads UPI credit SMS → UroPay API → **webhook** to our backend.
- **Constraint:** One Android device with UroPay app must receive UPI credit SMS (and app running) for automation.
- **Pricing:** Free (15 txns), Growth ₹100/mo (200 txns), Unlimited ₹1000/mo.
- **API:** `https://api.uropay.me` – generate order (get `upiString`/QR), update order (optional, with UPI ref), get order status; webhook for payment confirmation.

---

## 6. Recommendation

**For a recharge app in India with minimal/zero gateway cost and automated confirmation:**

1. **First choice: UroPay**  
   - 0% per transaction, clear docs, 3 endpoints + webhook, developer-friendly.  
   - Accept companion app + one Android device for SMS-based confirmation.  
   - Start with Free or Growth (₹100/mo).

2. **If companion app is not acceptable: JustUPI**  
   - 0% per txn, webhooks, no SMS dependency; verify API docs and monthly cost (₹599+).

3. **If we have bank merchant UPI API: Direct UPI + bank webhook**  
   - No gateway, no extra fee, automated confirmation from bank.

4. **For maximum reliability and we accept fees: Razorpay or Juspay**  
   - Best docs and infrastructure; Razorpay charges ~2% + GST on UPI.

5. **Europe (Stripe / Adyen)**  
   - Use when we need international or multi-currency; not optimal for India-only UPI recharge.

---

## 7. References (Summary)

- Direct UPI (no gateway): dynamic QR / deep link; reconciliation via bank API or manual/SMS.
- Zero-fee / low-cost: UroPay, JustUPI, Bharat UPI (confirm API/webhook on each site).
- Bank: Check with our business bank for “UPI merchant API” or “payment notification webhook.”
- UroPay: uropay.me/documentation, uropay.me/pricing, uropay.me/faq.
- JustUPI: justupi.com (plans, 0% txn fee).
- Bharat UPI: bharatupi.com (0% MDR/txn fee; confirm developer docs).
- Razorpay: razorpay.com/docs (pricing, webhooks).