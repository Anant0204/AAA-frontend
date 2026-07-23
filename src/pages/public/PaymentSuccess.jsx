import React from "react";

const PaymentSuccess = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c1b 0%, #24243e 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "48px 36px",
          maxWidth: "500px",
          width: "100%",
          boxShadow: "0 30px 60px rgba(0, 0, 0, 0.5)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "24px"
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.15)",
            border: "2px solid #22c55e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "40px",
            boxShadow: "0 0 20px rgba(34, 197, 94, 0.2)"
          }}
        >
          ✅
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
          Payment Successful! 🎉
        </h2>

        {/* Description */}
        <p
          style={{
            color: "rgba(255, 255, 255, 0.75)",
            fontSize: "15px",
            lineHeight: 1.6,
            margin: 0
          }}
        >
          We have received your €250 assessment fee. Your profile has been successfully un-blocked. Please check your WhatsApp or Email for your secure re-booking link to choose your new consultation slot.
        </p>

        {/* Divider */}
        <hr style={{ border: "none", borderTop: "1px solid rgba(255, 255, 255, 0.1)", width: "100%", margin: "8px 0" }} />

        {/* Action Button */}
        <a
          href="/#/portal/login"
          style={{
            display: "inline-block",
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          Go to Document Upload Portal
        </a>
      </div>

      {/* Footer */}
      <p style={{ color: "rgba(255, 255, 255, 0.3)", fontSize: "12px", marginTop: "24px" }}>
        © 2026 AAA Visa Consultancy · All rights reserved
      </p>
    </div>
  );
};

export default PaymentSuccess;
