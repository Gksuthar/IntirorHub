import express from 'express';
import * as ExpenseController from '../controllers/ExpenseController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Add expense
router.post('/add', auth, ExpenseController.addExpense);

// Get expenses by site
router.get('/site/:siteId', auth, ExpenseController.getExpensesBySite);

// Upload invoice (base64 payload)
router.post('/:expenseId/upload-invoice', auth, ExpenseController.uploadInvoice);

// Approve or reject (admin only)
router.put('/:expenseId/approve', auth, ExpenseController.approveExpense);
// Admin can set arbitrary status
router.put('/:expenseId/status', auth, ExpenseController.updateExpenseStatus);
// Admin can set payment status (paid/unpaid)
router.put('/:expenseId/payment-status', auth, ExpenseController.updateExpensePaymentStatus);

// Download invoice
router.get('/:expenseId/invoice', auth, ExpenseController.downloadInvoice);

// Serve raw invoice file (internal helper)
router.get('/invoice-file/:filename', ExpenseController.serveInvoiceFile);

export default router;
