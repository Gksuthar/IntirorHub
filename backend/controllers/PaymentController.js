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
    
    // Verify user is admin or manager
    if (req.user.role !== 'ADMIN' && req.user.role !== 'MANAGER') {
      return res.status(403).json({ message: 'Only admin and manager can send reminders' });
    }
    
    const payment = await Payment.findById(paymentId).populate('siteId');
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Verify payment belongs to user's company
    if (payment.companyName !== req.user.companyName) {
      return res.status(403).json({ message: 'Payment does not belong to your company' });
    }
    
    // Find all clients associated with this site
    const clients = await User.find({
      companyName: payment.companyName,
      role: 'CLIENT',
      siteAccess: payment.siteId._id
    });
    
    // Send reminder emails
    for (const client of clients) {
      const emailHtml = `
        <h2>Payment Reminder</h2>
        <p>Dear ${client.name},</p>
        <p>This is a reminder for the following payment:</p>
        <ul>
          <li><strong>Site:</strong> ${payment.siteId.name}</li>
          <li><strong>Title:</strong> ${payment.title}</li>
          <li><strong>Description:</strong> ${payment.description}</li>
          <li><strong>Amount:</strong> ₹${payment.amount.toLocaleString('en-IN')}</li>
          <li><strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString('en-IN')}</li>
          <li><strong>Status:</strong> ${payment.status.toUpperCase()}</li>
        </ul>
        <p>Please make the payment at your earliest convenience.</p>
        <p>Best regards,<br>${req.user.name}</p>
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

// Download invoice
export const downloadInvoice = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId).populate('siteId');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Verify payment belongs to user's company
    if (payment.companyName !== req.user.companyName) {
      return res.status(403).json({ message: 'Payment does not belong to your company' });
    }
    
    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${payment._id}.pdf`);
    
    doc.pipe(res);
    
    // Add company logo/name
    doc.fontSize(20).text(payment.companyName, { align: 'center' });
    doc.moveDown();
    
    // Add invoice title
    doc.fontSize(16).text('PAYMENT INVOICE', { align: 'center', underline: true });
    doc.moveDown(2);
    
    // Add site details
    doc.fontSize(12).text(`Site: ${payment.siteId.name}`, { bold: true });
    doc.text(`Location: ${payment.siteId.location || 'N/A'}`);
    doc.moveDown();
    
    // Add payment details
    doc.fontSize(14).text('Payment Details:', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Title: ${payment.title}`);
    doc.text(`Description: ${payment.description}`);
    doc.text(`Amount: ₹${payment.amount.toLocaleString('en-IN')}`);
    doc.text(`Due Date: ${new Date(payment.dueDate).toLocaleDateString('en-IN')}`);
    doc.text(`Status: ${payment.status.toUpperCase()}`);
    
    if (payment.paidDate) {
      doc.text(`Paid Date: ${new Date(payment.paidDate).toLocaleDateString('en-IN')}`);
    }
    
    doc.moveDown(2);
    
    // Add footer
    doc.fontSize(10).text('Thank you for your business!', { align: 'center', italics: true });
    
    doc.end();
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ message: 'Error downloading invoice', error: error.message });
  }
};
