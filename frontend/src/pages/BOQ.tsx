import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Package,
  IndianRupee,
} from "lucide-react";

interface BOQItem {
  id: number;
  category: string;
  items: {
    id: number;
    name: string;
    unit: string;
    quantity: number;
    rate: number;
    amount: number;
    status: "completed" | "in-progress" | "pending";
  }[];
}

const BOQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<number[]>([1, 2]);

  const boqData: BOQItem[] = [
    {
      id: 1,
      category: "Civil Work",
      items: [
        {
          id: 1,
          name: "Foundation Work",
          unit: "Sq.ft",
          quantity: 1200,
          rate: 150,
          amount: 180000,
          status: "completed",
        },
        {
          id: 2,
          name: "Brick Work",
          unit: "Sq.ft",
          quantity: 2500,
          rate: 85,
          amount: 212500,
          status: "completed",
        },
        {
          id: 3,
          name: "Plastering",
          unit: "Sq.ft",
          quantity: 3000,
          rate: 45,
          amount: 135000,
          status: "in-progress",
        },
      ],
    },
    {
      id: 2,
      category: "Electrical",
      items: [
        {
          id: 4,
          name: "Wiring (Main)",
          unit: "Points",
          quantity: 45,
          rate: 800,
          amount: 36000,
          status: "completed",
        },
        {
          id: 5,
          name: "Switches & Sockets",
          unit: "Nos",
          quantity: 60,
          rate: 350,
          amount: 21000,
          status: "in-progress",
        },
        {
          id: 6,
          name: "Light Fixtures",
          unit: "Nos",
          quantity: 25,
          rate: 2500,
          amount: 62500,
          status: "pending",
        },
      ],
    },
    {
      id: 3,
      category: "Plumbing",
      items: [
        {
          id: 7,
          name: "Pipe Fitting",
          unit: "Rft",
          quantity: 200,
          rate: 120,
          amount: 24000,
          status: "completed",
        },
        {
          id: 8,
          name: "Sanitary Fittings",
          unit: "Set",
          quantity: 3,
          rate: 45000,
          amount: 135000,
          status: "pending",
        },
      ],
    },
    {
      id: 4,
      category: "Flooring",
      items: [
        {
          id: 9,
          name: "Vitrified Tiles",
          unit: "Sq.ft",
          quantity: 1800,
          rate: 85,
          amount: 153000,
          status: "in-progress",
        },
        {
          id: 10,
          name: "Marble Flooring",
          unit: "Sq.ft",
          quantity: 400,
          rate: 250,
          amount: 100000,
          status: "pending",
        },
      ],
    },
  ];

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Completed
          </span>
        );
      case "in-progress":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            In Progress
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const totalAmount = boqData.reduce(
    (acc, category) =>
      acc + category.items.reduce((sum, item) => sum + item.amount, 0),
    0
  );

  const completedAmount = boqData.reduce(
    (acc, category) =>
      acc +
      category.items
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + item.amount, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 md:px-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Bill of Quantities
          </h1>
          <p className="text-gray-600 mt-1">
            Detailed breakdown of project costs and quantities
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn-outline flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Total BOQ Value</p>
          <p className="text-2xl font-bold text-gray-900">
            ₹{(totalAmount / 100000).toFixed(2)}L
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Completed Value</p>
          <p className="text-2xl font-bold text-green-600">
            ₹{(completedAmount / 100000).toFixed(2)}L
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            ₹{((totalAmount - completedAmount) / 100000 / 2).toFixed(2)}L
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">Progress</p>
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold text-gray-900">
              {Math.round((completedAmount / totalAmount) * 100)}%
            </p>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{
                  width: `${(completedAmount / totalAmount) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button className="btn-outline flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {/* BOQ Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {boqData.map((category) => (
          <div key={category.id} className="border-b border-gray-200 last:border-0">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedCategories.includes(category.id) ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <Package className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">
                  {category.category}
                </span>
                <span className="text-sm text-gray-500">
                  ({category.items.length} items)
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                ₹
                {category.items
                  .reduce((sum, item) => sum + item.amount, 0)
                  .toLocaleString("en-IN")}
              </span>
            </button>

            {/* Category Items */}
            {expandedCategories.includes(category.id) && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Rate (₹)
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">
                        Amount (₹)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {category.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{item.unit}</td>
                        <td className="px-6 py-4 text-right text-gray-900">
                          {item.quantity.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900">
                          {item.rate.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {item.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Total Summary */}
      <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IndianRupee className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">
                Total BOQ Amount
              </p>
              <p className="text-3xl font-bold text-blue-900">
                ₹{totalAmount.toLocaleString("en-IN")}
              </p>
            </div>
          </div>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>
    </div>
  );
};

export default BOQ;
