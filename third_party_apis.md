# AAA Business Consultancy CRM — Required Third-Party APIs

This document outlines the list of third-party APIs needed to implement the CRM automation, payments, messaging, AI, storage, and video conference integrations.

---

## 1. Messaging & Communication APIs

| API / Provider | Type | Purpose / Workflow Phase | Description |
| :--- | :--- | :--- | :--- |
| **Meta WhatsApp Cloud API** | Official Messaging API | Phase 1, 2, 3, 6, 8, 9, 10, 11 | For automated WhatsApp alerts (Assessment bookings, 24h/1h/10m reminders, no-show notifications, payment drip alerts, and agent two-way chat inbox). |
| **Amazon SES (Simple Email Service)** *or* **SendGrid API** | Transactional Email API | Phase 3, 6, 9, 10, 11 | For high-volume automated email delivery (Meeting confirmations, CEO drip marketing emails, invoices, and password reset instructions) avoiding spam filters. |

---

## 2. Artificial Intelligence & Analytics APIs

| API / Provider | Type | Purpose / Workflow Phase | Description |
| :--- | :--- | :--- | :--- |
| **Google Gemini API** *or* **OpenAI API (GPT-4o)** | Generative AI SDK | Phase 11 (AI Assistant) | For dynamic client profile analysis. Reads emails, WhatsApp logs, S3 meeting transcripts, and uploaded documents to output objective summary cards (success probability, risk concerns). |

---

## 3. Payment Processing & Gateways

| API / Provider | Type | Purpose / Workflow Phase | Description |
| :--- | :--- | :--- | :--- |
| **Stripe API** | Payment Gateway | Phase 8 & 9 | Processes secure debit/credit cards (Visa, Mastercard), Apple Pay, Google Pay, and Link Wallet, and uses Stripe Webhooks to update invoices automatically. |
| **Tabby API** | Buy Now Pay Later (BNPL) | Phase 8 & 9 | Enables UAE residents to pay for relocation packages in 4 monthly interest-free installments. |
| **Tamara API** | Buy Now Pay Later (BNPL) | Phase 8 & 9 | Alternative installment payment gateway popular in the GCC (UAE/KSA) region. |

---

## 4. Storage & Backups (Cloud Infrastructure)

| API / Provider | Type | Purpose / Workflow Phase | Description |
| :--- | :--- | :--- | :--- |
| **Amazon Web Services (AWS) S3** | Cloud Object Storage | Phase 5, 9, 11 | Permanent storage for client-uploaded documents (checklists, passports, bank records) and Zoom/Meet call audio recordings. Implements immutable compliance locks. |

---

## 5. Video Consultation & Recording APIs

| API / Provider | Type | Purpose / Workflow Phase | Description |
| :--- | :--- | :--- | :--- |
| **Zoom Meeting API** *or* **Google Meet API (Google Workspace)** | Video Conferencing | Phase 5 & 6 | Automatically creates meeting URLs on booking confirmation, starts cloud recording, and provides webhook notifications when audio file uploads are ready. |

---

## 6. Security & Identity Verification

| API / Provider | Type | Purpose / Workflow Phase | Description |
| :--- | :--- | :--- | :--- |
| **Fingerprint Pro API (FingerprintJS)** | Device Fingerprinting | Phase 2 (Booking Link) | Captures unique device identifiers to enforce booking lock-outs, preventing blacklisted users (No-Shows) from rebooking using fake numbers or emails. |














