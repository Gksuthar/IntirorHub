import React, { useState, useEffect } from "react";
import {
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  Plus,
  X,
  Loader2,
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
  const [remindingPaymentId, setRemindingPaymentId] = useState<string | null>(null);
  const [reminderModal, setReminderModal] = useState<{ show: boolean; message?: string }>({ show: false });
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
      showToast("Failed to add payment", "error");
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    if (!token || !isAdmin) return;

    try {
      await paymentApi.markAsPaid(paymentId, token);
      loadPayments();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      showToast("Failed to mark payment as paid", "error");
    }
  };

  const handleRemind = async (paymentId: string) => {
    if (!token || !canManagePayments) return;

    try {
      setRemindingPaymentId(paymentId);
      const response = await paymentApi.sendReminder(paymentId, token);
      setReminderModal({ show: true, message: response.message || "Reminder sent" });
      setTimeout(() => setReminderModal({ show: false }), 2500);
    } catch (error) {
      console.error("Error sending reminder:", error);
      showToast("Failed to send reminder", "error");
    }
    finally {
      setRemindingPaymentId(null);
    }
  };

  const handleDownloadInvoice = (paymentId: string) => {
    if (!token) return;
    paymentApi.downloadInvoice(paymentId, token);
  };

  const getStatusColor = (status: PaymentDto["status"]) => {
    switch (status) {
      case "paid":
        return "inline-flex items-center bg-emerald-50 text-emerald-700 p-1 rounded-lg text-xs font-medium mt-1";
      case "due":
        return "inline-flex items-center bg-amber-50 text-amber-700 p-1 rounded-lg text-xs font-medium mt-1";
      case "overdue":
        return "inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium mt-1";
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

  // Simple in-page toast (no external deps)
  const showToast = (message: string, type: "info" | "success" | "error" = "info") => {
    try {
      const containerId = "site-zero-toast-container";
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement("div");
        container.id = containerId;
        container.style.position = "fixed";
        container.style.right = "16px";
        container.style.bottom = "16px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
      }

      const toast = document.createElement("div");
      toast.className = `mb-2 max-w-xs rounded-lg p-3 text-sm shadow-lg text-white`;
      toast.style.opacity = "0";
      toast.style.transition = "opacity 200ms ease, transform 200ms ease";
      toast.style.transform = "translateY(8px)";
      if (type === "success") {
        toast.style.background = "#059669"; // green-600
      } else if (type === "error") {
        toast.style.background = "#dc2626"; // red-600
      } else {
        toast.style.background = "#374151"; // gray-700
      }
      toast.textContent = message;

      container.appendChild(toast);

      // animate in
      requestAnimationFrame(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
      });

      // remove after 3s
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(8px)";
        setTimeout(() => {
          try {
            container?.removeChild(toast);
          } catch (e) {}
        }, 200);
      }, 3000);
    } catch (e) {
      // fallback
      try {
        // eslint-disable-next-line no-alert
        alert(message);
      } catch (_) {}
    }
  };

  const siteContractValue = activeSite?.contractValue ?? null;
  const contractValue = siteContractValue ?? payments.reduce((sum, p) => sum + p.amount, 0);
  const receivedAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = Math.max(0, contractValue - receivedAmount);
  const rawPercent = contractValue > 0 ? Math.round((receivedAmount / contractValue) * 100) : 0;
  const progressPercentage = Math.min(100, Math.max(0, rawPercent));
  const overdueCount = payments.filter((p) => p.status === "overdue").length;

  return (
<div className="min-h-screen pt-20 pb-32 p-2 md:px-6">
      <div className="max-w-md mx-auto">
<div className="absolute bottom-0 right-0 mb-6 flex items-center justify-between">
         
{isAdmin && (
  <button
    onClick={() => setShowAddForm(true)}
    title="Add Payment"
    className="
      fixed
      bottom-24   
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

        {payments.length > 0 && (
          <p className="text-xs text-gray-400 mb-6">
            Last updated:{" "}
            {(() => {
              const lastUpdated = payments.reduce((latest, p) => {
                const pDate = new Date(p.updatedAt || p.createdAt || p.dueDate);
                return pDate > latest ? pDate : latest;
              }, new Date(0));
              
              const now = new Date();
              const diffMs = now.getTime() - lastUpdated.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);
              
              if (diffMins < 1) return "just now";
              if (diffMins < 60) return `${diffMins} min ago`;
              if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
              if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
              return lastUpdated.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            })()}
          </p>
        )}

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
        {/* Reminder confirmation modal */}
        {reminderModal.show && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-lg mx-4 pointer-events-auto">
              <h3 className="text-md font-semibold mb-1">Reminder sent</h3>
              <p className="text-sm text-gray-600">{reminderModal.message}</p>
            </div>
          </div>
        )}

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
                  <p className="text-sm text-gray-500">{contractValue > 0 ? Math.round((payment.amount / contractValue) * 100) : 0}% of total</p>
                  <p className="text-sm text-gray-500 mb-3">
                    <br/>
                    <br/>
                Due: {new Date(payment.dueDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
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
                      disabled={remindingPaymentId === payment._id}
                      className={`${
                        isAdmin ? "flex-1" : "w-full"
                      } flex items-center justify-center gap-2 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-xs border border-gray-300 transition-colors ${remindingPaymentId === payment._id ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {remindingPaymentId === payment._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {remindingPaymentId === payment._id ? 'Sending...' : 'Remind'}
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
                    min={0}
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
