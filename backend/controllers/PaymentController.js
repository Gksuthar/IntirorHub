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
      margin: 50,
      layout: 'portrait'
    });
    
    // Normalize payment id to string to avoid ObjectId method issues
    const paymentIdStr = payment._id.toString();

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${paymentIdStr}.pdf`);

    doc.pipe(res);
    
    // Define colors for the template
    const primaryColor = '#2c3e50'; // Dark blue-gray
    const secondaryColor = '#3498db'; // Blue
    const accentColor = '#e74c3c'; // Red for accents if needed
    const lightGray = '#ecf0f1';
    const darkGray = '#34495e';
    
    // Helper function to draw a horizontal line
    const drawLine = (y, width = 520, color = primaryColor) => {
      doc.strokeColor(color)
         .lineWidth(1)
         .moveTo(50, y)
         .lineTo(50 + width, y)
         .stroke();
    };
    
    // Helper function to add a table-like structure
    const addTable = (headers, rows, startY, colWidths) => {
      let y = startY;
      
      // Headers
      doc.fillColor(primaryColor)
         .font('Helvetica-Bold')
         .fontSize(10);
      headers.forEach((header, i) => {
        doc.text(header, 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
      });
      drawLine(y + 10);
      y += 15;
      
      // Rows
      doc.fillColor(darkGray)
         .fontSize(9)
         .font('Helvetica');
      rows.forEach(row => {
        row.forEach((cell, i) => {
          doc.text(cell.toString(), 50 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y);
        });
        drawLine(y + 10);
        y += 12;
      });
      
      return y;
    };
    
    // Header: Company Branding
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(payment.companyName, 50, 50, { align: 'center', width: 500 });
    
    // Subheader
    doc.fillColor(secondaryColor)
       .fontSize(14)
       .text('SITEZERO', 50, 80, { align: 'center', width: 500 });
    
    drawLine(110);
    
    // Invoice Title and Details
    let currentY = 130;
    doc.fillColor(primaryColor)
       .fontSize(20)
       .font('Helvetica-Bold')
       .text('PAYMENT INVOICE', 50, currentY, { underline: true });
    
    currentY += 40;
    
    // Invoice Meta Info (right-aligned)
    doc.fillColor(darkGray)
       .fontSize(10)
       .font('Helvetica');
    doc.text(`Invoice #: ${paymentIdStr.slice(-8).toUpperCase()}`, 350, currentY);
    doc.text(`Date Issued: ${new Date().toLocaleDateString('en-IN')}`, 350, currentY + 15);
    doc.text(`Payment ID: ${paymentIdStr.slice(-6)}`, 350, currentY + 30);
    
    currentY += 70;
    
    // Bill To Section
    doc.fillColor(primaryColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Bill To:', 50, currentY);
    
    currentY += 15;
    doc.fillColor(darkGray)
       .fontSize(10);
    doc.text(`Site Name: ${payment.siteId.name}`, 50, currentY);
    doc.text(`Location: ${payment.siteId.location || 'Not Specified'}`, 50, currentY + 15);
    doc.text(`Client: ${payment.siteId.clientName || 'N/A'}`, 50, currentY + 30);
    
    currentY += 60;
    
    // Payment Details Table
    doc.fillColor(primaryColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Payment Details', 50, currentY);
    
    currentY += 20;
    
    const paymentHeaders = ['Description', 'Amount (₹)', 'Due Date', 'Status'];
    const paymentRows = [
      [payment.description || payment.title, payment.amount.toLocaleString('en-IN'), 
       new Date(payment.dueDate).toLocaleDateString('en-IN'), payment.status.toUpperCase()],
    ];
    
    const colWidths = [200, 100, 100, 120]; // Approximate widths
    
    currentY = addTable(paymentHeaders, paymentRows, currentY, colWidths);
    
    if (payment.paidDate) {
      currentY += 10;
      doc.fillColor(darkGray)
         .fontSize(10)
         .text(`Paid on: ${new Date(payment.paidDate).toLocaleDateString('en-IN')}`, 50, currentY);
    }
    
    currentY += 40;
    
    // Total Summary Box
    doc.fillColor(primaryColor)
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Total Amount Due:', 50, currentY);
    
    doc.fillColor(secondaryColor)
       .fontSize(18)
       .font('Helvetica-Bold')
       .text(`₹${payment.amount.toLocaleString('en-IN')}`, 300, currentY);
    
    drawLine(currentY + 30);
    
    currentY += 60;
    
    // Notes Section (if description is long, but keep simple)
    doc.fillColor(darkGray)
       .fontSize(10)
       .text('Notes:', 50, currentY, { continued: true });
    doc.text(payment.description || 'Standard stage payment for interior work.', { align: 'justify', width: 450 });
    
    currentY += 50;
    
    // Footer
    doc.fillColor(lightGray) // Background for footer
       .rect(0, doc.page.height - 100, doc.page.width, 100)
       .fill();
    
    doc.fillColor(primaryColor)
       .fontSize(10)
       .font('Helvetica-Oblique')
       .text('Thank you for choosing us for your SITEZERO needs!', 
             50, doc.page.height - 70, { align: 'center', width: 500 });
    
    doc.fillColor(darkGray)
       .fontSize(8)
       .text(`Generated on: ${new Date().toLocaleDateString('en-IN')} | Confidential Document`, 
             50, doc.page.height - 40, { align: 'center', width: 500 });
    
    // Add a subtle border around the page
    doc.strokeColor(lightGray)
       .lineWidth(2)
       .rect(40, 40, doc.page.width - 80, doc.page.height - 100)
       .stroke();
    
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