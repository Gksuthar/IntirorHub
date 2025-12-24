import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  UploadCloud,
  X,
  Filter,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSite } from "../context/SiteContext";
import { expenseApi } from "../services/api";
import AddExpenseModal from "../component/AddExpenseModal";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [items, setItems] = useState<ExpenseItem[]>([]);

  const { token, user } = useAuth();
  const { activeSite } = useSite();

  const budgetData = {
    total: 4500000,
    used: 2847500,
    remaining: 1652500,
    due: 385000
  };

  const buildParams = () => {
    const params: Record<string, string> = {};
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
    if (minAmount !== '') params.minAmount = String(minAmount);
    if (maxAmount !== '') params.maxAmount = String(maxAmount);
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return params;
  };

  const fetchExpenses = async () => {
    if (!token || !activeSite) return;
    try {
      const params = buildParams();
      const res = await expenseApi.getExpensesBySite(activeSite.id, token, params);
      setItems(res.expenses || []);
    } catch (err) {
      console.error('Unable to load expenses', err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeSite, selectedCategory, statusFilter, minAmount, maxAmount, startDate, endDate]);

  const filteredExpenses = items.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
    setStatusFilter('all');
    setSelectedCategory('all');
  };

  const activeFiltersCount = [
    statusFilter !== 'all',
    selectedCategory !== 'all',
    minAmount !== '',
    maxAmount !== '',
    startDate !== '',
    endDate !== ''
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500 text-right mb-1">ACTIVE SITE</p>
              <select className="text-sm font-medium text-gray-900 border-none bg-transparent focus:outline-none cursor-pointer">
                <option>{activeSite?.name || 'Lokes'}</option>
              </select>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-sm relative">
              {user?.name?.substring(0, 2).toUpperCase() || 'RK'}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
          </div>

          {/* Budget Cards */}
         <div className="grid grid-cols-2 gap-4 mb-6">
  {/* Total Budget */}
  <div className="text-center bg-white border border-gray-200 rounded-xl py-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Total Budget</p>
    <p className="text-xl font-semibold text-gray-900">
      ₹{(budgetData.total / 100000).toFixed(0)}L
    </p>
  </div>

  {/* Used Amount */}
  <div className="text-center bg-white border border-gray-200 rounded-xl py-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Used Amount</p>
    <p className="text-xl font-semibold text-indigo-600">
      ₹{(budgetData.used / 100000).toFixed(2)}L
    </p>
  </div>

  {/* Remaining Amount */}
  <div className="text-center bg-white border border-gray-200 rounded-xl py-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Remaining Amount</p>
    <p className="text-xl font-semibold text-green-600">
      ₹{(budgetData.remaining / 100000).toFixed(2)}L
    </p>
  </div>

  {/* Due Amount */}
  <div className="text-center bg-white border border-gray-200 rounded-xl py-4 shadow-sm">
    <p className="text-sm text-gray-500 mb-1">Due Amount</p>
    <p className="text-xl font-semibold text-red-600">
      ₹{(budgetData.due / 1000).toFixed(0)}K
    </p>
  </div>
</div>


          {/* Period Tabs */}
          <div className="flex gap-2 mb-6">
            {['Day', 'Week', 'Month', 'Year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors text-sm ${selectedPeriod === period
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full mb-4 px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses or vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${showFilters || activeFiltersCount > 0 ? 'text-indigo-600' : 'text-gray-400'
                }`}
            >
              <Filter className="h-5 w-5" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-gray-900">Advanced Filters</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-400">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Min Amount</label>
                  <input
                    type="number"
                    placeholder="₹0"
                    value={minAmount === '' ? '' : String(minAmount)}
                    onChange={(e) => setMinAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Max Amount</label>
                  <input
                    type="number"
                    placeholder="₹999999"
                    value={maxAmount === '' ? '' : String(maxAmount)}
                    onChange={(e) => setMaxAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={resetFilters}
                className="w-full py-2 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Add Expense Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 pt-4">
        {/* Results Count */}
        <div className="mb-3 text-sm text-gray-600 text-center">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''} found
        </div>

        {/* Expense List */}
        <div className="space-y-3">
          {filteredExpenses.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <p className="text-gray-500 text-sm mb-2">No expenses found</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                Add your first expense
              </button>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense._id} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <h3 className="font-semibold text-gray-900 text-base mb-2">
                      {expense.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                        {expense.category}
                      </span>
                      {expense.location && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                          {expense.location}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900">
                      ₹{expense.amount.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Status Badges and Actions */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {expense.paymentStatus === 'paid' && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Paid
                    </span>
                  )}
                  {expense.paymentStatus === 'unpaid' && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      Unpaid
                    </span>
                  )}
                  {expense.status === 'approved' && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                      Approved
                    </span>
                  )}
                  {expense.status === 'pending' && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                      Pending
                    </span>
                  )}
                  {expense.status === 'rejected' && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                      Rejected
                    </span>
                  )}

                  {expense.invoice?.path ? (
                    <button
                      onClick={() => expenseApi.downloadInvoice(expense._id, token || '')}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded flex items-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Invoice
                    </button>
                  ) : (
                    user && user.role !== 'CLIENT' && (
                      <label className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded flex items-center gap-1.5 cursor-pointer">
                        <UploadCloud className="w-3.5 h-3.5" />
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
                              await fetchExpenses();
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
                <div className="flex justify-between items-center text-sm text-gray-500 pt-3 border-t border-gray-100">
                  <span>{expense.createdBy?.name || '—'}</span>
                  <span>{new Date(expense.dueDate).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={() => fetchExpenses()}
        token={token}
        siteId={activeSite?.id || ''}
      />
    </div>
  );
};

export default Expenses;