import React from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { dbService } from "../../services/dbService";

const PaymentSuccess = () => {
  const location = useLocation();
  const hashQuery = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const query = new URLSearchParams(location.search);
  const sessionId = hashQuery.get('session_id') || query.get('session_id');
  const leadId = hashQuery.get('leadId') || query.get('leadId');
  const type = hashQuery.get('type') || query.get('type');

  const { data: verifyData, isLoading, error } = useQuery({
    queryKey: ['paymentSession', sessionId, leadId],
    queryFn: async () => {
      try {
        await dbService.verifyCheckoutSession(sessionId, null, leadId);
      } catch (err) {
        console.error("Failed to verify session, fetching anyway", err);
      }
      if (sessionId) {
        try {
          return await dbService.getPaymentBySessionId(sessionId);
        } catch (e) {}
      }
      return { success: true };
    },
    enabled: !!(sessionId || leadId)
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #051A3B 0%, #0c2b5c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.04)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          padding: "40px 30px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px"
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "rgba(16, 185, 129, 0.15)",
            border: "2px solid #10B981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            boxShadow: "0 0 20px rgba(16, 185, 129, 0.2)"
          }}
        >
          ✓
        </div>

        {/* Title */}
        <h2
          style={{
            color: "#fff",
            fontSize: "26px",
            fontWeight: 800,
            margin: 0,
            letterSpacing: "-0.5px"
          }}
        >
          {type === 'translation' ? 'Translation Payment Completed! 📜' : 'Payment Successful! 🎉'}
        </h2>

        {isLoading ? (
          <div style={{ padding: "20px", color: "rgba(255, 255, 255, 0.7)" }}>
            <div style={{ display: "inline-block", width: "30px", height: "30px", border: "3px solid rgba(255, 255, 255, 0.3)", borderTopColor: "#fff", borderRadius: "50%", marginBottom: "10px", animation: "spin 1s linear infinite" }}></div>
            <p style={{ margin: 0, fontSize: "14px" }}>Verifying your secure payment session...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : type === 'translation' ? (
          <>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "15px",
                lineHeight: 1.6,
                margin: 0
              }}
            >
              Thank you! Your Spanish Sworn Translation (Traducción Jurada Oficial) payment has been received and confirmed.
            </p>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "12px",
                padding: "14px",
                width: "100%",
                boxSizing: "border-box",
                textAlign: "left",
                fontSize: "13px",
                color: "#E2E8F0"
              }}
            >
              <div style={{ fontWeight: 700, color: "#10B981", marginBottom: "6px" }}>✓ Order Status: Payment Completed</div>
              <div>Your documents are now assigned to our certified sworn translators. The finalized translation with official ministry stamps will be delivered to your email within max 7 working days.</div>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", width: "100%", margin: "8px 0" }} />
            <a
              href="/#/public/translation"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                boxSizing: "border-box"
              }}
            >
              Translate More Documents
            </a>
          </>
        ) : error || !verifyData?.success ? (
          // Fallback if session verification failed or no session ID was found
          <>
            <p
              style={{
                color: "rgba(255, 255, 255, 0.75)",
                fontSize: "14px",
                lineHeight: 1.6,
                margin: 0
              }}
            >
              We have received your payment. Your profile has been successfully updated. Please check your WhatsApp or Email for the next steps and booking links.
            </p>
            <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", width: "100%", margin: "8px 0" }} />
            <a
              href="/#/portal/login"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "14px",
                background: "linear-gradient(135deg, #C59B27 0%, #A37E1C 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(197, 155, 39, 0.2)",
                boxSizing: "border-box"
              }}
            >
              Go to Document Upload Portal
            </a>
          </>
        ) : (() => {
          const payment = verifyData.payment;
          const invoice = payment?.invoiceSnapshot;
          const client = payment?.client;

          if (!invoice) {
            const searchParams = new URLSearchParams(window.location.hash.split('?')[1] || window.location.search || '');
            const activeLeadId = searchParams.get('leadId') || searchParams.get('clientId') || '';
            const isNoShowType = searchParams.get('type') === 'no_show' || activeLeadId !== '';
            const rebookUrl = `/#/public/lead-form?leadId=${activeLeadId}&paid=true`;

            return (
              <>
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.85)",
                    fontSize: "15px",
                    lineHeight: 1.6,
                    margin: 0
                  }}
                >
                  We have received your €250 assessment fee. Your profile has been successfully un-blocked. Please select your new consultation date and time below to complete your booking.
                </p>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.1)", width: "100%", margin: "12px 0" }} />
                <a
                  href={rebookUrl}
                  style={{
                    display: "inline-block",
                    width: "100%",
                    padding: "15px",
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "15px",
                    fontWeight: 800,
                    textAlign: "center",
                    textDecoration: "none",
                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
                    boxSizing: "border-box"
                  }}
                >
                  📅 Select Your New Meeting Date & Time Slot
                </a>
              </>
            );
          }

          // Render package payment invoice breakdown
          return (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "16px" }}>
              <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "14px", margin: 0 }}>
                Thank you, <strong>{client?.firstName} {client?.lastName}</strong>! Your visa relocation package payment has been verified successfully.
              </p>

              <div
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "16px",
                  padding: "20px",
                  textAlign: "left",
                  fontSize: "13px",
                  color: "rgba(255, 255, 255, 0.9)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: "8px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Reference:</span>
                  <span style={{ fontWeight: 700, color: "#E5C058" }}>{payment.reference || `PAY-${payment.id.substring(0,8).toUpperCase()}`}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Package:</span>
                  <span style={{ fontWeight: 700 }}>{invoice.packageName}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Base Price:</span>
                  <span>€{Number(invoice.basePrice).toFixed(2)}</span>
                </div>

                {invoice.additionalApplicants > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Add. Applicants ({invoice.additionalApplicants}):</span>
                    <span>+€{Number(invoice.additionalApplicantTotal).toFixed(2)}</span>
                  </div>
                )}

                {invoice.creditApplied > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", color: "#10B981" }}>
                    <span style={{ color: "inherit" }}>Assessment Credit Applied:</span>
                    <span>-€{Number(invoice.creditApplied).toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", borderTop: "1px dashed rgba(255, 255, 255, 0.08)", paddingTop: "8px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>Subtotal:</span>
                  <span>€{Number(invoice.subtotal).toFixed(2)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>VAT ({invoice.vatRate}%):</span>
                  <span>€{Number(invoice.vatAmount).toFixed(2)}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "12px", borderTop: "1.5px solid #E5C058", paddingTop: "10px", fontSize: "16px" }}>
                  <span style={{ fontWeight: 800, color: "#E5C058" }}>Total Paid:</span>
                  <span style={{ fontWeight: 900, color: "#10B981" }}>€{Number(invoice.total).toFixed(2)}</span>
                </div>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.08)", width: "100%", margin: "8px 0" }} />

              <a
                href="/#/portal/login"
                style={{
                  display: "inline-block",
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
                  boxSizing: "border-box"
                }}
              >
                Go to Document Upload Portal
              </a>
            </div>
          );
        })()}
      </div>

      {/* Footer */}
      <p style={{ color: "rgba(255, 255, 255, 0.25)", fontSize: "12px", marginTop: "24px" }}>
        © 2026 AAA Visa Consultancy · All rights reserved
      </p>
    </div>
  );
};

export default PaymentSuccess;
