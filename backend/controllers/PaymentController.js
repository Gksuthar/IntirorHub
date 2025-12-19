import Payment from '../models/paymentModel.js';
import Site from '../models/siteModel.js';
import User from '../models/userModel.js';
import { sendEmail } from '../utils/emailService.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Add a new payment
export const addPayment = async (req, res) => {
  try {
    const { title, description, amount, dueDate, siteId } = req.body;
    
    // Verify user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can add payments' });
    }
    
    // Verify site exists and belongs to user's company
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    if (site.companyName !== req.user.companyName) {
      return res.status(403).json({ message: 'Site does not belong to your company' });
    }
    
    const payment = new Payment({
      title,
      description,
      amount,
      dueDate,
      siteId,
      createdBy: req.user._id,
      companyName: req.user.companyName
    });
    
    payment.updateStatus();
    await payment.save();
    
    res.status(201).json({
      message: 'Payment added successfully',
      payment
    });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ message: 'Error adding payment', error: error.message });
  }
};

// Get all payments for a site
export const getPaymentsBySite = async (req, res) => {
  try {
    const { siteId } = req.params;
    
    // Verify site access
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }
    
    // Check if user has access to this site
    const hasAccess = site.companyName === req.user.companyName ||
                      (req.user.siteAccess && req.user.siteAccess.some(id => id.toString() === siteId));
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this site' });
    }
    
    const payments = await Payment.find({ siteId })
      .populate('createdBy', 'name email')
      .sort({ dueDate: -1 });
    
    // Update status for each payment
    payments.forEach(payment => payment.updateStatus());
    await Promise.all(payments.map(payment => payment.save()));
    
    res.json({ payments });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Mark payment as paid
export const markAsPaid = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Verify user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admin can mark payments as paid' });
    }
    
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Verify payment belongs to user's company
    if (payment.companyName !== req.user.companyName) {
      return res.status(403).json({ message: 'Payment does not belong to your company' });
    }
    
    payment.status = 'paid';
    payment.paidDate = new Date();
    await payment.save();
    
    res.json({
      message: 'Payment marked as paid',
      payment
    });
  } catch (error) {
    console.error('Error marking payment as paid:', error);
    res.status(500).json({ message: 'Error marking payment as paid', error: error.message });
  }
};

// Send payment reminder
export const sendReminder = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only admin and manager can send reminders' });
    }

    const payment = await Payment.findById(paymentId).populate('siteId');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.companyName !== req.user.companyName) {
      return res.status(403).json({ message: 'Payment does not belong to your company' });
    }
    
    const clients = await User.find({
      companyName: payment.companyName,
      role: 'CLIENT',
      siteAccess: payment.siteId._id
    });
    
    for (const client of clients) {
      console.log(client)
      const emailHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Reminder</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px;">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">SITEZERO</h1>
                      <p style="margin: 10px 0 0 0; color: #cccccc; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Interior Management Services</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 35px;">
                      <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 22px; font-weight: 600;">Dear ${client.name},</h2>
                      
                      <p style="margin: 0 0 25px 0; color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                        We hope this message finds you well. As we continue to bring your vision to life, we'd like to remind you of an outstanding payment for your project. Your prompt attention ensures seamless progress and maintains our commitment to excellence.
                      </p>
                      
                      <!-- Payment Details Box -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; border-left: 4px solid #1a1a1a; margin: 30px 0;">
                        <tr>
                          <td style="padding: 30px 25px;">
                            <h3 style="margin: 0 0 20px 0; padding-bottom: 15px; border-bottom: 2px solid #1a1a1a; color: #1a1a1a; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">Payment Details</h3>
                            
                            <!-- Payment Rows -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                  <table width="100%">
                                    <tr>
                                      <td style="color: #666666; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Site Project</td>
                                      <td align="right" style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${payment.siteId.name}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                  <table width="100%">
                                    <tr>
                                      <td style="color: #666666; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Payment Title</td>
                                      <td align="right" style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${payment.title}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                  <table width="100%">
                                    <tr>
                                      <td style="color: #666666; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Description</td>
                                      <td align="right" style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${payment.description}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                  <table width="100%">
                                    <tr>
                                      <td style="color: #666666; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</td>
                                      <td align="right" style="color: #1a1a1a; font-size: 14px; font-weight: 500;">${new Date(payment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
                                  <table width="100%">
                                    <tr>
                                      <td style="color: #666666; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Status</td>
                                      <td align="right">
                                        <span style="display: inline-block; padding: 4px 12px; background-color: #1a1a1a; color: #ffffff; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">${payment.status}</span>
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                              
                              <tr>
                                <td style="padding: 20px 0 0 0; border-top: 2px solid #1a1a1a;">
                                  <table width="100%">
                                    <tr>
                                      <td style="color: #666666; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Amount Due</td>
                                      <td align="right" style="color: #1a1a1a; font-size: 26px; font-weight: 700;">₹${payment.amount.toLocaleString('en-IN')}</td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 35px 0;">
                        <tr>
                          <td align="center">
                            <a href="https://designer.zantatech.com/" style="display: inline-block; padding: 16px 50px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">MAKE PAYMENT</a>
                          </td>
                        </tr>
                      </table>
                      
                      <p style="margin: 30px 0 0 0; color: #4a4a4a; font-size: 15px; line-height: 1.6;">
                        Should you have any questions or require assistance, please don't hesitate to reach out. We value your partnership and look forward to continuing our work together.
                      </p>
                      
                      <!-- Signature -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td>
                            <p style="margin: 0; color: #1a1a1a; font-size: 16px; font-weight: 700;">${req.user.name}</p>
                            <p style="margin: 3px 0 0 0; color: #666666; font-size: 13px;">Project Manager</p>
                            <p style="margin: 3px 0 0 0; color: #999999; font-size: 13px; font-weight: 600;">SiteZero Interiors</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f5f5f5; padding: 30px 35px; text-align: center; border-top: 1px solid #e0e0e0;">
                      <p style="margin: 0; color: #666666; font-size: 12px;">© 2025 SiteZero Interiors. All rights reserved.</p>
                      <p style="margin: 15px 0 0 0;">
                        <a href="https://designer.zantatech.com/support" style="color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 10px;">Support</a>
                        <a href="https://designer.zantatech.com/privacy" style="color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 10px;">Privacy</a>
                        <a href="https://designer.zantatech.com/terms" style="color: #1a1a1a; text-decoration: none; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 10px;">Terms</a>
                      </p>
                    </td>
                  </tr>
                  
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;
      
      await sendEmail(
        client.email,
        `Payment Reminder - ${payment.title}`,
        emailHtml
      );
    }
    
    res.json({
      message: `Reminder sent to ${clients.length} client(s)`,
      clientCount: clients.length
    });
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Error sending reminder', error: error.message });
  }
};

export const downloadInvoice = async (req, res) => {
  let doc = null;
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId).populate('siteId');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    if (payment.companyName !== req.user.companyName) {
      return res.status(403).json({ message: 'Payment does not belong to your company' });
    }
    
    doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      layout: 'portrait'
    });
    
    // Normalize payment id to string to avoid ObjectId method issues
    const paymentIdStr = payment._id.toString();
    const invoiceNumber = `INV-${paymentIdStr.slice(-8).toUpperCase()}`;

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}.pdf`);

    doc.pipe(res);
    
    // ============== ELEGANT COLOR PALETTE ==============
    const colors = {
      primary: '#1a1a2e',       // Deep navy
      secondary: '#16213e',     // Dark blue
      accent: '#c9a227',        // Gold accent
      gold: '#d4af37',          // Classic gold
      text: '#2d3436',          // Dark text
      textLight: '#636e72',     // Light text
      border: '#dfe6e9',        // Light border
      background: '#fafafa',    // Light background
      white: '#ffffff',
      success: '#27ae60',       // Green for paid
      warning: '#f39c12',       // Orange for pending
      danger: '#e74c3c'         // Red for overdue
    };

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 40;
    const contentWidth = pageWidth - (margin * 2);

    // Helper function to format amount in Indian style without locale issues
    const formatAmount = (amount) => {
      const num = Number(amount);
      if (isNaN(num)) return '0';
      const parts = num.toFixed(2).split('.');
      let intPart = parts[0];
      const decPart = parts[1];
      
      // Indian number format: last 3 digits, then groups of 2
      let result = '';
      if (intPart.length > 3) {
        result = ',' + intPart.slice(-3);
        intPart = intPart.slice(0, -3);
        while (intPart.length > 2) {
          result = ',' + intPart.slice(-2) + result;
          intPart = intPart.slice(0, -2);
        }
        result = intPart + result;
      } else {
        result = intPart;
      }
      
      // Remove decimal if .00
      if (decPart === '00') {
        return result;
      }
      return result + '.' + decPart;
    };

    // ============== BACKGROUND WATERMARK ==============
    // Diagonal watermark pattern
    doc.save();
    doc.fillColor(colors.border).opacity(0.08);
    doc.fontSize(80).font('Helvetica-Bold');
    
    // Create diagonal watermark text
    const watermarkText = 'INTERIOR DESIGN';
    for (let i = 0; i < 3; i++) {
      doc.rotate(-35, { origin: [pageWidth / 2, pageHeight / 2] });
      doc.text(watermarkText, -100, 250 + (i * 200), { align: 'center', width: pageWidth + 200 });
      doc.rotate(35, { origin: [pageWidth / 2, pageHeight / 2] });
    }
    doc.restore();
    doc.opacity(1);

    // ============== DECORATIVE TOP BORDER ==============
    doc.fillColor(colors.accent)
       .rect(0, 0, pageWidth, 5)
       .fill();

    // ============== HEADER SECTION ==============
    let currentY = 25;

    // Left side: Logo-style Brand Name
    const logoBoxSize = 45;
    doc.fillColor(colors.primary)
       .roundedRect(margin, currentY, logoBoxSize, logoBoxSize, 6)
       .fill();
    
    // Brand initials inside logo box
    const brandInitials = payment.companyName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    doc.fillColor(colors.white)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(brandInitials, margin, currentY + 13, { 
         width: logoBoxSize, 
         align: 'center' 
       });

    // Company name next to logo
    doc.fillColor(colors.primary)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(payment.companyName.toUpperCase(), margin + logoBoxSize + 10, currentY + 5);
    
    doc.fillColor(colors.textLight)
       .fontSize(8)
       .font('Helvetica')
       .text('Interior Design & Execution', margin + logoBoxSize + 10, currentY + 24);
    
    doc.fillColor(colors.accent)
       .fontSize(8)
       .font('Helvetica-Bold')
       .text('SITEZERO', margin + logoBoxSize + 10, currentY + 35);

    // Right side: INVOICE label
    doc.fillColor(colors.primary)
       .fontSize(26)
       .font('Helvetica-Bold')
       .text('INVOICE', pageWidth - margin - 120, currentY + 8, { 
         width: 120, 
         align: 'right' 
       });

    currentY += 60;

    // Separator line
    doc.strokeColor(colors.border).lineWidth(1)
       .moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();
    doc.fillColor(colors.accent).rect(margin, currentY - 1, 60, 2).fill();

    currentY += 15;

    // ============== INVOICE DETAILS ROW ==============
    doc.fillColor(colors.textLight).fontSize(8).font('Helvetica-Bold').text('INVOICE #', margin, currentY);
    doc.fillColor(colors.text).fontSize(10).font('Helvetica-Bold').text(invoiceNumber, margin, currentY + 10);

    doc.fillColor(colors.textLight).fontSize(8).font('Helvetica-Bold').text('ISSUE DATE', margin + 120, currentY);
    doc.fillColor(colors.text).fontSize(9).font('Helvetica')
       .text(new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), margin + 120, currentY + 10);

    doc.fillColor(colors.textLight).fontSize(8).font('Helvetica-Bold').text('DUE DATE', margin + 240, currentY);
    doc.fillColor(colors.text).fontSize(9).font('Helvetica')
       .text(new Date(payment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), margin + 240, currentY + 10);

    // Status Badge
    const statusColors = {
      paid: colors.success,
      pending: colors.warning,
      overdue: colors.danger
    };
    const statusColor = statusColors[payment.status] || colors.warning;
    
    doc.fillColor(statusColor).roundedRect(pageWidth - margin - 70, currentY, 70, 22, 3).fill();
    doc.fillColor(colors.white).fontSize(9).font('Helvetica-Bold')
       .text(payment.status.toUpperCase(), pageWidth - margin - 70, currentY + 6, { width: 70, align: 'center' });

    currentY += 40;

    // ============== BILL TO & PROJECT (Side by Side) ==============
    const colWidth = (contentWidth - 20) / 2;

    // Left: Bill To
    doc.fillColor(colors.background).roundedRect(margin, currentY, colWidth, 70, 4).fill();
    doc.strokeColor(colors.border).lineWidth(0.5).roundedRect(margin, currentY, colWidth, 70, 4).stroke();
    doc.fillColor(colors.accent).fontSize(8).font('Helvetica-Bold').text('BILL TO', margin + 10, currentY + 8);
    doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold')
       .text(payment.siteId.clientName || 'Valued Client', margin + 10, currentY + 22, { width: colWidth - 20 });
    doc.fillColor(colors.textLight).fontSize(9).font('Helvetica')
       .text(payment.siteId.location || 'Location not specified', margin + 10, currentY + 40, { width: colWidth - 20 });

    // Right: Project
    doc.fillColor(colors.background).roundedRect(margin + colWidth + 20, currentY, colWidth, 70, 4).fill();
    doc.strokeColor(colors.border).lineWidth(0.5).roundedRect(margin + colWidth + 20, currentY, colWidth, 70, 4).stroke();
    doc.fillColor(colors.accent).fontSize(8).font('Helvetica-Bold').text('PROJECT', margin + colWidth + 30, currentY + 8);
    doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold')
       .text(payment.siteId.name, margin + colWidth + 30, currentY + 22, { width: colWidth - 20 });
    doc.fillColor(colors.textLight).fontSize(9).font('Helvetica')
       .text('Interior Design Project', margin + colWidth + 30, currentY + 40);

    currentY += 85;

    // ============== PAYMENT TITLE & DESCRIPTION ==============
    doc.fillColor(colors.primary).fontSize(13).font('Helvetica-Bold')
       .text(payment.title || 'Payment', margin, currentY);
    currentY += 16;
    
    if (payment.description) {
      doc.fillColor(colors.textLight).fontSize(9).font('Helvetica')
         .text(payment.description, margin, currentY, { width: contentWidth, lineGap: 2 });
      const descHeight = doc.heightOfString(payment.description, { width: contentWidth });
      currentY += Math.min(descHeight, 30) + 8;
    }

    currentY += 5;

    // ============== ITEMS TABLE ==============
    // Table Header
    doc.fillColor(colors.primary).roundedRect(margin, currentY, contentWidth, 28, 3).fill();

    const tableHeaders = [
      { text: 'DESCRIPTION', width: 220, align: 'left' },
      { text: 'DUE DATE', width: 90, align: 'center' },
      { text: 'STATUS', width: 70, align: 'center' },
      { text: 'AMOUNT', width: contentWidth - 380, align: 'right' }
    ];

    let headerX = margin + 10;
    doc.fillColor(colors.white).fontSize(8).font('Helvetica-Bold');
    tableHeaders.forEach(header => {
      doc.text(header.text, headerX, currentY + 9, { width: header.width, align: header.align });
      headerX += header.width;
    });

    currentY += 28;

    // Table Row
    doc.fillColor(colors.background).rect(margin, currentY, contentWidth, 35).fill();
    doc.strokeColor(colors.border).lineWidth(0.5).rect(margin, currentY, contentWidth, 35).stroke();

    let rowX = margin + 10;
    
    doc.fillColor(colors.text).fontSize(10).font('Helvetica-Bold')
       .text(payment.title || 'Interior Design Service', rowX, currentY + 6, { width: 220 });
    doc.fillColor(colors.textLight).fontSize(8).font('Helvetica')
       .text(payment.description ? payment.description.substring(0, 40) + (payment.description.length > 40 ? '...' : '') : 'Stage payment', rowX, currentY + 20, { width: 220 });
    rowX += 220;

    doc.fillColor(colors.text).fontSize(9).font('Helvetica')
       .text(new Date(payment.dueDate).toLocaleDateString('en-IN'), rowX, currentY + 12, { width: 90, align: 'center' });
    rowX += 90;

    const miniStatusColor = statusColors[payment.status] || colors.warning;
    doc.fillColor(miniStatusColor).roundedRect(rowX + 5, currentY + 8, 55, 18, 2).fill();
    doc.fillColor(colors.white).fontSize(7).font('Helvetica-Bold')
       .text(payment.status.toUpperCase(), rowX + 5, currentY + 13, { width: 55, align: 'center' });
    rowX += 70;

    doc.fillColor(colors.primary).fontSize(11).font('Helvetica-Bold')
       .text('INR ' + formatAmount(payment.amount), rowX, currentY + 12, { width: contentWidth - 380 - 10, align: 'right' });

    currentY += 45;

    // ============== TOTALS SECTION ==============
    const totalsWidth = 200;
    const totalsX = pageWidth - margin - totalsWidth;

    doc.fillColor(colors.textLight).fontSize(9).font('Helvetica').text('Subtotal:', totalsX, currentY, { width: 90 });
    doc.fillColor(colors.text).fontSize(9).font('Helvetica')
       .text('INR ' + formatAmount(payment.amount), totalsX + 90, currentY, { width: totalsWidth - 90, align: 'right' });
    currentY += 14;

    doc.fillColor(colors.textLight).fontSize(9).font('Helvetica').text('Tax (0%):', totalsX, currentY, { width: 90 });
    doc.fillColor(colors.text).fontSize(9).font('Helvetica')
       .text('INR 0', totalsX + 90, currentY, { width: totalsWidth - 90, align: 'right' });
    currentY += 16;

    doc.strokeColor(colors.accent).lineWidth(1.5).moveTo(totalsX, currentY).lineTo(pageWidth - margin, currentY).stroke();
    currentY += 8;

    // Grand Total Box
    doc.fillColor(colors.primary).roundedRect(totalsX - 5, currentY, totalsWidth + 5, 38, 4).fill();
    doc.fillColor(colors.white).fontSize(9).font('Helvetica-Bold').text('TOTAL AMOUNT', totalsX + 5, currentY + 6, { width: totalsWidth - 10 });
    doc.fillColor(colors.accent).fontSize(16).font('Helvetica-Bold')
       .text('INR ' + formatAmount(payment.amount), totalsX + 5, currentY + 18, { width: totalsWidth - 15, align: 'right' });

    currentY += 48;

    // Paid date if applicable
    if (payment.paidDate) {
      doc.fillColor(colors.success).fontSize(9).font('Helvetica-Bold')
         .text('Paid on: ' + new Date(payment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), 
               totalsX, currentY, { width: totalsWidth, align: 'right' });
      currentY += 18;
    }

    // ============== NOTES SECTION ==============
    currentY += 10;
    doc.fillColor(colors.accent).fontSize(9).font('Helvetica-Bold').text('NOTES & TERMS', margin, currentY);
    currentY += 12;
    doc.fillColor(colors.textLight).fontSize(8).font('Helvetica')
       .text('• Payment due by specified date. Include invoice number in payment reference.', margin, currentY, { width: contentWidth });
    currentY += 10;
    doc.text('• For queries, please contact us. Thank you for choosing our interior design services.', margin, currentY, { width: contentWidth });

    // ============== FOOTER ==============
    const footerY = pageHeight - 55;
    
    doc.strokeColor(colors.border).lineWidth(0.5).moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke();
    doc.fillColor(colors.accent).rect(pageWidth / 2 - 30, footerY - 1, 60, 2).fill();

    // Bottom gold accent line
    doc.fillColor(colors.accent).rect(0, pageHeight - 5, pageWidth, 5).fill();

    doc.end();
  } catch (error) {
    console.error('Error downloading invoice:', error);
    // Try to gracefully end the PDF stream if it was created
    if (doc) {
      try {
        doc.end();
      } catch (e) {
        // ignore
      }
    }

    // If headers haven't been sent, respond with JSON error
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error downloading invoice', error: error.message });
    }

    // If headers were already sent, there's nothing more we can safely write.
    return;
  }
};