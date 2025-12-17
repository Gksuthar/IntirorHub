import React, { useState } from "react";
import {
  Plus,
  Search,
  Download,
  TrendingUp,
  Calendar,
  Receipt,
  MoreVertical,
  PieChart,
} from "lucide-react";

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: string;
  date: string;
  paidBy: string;
  receipt: boolean;
}

const Expenses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const expenses: Expense[] = [
    {
      id: 1,
      title: "Cement Purchase",
      category: "Materials",
      amount: "₹45,000",
      date: "2024-12-10",
      paidBy: "Admin",
      receipt: true,
    },
    {
      id: 2,
      title: "Labour Payment - Week 11",
      category: "Labour",
      amount: "₹85,000",
      date: "2024-12-08",
      paidBy: "Manager",
      receipt: true,
    },
    {
      id: 3,
      title: "Tools & Equipment",
      category: "Equipment",
      amount: "₹12,500",
      date: "2024-12-07",
      paidBy: "Admin",
      receipt: false,
    },
    {
      id: 4,
      title: "Site Transportation",
      category: "Transport",
      amount: "₹8,000",
      date: "2024-12-05",
      paidBy: "Agent",
      receipt: true,
    },
    {
      id: 5,
      title: "Paint & Finishing",
      category: "Materials",
      amount: "₹65,000",
      date: "2024-12-03",
      paidBy: "Admin",
      receipt: true,
    },
    {
      id: 6,
      title: "Miscellaneous Expenses",
      category: "Misc",
      amount: "₹5,500",
      date: "2024-12-01",
      paidBy: "Agent",
      receipt: false,
    },
  ];

  const categories = [
    { name: "Materials", amount: 110000, color: "bg-blue-500", percentage: 45 },
    { name: "Labour", amount: 85000, color: "bg-green-500", percentage: 35 },
    { name: "Equipment", amount: 12500, color: "bg-purple-500", percentage: 10 },
    { name: "Transport", amount: 8000, color: "bg-yellow-500", percentage: 5 },
    { name: "Misc", amount: 5500, color: "bg-pink-500", percentage: 5 },
  ];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 md:px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Expenses
          </h1>
          <p className="text-gray-600 mt-1">Track and manage project expenses</p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <Plus className="h-5 w-5" />
          Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">₹2,21,000</p>
          <p className="text-xs text-green-600 mt-1">+12% from last month</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">This Month</p>
            <Calendar className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">₹1,50,500</p>
          <p className="text-xs text-gray-500 mt-1">Dec 2024</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">With Receipt</p>
            <Receipt className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">₹2,03,000</p>
          <p className="text-xs text-gray-500 mt-1">92% documented</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Budget Used</p>
            <PieChart className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">48.7%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-orange-500 h-1.5 rounded-full"
              style={{ width: "48.7%" }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense List */}
        <div className="lg:col-span-2">
          {/* Search and Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Categories</option>
                <option value="Materials">Materials</option>
                <option value="Labour">Labour</option>
                <option value="Equipment">Equipment</option>
                <option value="Transport">Transport</option>
                <option value="Misc">Miscellaneous</option>
              </select>
              <button className="btn-outline flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Expense
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Paid By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Receipt
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {expense.title}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                            expense.category === "Materials"
                              ? "bg-blue-100 text-blue-700"
                              : expense.category === "Labour"
                              ? "bg-green-100 text-green-700"
                              : expense.category === "Equipment"
                              ? "bg-purple-100 text-purple-700"
                              : expense.category === "Transport"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-pink-100 text-pink-700"
                          }`}
                        >
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {expense.amount}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(expense.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{expense.paidBy}</td>
                      <td className="px-6 py-4">
                        {expense.receipt ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="h-4 w-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Category Breakdown
          </h3>

          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{category.amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${category.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {category.percentage}% of total
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">Total</span>
              <span className="text-xl font-bold text-gray-900">₹2,21,000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
