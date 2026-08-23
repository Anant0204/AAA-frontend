import { jsPDF } from 'jspdf';
import dayjs from 'dayjs';

/**
 * Generates and downloads an official AAA Business Consultancy Letterhead Payment Receipt PDF
 */
export const downloadLetterheadReceiptPDF = (inv, showAlert) => {
  try {
    const doc = new jsPDF();
    const invoiceId = inv.invoiceNumber || (inv.id ? `TRN-${inv.id.replace(/-/g, '').slice(0, 8).toUpperCase()}` : 'TRN-00000000');
    const paymentDate = inv.billingDate || inv.createdAt
      ? (dayjs(inv.billingDate || inv.createdAt).isValid() ? dayjs(inv.billingDate || inv.createdAt).format('DD/MM/YYYY') : String(inv.billingDate || inv.createdAt))
      : dayjs().format('DD/MM/YYYY');
    
    const clientName = inv.clientName || 'Valued Client';
    const customerId = inv.clientCode || inv.client?.clientCode || 'N/A';
    const serviceName = inv.serviceId ? String(inv.serviceId).toUpperCase() : 'SPAIN RELOCATION LEGAL PACKAGE';
    const paymentMethod = inv.paymentMethod || 'Stripe';
    const transactionRef = inv.transactionId || `TXN-${Date.now()}`;
    
    const baseAmount = Number(inv.amount) || 0;
    const discountAmount = Number(inv.discount) || 0;
    const totalPaid = Number(inv.totalPaid) || (baseAmount - discountAmount);

    // ==================== 1. LETTERHEAD HEADER ====================
    // Company Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(12, 35, 64); // Deep Navy (#0C2340)
    doc.text('AAA BUSINESS CONSULTANCY L.L.C', 14, 20);

    // Tagline
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(197, 155, 39); // Gold (#C59B27)
    doc.text('ADVISE  *  ASSIST  *  ACHIEVE', 14, 26);

    // Address & Contact Information
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // Slate Gray (#64748B)
    doc.text('Business Village B, Office F-09, Port Saeed, Deira, Dubai, UAE', 14, 32);
    doc.text('Email: info@aaabusinessconsultancy.com | Tel: +971 50 955 4142', 14, 37);

    // Top Gold Accent Line
    doc.setDrawColor(197, 155, 39); // Gold (#C59B27)
    doc.setLineWidth(1.2);
    doc.line(14, 42, 196, 42);

    // Second Navy Sub-Line
    doc.setDrawColor(12, 35, 64);
    doc.setLineWidth(0.4);
    doc.line(14, 44, 196, 44);

    // ==================== 2. DOCUMENT TITLE & RECEIPT META ====================
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(12, 35, 64);
    doc.text('OFFICIAL PAYMENT RECEIPT', 14, 55);

    // Status Badge (PAID)
    doc.setFillColor(22, 163, 74); // Success Green (#16A34A)
    doc.roundedRect(165, 49, 31, 8, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PAID', 175.5, 54.5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Receipt ID: #${invoiceId}`, 14, 63);
    doc.text(`Payment Date: ${paymentDate}`, 14, 69);
    doc.text(`Payment Gateway: ${paymentMethod}`, 130, 63);
    doc.text(`Txn Ref: ${transactionRef.length > 25 ? transactionRef.slice(0, 25) + '...' : transactionRef}`, 130, 69);

    // ==================== 3. CLIENT INFORMATION BOX ====================
    doc.setFillColor(248, 250, 252); // Light Gray/Blue (#F8FAFC)
    doc.setDrawColor(226, 232, 240); // Border (#E2E8F0)
    doc.setLineWidth(0.5);
    doc.roundedRect(14, 76, 182, 24, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(197, 155, 39);
    doc.text('RECEIPT ISSUED TO:', 19, 83);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(clientName, 19, 90);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Customer ID: ${customerId}`, 19, 95);

    doc.text(`Service Requested: ${serviceName}`, 115, 90);
    doc.text(`Status: Payment Successfully Processed & Confirmed`, 115, 95);

    // ==================== 4. ITEMIZED BREAKDOWN TABLE ====================
    // Table Header Bar (Navy)
    doc.setFillColor(12, 35, 64); // Navy (#0C2340)
    doc.rect(14, 108, 182, 8, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Description / Service Item', 19, 113.5);
    doc.text('Amount (€)', 170, 113.5);

    // Table Content Line 1 (Base Service Fee)
    let currentY = 124;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const serviceDesc = `Residency & Legal Processing Fee (${serviceName})`;
    doc.text(serviceDesc.length > 55 ? serviceDesc.slice(0, 55) + '...' : serviceDesc, 19, currentY);
    doc.text(`€${baseAmount.toFixed(2)}`, 170, currentY);

    if (discountAmount > 0) {
      currentY += 8;
      doc.setTextColor(22, 163, 74); // Green for discount
      doc.text('Promotional Discount Applied', 19, currentY);
      doc.text(`-€${discountAmount.toFixed(2)}`, 170, currentY);
    }

    currentY += 6;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, currentY, 196, currentY);

    // ==================== 5. TOTALS BANNER ====================
    currentY += 8;
    doc.setFillColor(12, 35, 64); // Dark Navy Banner (#0C2340)
    doc.roundedRect(110, currentY, 86, 14, 3, 3, 'F');

    // Left Accent Strip on Banner
    doc.setFillColor(197, 155, 39); // Gold
    doc.roundedRect(110, currentY, 3, 14, 1, 1, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL PAID (NET):', 117, currentY + 9);

    doc.setFontSize(12);
    doc.setTextColor(250, 204, 21); // Gold text (#FACC15)
    doc.text(`€${totalPaid.toFixed(2)}`, 165, currentY + 9);

    // ==================== 6. LETTERHEAD FOOTER GRAPHICS ====================
    // Decorative Bottom Lines
    const footerY = 268;
    doc.setDrawColor(197, 155, 39); // Gold Accent Line
    doc.setLineWidth(1.2);
    doc.line(14, footerY, 196, footerY);

    doc.setDrawColor(12, 35, 64); // Navy Line
    doc.setLineWidth(2.5);
    doc.line(14, footerY + 2, 196, footerY + 2);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Thank you for choosing AAA Business Consultancy for your Spain Relocation journey.', 14, footerY + 9);
    doc.text('This is an official computer-generated receipt. No physical signature is required.', 14, footerY + 14);

    doc.save(`Official-Receipt-${invoiceId}.pdf`);
    if (showAlert) showAlert('Official Letterhead Receipt PDF downloaded successfully!', 'success');
  } catch (err) {
    console.error('Error generating letterhead receipt PDF:', err);
    if (showAlert) showAlert('Failed to generate PDF receipt.', 'error');
  }
};
