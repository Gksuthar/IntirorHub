import React, { useState } from "react";
import {
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
} from "lucide-react";
import { useSite } from "../context/SiteContext";

interface PaymentStage {
  id: number;
  name: string;
  percentage: number;
  amount: number;
  status: "paid" | "due" | "overdue";
  dueDate: string;
}

const Payments: React.FC = () => {
  const { activeSite } = useSite();
  const contractValue = 2500000;
  const receivedAmount = 1400000;
  const pendingAmount = contractValue - receivedAmount;
  const progressPercentage = Math.round((receivedAmount / contractValue) * 100);
  
  const [paymentStages] = useState<PaymentStage[]>([
    {
      id: 1,
      name: "Initial Deposit",
      percentage: 20,
      amount: 500000,
      status: "paid",
      dueDate: "15 Aug 2024",
    },
    {
      id: 2,
      name: "Structural Work",
      percentage: 24,
      amount: 600000,
      status: "paid",
      dueDate: "01 Sep 2024",
    },
    {
      id: 3,
      name: "Carpentry Work",
      percentage: 16,
      amount: 400000,
      status: "overdue",
      dueDate: "05 Dec 2024",
    },
    {
      id: 4,
      name: "Finishing",
      percentage: 24,
      amount: 600000,
      status: "due",
      dueDate: "20 Dec 2024",
    },
    {
      id: 5,
      name: "Final Settlement",
      percentage: 16,
      amount: 400000,
      status: "due",
      dueDate: "25 Dec 2024",
    },
  ]);

  const getStatusColor = (status: PaymentStage["status"]) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "due":
        return "text-orange-500";
      case "overdue":
        return "text-red-600";
    }
  };

  const getStatusIcon = (status: PaymentStage["status"]) => {
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
    return `₹${(amount / 100000).toFixed(0)},00,000`;
  };

  const handleMarkPaid = (id: number) => {
    console.log("Mark paid:", id);
  };

  const handleRemind = (id: number) => {
    console.log("Send reminder:", id);
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-20 px-4 md:px-6">
      <div className="max-w-md mx-auto">
        {/* Active Project Header */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-1">Active Project</p>
          <h2 className="text-base font-semibold text-gray-900">
            {activeSite?.name || "No Active Site"}
          </h2>
        </div>

        <p className="text-xs text-gray-400 mb-6">Last updated 8 minutes ago</p>

        {/* Payment Progress */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600">
            ₹{(pendingAmount / 100000).toFixed(2)} pending • 1 overdue
          </p>
        </div>

        {/* Stage-wise Payments Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-4">Stage-wise Payments</h3>

        {/* Payment Stages */}
        <div className="space-y-4">
          {paymentStages.map((stage) => (
            <div key={stage.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-base font-semibold text-gray-900">{stage.name}</h4>
                  <p className="text-sm text-gray-500">{stage.percentage}% of total</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(stage.amount)}</p>
                  <div className={`inline-flex items-center gap-1 text-sm font-medium ${getStatusColor(stage.status)}`}>
                    {getStatusIcon(stage.status)}
                    <span className="capitalize">{stage.status}</span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mb-3">Due: {stage.dueDate}</p>
              
              {stage.status === "paid" ? (
                <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-medium text-sm border border-gray-200">
                  <Download className="h-4 w-4" />
                  Download Invoice
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleMarkPaid(stage.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Paid
                  </button>
                  <button
                    onClick={() => handleRemind(stage.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-sm border border-gray-300 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                    Remind
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;
