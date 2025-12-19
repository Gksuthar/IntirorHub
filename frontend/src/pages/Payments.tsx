import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Plus,
  X,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";
import { paymentApi } from "../services/api";
import type { PaymentDto } from "../services/api";

const Payments: React.FC = () => {
  const { activeSite } = useSite();
  const { user, token } = useAuth();
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    dueDate: "",
  });

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";
  const canManagePayments = isAdmin || isManager;

  const loadPayments = async () => {
    if (!activeSite || !token) return;
    
    try {
      setLoading(true);
      const response = await paymentApi.getPaymentsBySite(activeSite.id, token);
      setPayments(response.payments);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSite && token) {
      loadPayments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSite, token]);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSite || !token || !isAdmin) return;

    try {
      await paymentApi.addPayment(
        {
          title: formData.title,
          description: formData.description,
          amount: parseFloat(formData.amount),
          dueDate: formData.dueDate,
          siteId: activeSite.id,
        },
        token
      );
      
      setFormData({ title: "", description: "", amount: "", dueDate: "" });
      setShowAddForm(false);
      loadPayments();
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment");
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    if (!token || !isAdmin) return;

    try {
      await paymentApi.markAsPaid(paymentId, token);
      loadPayments();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      alert("Failed to mark payment as paid");
    }
  };

  const handleRemind = async (paymentId: string) => {
    if (!token || !canManagePayments) return;

    try {
      const response = await paymentApi.sendReminder(paymentId, token);
      alert(response.message);
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert("Failed to send reminder");
    }
  };

  const handleDownloadInvoice = (paymentId: string) => {
    if (!token) return;
    paymentApi.downloadInvoice(paymentId, token);
  };

  const getStatusColor = (status: PaymentDto["status"]) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "due":
        return "text-orange-500";
      case "overdue":
        return "text-red-600";
    }
  };

  const getStatusIcon = (status: PaymentDto["status"]) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="h-4 w-4" />;
      case "due":
        return <Clock className="h-4 w-4" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const contractValue = payments.reduce((sum, p) => sum + p.amount, 0);
  const receivedAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = contractValue - receivedAmount;
  const progressPercentage = contractValue > 0 
    ? Math.round((receivedAmount / contractValue) * 100) 
    : 0;
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  return (
<div className="min-h-screen pt-20 pb-32 px-4 md:px-6">
      <div className="max-w-md mx-auto">
        {/* Active Project Header */}
<div className="absolute bottom-0 right-0 mb-6 flex items-center justify-between">
         
          {/* Floating Add Payment Button (Gmail style) */}
{isAdmin && (
  <button
    onClick={() => setShowAddForm(true)}
    title="Add Payment"
    className="
      fixed
      bottom-24   /* 👈 bottom navbar ke upar */
      right-5
      z-50
      p-4
bg-gray-800
      hover:bg-border border-white
      text-white
      rounded-full
      shadow-xl
      transition
      active:scale-95
    "
  >
    <Plus className="h-6 w-6" />
  </button>
)}

        </div>

        <p className="text-xs text-gray-400 mb-6">Last updated just now</p>

        {/* Contract Value and Received */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-white p-5 shadow-sm border border-gray-200 rounded-2xl">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Contract Value</p>
            <p className="text-md font-bold text-gray-900">{formatCurrency(contractValue)}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <p className="text-xs text-green-700 mb-1">Received</p>
            <p className="text-xl font-bold text-green-700">{formatCurrency(receivedAmount)}</p>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="mb-6 bg-white p-5 shadow-sm border border-gray-200 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-900">Payment Progress</p>
            <p className="text-sm font-semibold text-gray-900">{progressPercentage}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            {formatCurrency(pendingAmount)} pending
            {overdueCount > 0 && ` • ${overdueCount} overdue`}
          </p>
        </div>

        {/* Stage-wise Payments Title */}
        <h3 className="flex justify-start text-md font-semibold text-gray-600 mb-2 ml-2">Stage-wise Payments</h3>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading payments...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && payments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No payments found</p>
            {isAdmin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Add First Payment
              </button>
            )}
          </div>
        )}

        {/* Payment Stages */}
        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment._id}
              className="  bg-white border border-gray-200 rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-md font-semibold font-md text-gray-600">{payment.title}</h4>
                  <p className="text-sm text-gray-500">{payment.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-md font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                  <div
                    className={`inline-flex items-center gap-1 text-sm font-semibold ${getStatusColor(
                      payment.status
                    )}`}
                  >
                    {getStatusIcon(payment.status)}
                    <span className="capitalize">{payment.status}</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                Due: {new Date(payment.dueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>

              {payment.status === "paid" ? (
                <button
                  onClick={() => handleDownloadInvoice(payment._id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </button>
              ) : (
                <div className="flex gap-3">
                  {isAdmin && (
                    <button
                      onClick={() => handleMarkPaid(payment._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-xs transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Mark Paid
                    </button>
                  )}
                  {canManagePayments && (
                    <button
                      onClick={() => handleRemind(payment._id)}
                      className={`${
                        isAdmin ? "flex-1" : "w-full"
                      } flex items-center justify-center gap-2 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-xs border border-gray-300 transition-colors`}
                    >
                      <Send className="h-4 w-4" />
                      Remind
                    </button>
                  )}
                  {!canManagePayments && (
                    <button
                      onClick={() => handleDownloadInvoice(payment._id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-medium text-sm border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      Download Invoice
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Payment Modal */}
        {showAddForm && isAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Payment</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Initial Deposit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Payment details"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="500000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Add Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
