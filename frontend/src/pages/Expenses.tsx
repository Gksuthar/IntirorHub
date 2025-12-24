import React, { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import { expenseApi } from "../services/api";

interface ExpenseItem {
  _id: string;
  title: string;
  category: string;
  location?: string;
  amount: number;
  dueDate: string;
  status: string;
  paymentStatus: string;
  invoice?: { path?: string | null; filename?: string | null } | null;
  createdBy?: { name?: string };
}

const Expenses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [items, setItems] = useState<ExpenseItem[]>([
    {
      _id: '1',
      title: 'Marble Flooring - Master Bedroom',
      category: 'Material',
      location: 'Master Bedroom',
      amount: 185000,
      dueDate: '2024-12-15',
      status: 'approved',
      paymentStatus: 'paid',
      invoice: { path: '/invoice1.pdf', filename: 'invoice1.pdf' },
      createdBy: { name: 'Rajesh Kumar' }
    },
    {
      _id: '2',
      title: 'Mason Work - Living Area',
      category: 'Labour',
      location: 'Living Area',
      amount: 45000,
      dueDate: '2024-12-18',
      status: 'pending',
      paymentStatus: 'unpaid',
      createdBy: { name: 'Priya Shah' }
    },
    {
      _id: '3',
      title: 'LED Panel Lights - False Ceiling',
      category: 'Electrical',
      location: 'All Rooms',
      amount: 28500,
      dueDate: '2024-12-20',
      status: 'approved',
      paymentStatus: 'paid',
      invoice: { path: '/invoice3.pdf', filename: 'invoice3.pdf' },
      createdBy: { name: 'Amit Patel' }
    },
  ]);
  
  const { token, user } = useAuth();
  const { activeSite } = useSite();

  const budgetData = {
    total: 4500000,
    used: 2847500,
    remaining: 1652500,
    due: 385000
  };

  const filteredExpenses = items.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">SITE ZERO</h1>
            <p className="text-sm text-gray-600">{activeSite.name}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            RK
          </div>
        </div>

        {/* Budget Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-gray-900">₹{(budgetData.total / 100000).toFixed(2)},000</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Used Amount</p>
            <p className="text-xl font-bold text-indigo-600">₹{(budgetData.used / 100000).toFixed(2)},500</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Remaining Amount</p>
            <p className="text-xl font-bold text-green-600">₹{(budgetData.remaining / 100000).toFixed(2)},500</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Due Amount</p>
            <p className="text-xl font-bold text-red-600">₹{(budgetData.due / 1000).toFixed(0)},000</p>
          </div>
        </div>

        {/* Period Tabs */}
        <div className="flex gap-2 mb-4">
          {['Day', 'Week', 'Month', 'Year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedPeriod === period
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          <option value="Material">Material</option>
          <option value="Labour">Labour</option>
          <option value="Electrical">Electrical</option>
          <option value="Equipment">Equipment</option>
          <option value="Transport">Transport</option>
          <option value="Misc">Miscellaneous</option>
        </select>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search expenses or vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Add Expense Button */}
        <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 mb-6 hover:bg-indigo-700 transition-colors">
          <Plus className="h-5 w-5" />
          Add Expense
        </button>

        {/* Expense List */}
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div key={expense._id} className="bg-white rounded-lg p-4 border border-gray-200">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{expense.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded">{expense.category}</span>
                    {expense.location && (
                      <span className="px-2 py-1 bg-gray-100 rounded">{expense.location}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">₹{expense.amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex gap-2 mb-3">
                {expense.paymentStatus === 'paid' && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                    Paid
                  </span>
                )}
                {expense.paymentStatus === 'unpaid' && (
                  <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded">
                    Unpaid
                  </span>
                )}
                {expense.status === 'approved' && (
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded">
                    Approved
                  </span>
                )}
                {expense.status === 'pending' && (
                  <span className="px-2 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded">
                    Pending
                  </span>
                )}
                {expense.status === 'rejected' && (
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">
                    Rejected
                  </span>
                )}
                
                {/* Action Buttons */}
                {expense.invoice?.path ? (
                  <button 
                    onClick={() => expenseApi.downloadInvoice(expense._id, token || '')}
                    className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    View Invoice
                  </button>
                ) : (
                  user && user.role !== 'CLIENT' && (
                    <label className="px-2 py-1 bg-gray-50 text-gray-700 text-xs font-medium rounded flex items-center gap-1 cursor-pointer">
                      <UploadCloud className="w-3 h-3" />
                      Upload
                      <input type="file" className="hidden" onChange={async (ev) => {
                        const file = ev.target.files?.[0];
                        if (!file || !token || !activeSite) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const result = reader.result as string;
                          const base = result.split(',')[1];
                          try {
                            await expenseApi.uploadInvoice(expense._id, { 
                              invoiceBase64: base, 
                              invoiceFilename: file.name 
                            }, token);
                            const res = await expenseApi.getExpensesBySite(activeSite.id, token);
                            setItems(res.expenses || []);
                          } catch (err) {
                            console.error('Upload failed', err);
                          }
                        };
                        reader.readAsDataURL(file);
                      }} />
                    </label>
                  )
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{expense.createdBy?.name || '—'}</span>
                <span>{new Date(expense.dueDate).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Expenses;