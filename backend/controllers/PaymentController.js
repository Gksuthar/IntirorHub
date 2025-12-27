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

// Update payment status (admin only)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status } = req.body; // expected 'paid' | 'due' | 'overdue'

    if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Only admin can update payment status' });

    const allowed = ['paid', 'due', 'overdue'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const payment = await Payment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.companyName !== req.user.companyName) return res.status(403).json({ message: 'Payment does not belong to your company' });

    payment.status = status;
    if (status === 'paid') payment.paidDate = new Date();
    else payment.paidDate = undefined;

    await payment.save();

    res.json({ message: 'Payment status updated', payment });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Error updating payment status', error: error.message });
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
      margin: 50,
      layout: 'portrait'
    });
    
    const paymentIdStr = payment._id.toString();
    const invoiceNumber = `INV-${paymentIdStr.slice(-8).toUpperCase()}`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber}.pdf`);

    doc.pipe(res);
    
    // Simple clean colors
    const black = '#000000';
    const gray = '#666666';
    const lightGray = '#999999';
    const lineColor = '#cccccc';
    
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    // Format amount in Indian style
    const formatAmount = (amount) => {
      const num = Number(amount);
      if (isNaN(num)) return '0.00';
      const parts = num.toFixed(2).split('.');
      let intPart = parts[0];
      const decPart = parts[1];
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
      return result + '.' + decPart;
    };

    // Convert number to words for Indian currency
    const numberToWords = (num) => {
      const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
      const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      if (num === 0) return 'Zero';
      if (num < 20) return ones[num];
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
      if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
      if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
      if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
      return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
    };

    let currentY = 50;

    // ============== HEADER: Logo on Left, Receipt Title on Right ==============
    
    // Left side: Logo box with initials
    const logoSize = 50;
    doc.fillColor(black)
       .rect(margin, currentY, logoSize, logoSize)
       .fill();
    
    const brandInitials = payment.companyName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
    
    doc.fillColor('#ffffff')
       .fontSize(20)
       .font('Helvetica-Bold')
       .text(brandInitials, margin, currentY + 15, { width: logoSize, align: 'center' });

    // Company name and details next to logo
    const companyX = margin + logoSize + 15;
    doc.fillColor(black)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text(payment.companyName, companyX, currentY);
    
    doc.fillColor(gray)
       .fontSize(9)
       .font('Helvetica')
       .text(payment.siteId.location || 'India', companyX, currentY + 20);
    
    doc.fillColor(gray)
       .fontSize(9)
       .text('SITEZERO Interior Design', companyX, currentY + 32);

    // Right side: PAYMENT RECEIPT title
    doc.fillColor(black)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('PAYMENT RECEIPT', pageWidth - margin - 180, currentY + 10, { width: 180, align: 'right' });

    currentY += 70;

    // Horizontal line
    doc.strokeColor(lineColor).lineWidth(1)
       .moveTo(margin, currentY).lineTo(pageWidth - margin, currentY).stroke();

    currentY += 25;

    // ============== PAYMENT INFO (No Table, Underlined Values) ==============
    const labelX = margin;
    const valueX = margin + 140;
    const rowHeight = 28;
    const underlineColor = '#cccccc';

    // Helper to draw field with underlined value
    const drawField = (label, value, valueWidth = 200) => {
      doc.fillColor(gray).fontSize(10).font('Helvetica-Bold')
         .text(label, labelX, currentY);
      doc.fillColor(black).fontSize(10).font('Helvetica')
         .text(value, valueX, currentY, { width: valueWidth });
      // Gray underline under value
      doc.strokeColor(underlineColor).lineWidth(0.5)
         .moveTo(valueX, currentY + 14).lineTo(valueX + valueWidth, currentY + 14).stroke();
      currentY += rowHeight;
    };

    // Payment Date
    const paymentDate = payment.paidDate 
      ? new Date(payment.paidDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    drawField('Payment Date', paymentDate);

    // Reference Number
    drawField('Reference Number', invoiceNumber);

    // Payment Mode
    drawField('Payment Mode', 'Bank Transfer');

    // Amount in Words
    const amountInWords = 'Indian Rupee ' + numberToWords(Math.floor(payment.amount)) + ' Only';
    drawField('Amount In Words', amountInWords, 350);

    currentY += 10;

    // Received From
    doc.fillColor(gray).fontSize(10).font('Helvetica-Bold').text('Received From', labelX, currentY);
    doc.fillColor(black).fontSize(11).font('Helvetica-Bold')
       .text(payment.siteId.clientName || 'Client', valueX, currentY);
    doc.strokeColor(underlineColor).lineWidth(0.5)
       .moveTo(valueX, currentY + 14).lineTo(valueX + 200, currentY + 14).stroke();
    currentY += 18;
    doc.fillColor(gray).fontSize(9).font('Helvetica')
       .text(payment.siteId.name, valueX, currentY);
    currentY += rowHeight + 10;

    // Authorized Signature area
    doc.fillColor(gray).fontSize(9).font('Helvetica').text('Authorized Signature', pageWidth - margin - 150, currentY - 20);
    doc.strokeColor(underlineColor).lineWidth(0.5)
       .moveTo(pageWidth - margin - 150, currentY - 6).lineTo(pageWidth - margin, currentY - 6).stroke();

    currentY += 20;

    // ============== PROJECT DETAILS ==============
    doc.fillColor(black).fontSize(12).font('Helvetica-Bold')
       .text('Project Details', margin, currentY);
    currentY += 20;
    
    drawField('Project Name', payment.siteId.name, 300);
    drawField('Payment Title', payment.title, 300);
    
    if (payment.description) {
      drawField('Description', payment.description.substring(0, 50) + (payment.description.length > 50 ? '...' : ''), 300);
    }
    
    drawField('Due Date', new Date(payment.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }));
    
    // Status with color
    doc.fillColor(gray).fontSize(10).font('Helvetica-Bold').text('Status', labelX, currentY);
    doc.fillColor(payment.status === 'paid' ? '#27ae60' : '#e74c3c').fontSize(10).font('Helvetica-Bold')
       .text(payment.status.toUpperCase(), valueX, currentY);
    doc.strokeColor(underlineColor).lineWidth(0.5)
       .moveTo(valueX, currentY + 14).lineTo(valueX + 200, currentY + 14).stroke();
    currentY += rowHeight + 20;

    // ============== AMOUNT BOX (Light Green with White Text) ==============
    const boxWidth = 220;
    const boxHeight = 60;
    const boxX = pageWidth - margin - boxWidth;
    const lightGreen = '#27ae60';
    
    // Light green filled box
    doc.fillColor(lightGreen)
       .roundedRect(boxX, currentY, boxWidth, boxHeight, 6)
       .fill();
    
    // "Amount Received" label in white
    doc.fillColor('#ffffff').fontSize(10).font('Helvetica')
       .text('Amount Received', boxX + 15, currentY + 12);
    
    // Amount in white bold
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
       .text('Rs.' + formatAmount(payment.amount), boxX + 15, currentY + 30);
    
    currentY += boxHeight + 30;

    // ============== FOOTER ==============
    const footerY = pageHeight - 60;
    
    doc.strokeColor(lineColor).lineWidth(0.5)
       .moveTo(margin, footerY).lineTo(pageWidth - margin, footerY).stroke();
    
    doc.fillColor(lightGray).fontSize(8).font('Helvetica')
       .text('This is a computer generated receipt.', margin, footerY + 15, { width: contentWidth, align: 'center' });
    doc.text('Thank you for your payment.', margin, footerY + 28, { width: contentWidth, align: 'center' });

    doc.end();
  } catch (error) {
    console.error('Error downloading invoice:', error);
    if (doc) {
      try {
        doc.end();
      } catch (e) {
        // ignore
      }
    }

    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error downloading invoice', error: error.message });
    }
    return;
  }
};