import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';

// Local DTO types to avoid runtime type imports
export interface CompanyUserDto {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  joinedAt?: string;
}

export interface SiteDto {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
  contractValue?: number;
}
import { useAuth } from '../context/AuthContext';

interface CompanyRow {
  id: string;
  companyName: string;
  email: string;
  phone?: string;
  createdAt?: string;
  paymentDue?: boolean;
}

const Adminpanel: React.FC = () => {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<CompanyUserDto[] | null>(null);
  const [selectedSites, setSelectedSites] = useState<SiteDto[] | null>(null);
  const [modalTitle, setModalTitle] = useState('');

  const fetchCompanies = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listCompanyAdmins(token);
      setCompanies((data.companies || []).map((c: any) => ({
        id: c.id,
        companyName: c.companyName,
        email: c.email,
        phone: c.phone,
        createdAt: c.createdAt,
        paymentDue: Boolean(c.paymentDue),
      })));
    } catch (err) {
      setError('Failed to load companies. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const viewUsers = async (companyName: string) => {
    if (!token) return;
    setModalTitle(`Users — ${companyName}`);
    try {
      const res = await adminApi.getCompanyUsers(companyName, token);
      setSelectedUsers(res.users || []);
      setSelectedSites(null);
    } catch (e) {
      setError('Failed to load users.');
    }
  };

  const viewSites = async (companyName: string) => {
    if (!token) return;
    setModalTitle(`Sites — ${companyName}`);
    try {
      const res = await adminApi.getCompanySites(companyName, token);
      setSelectedSites(res.sites || []);
      setSelectedUsers(null);
    } catch (e) {
      setError('Failed to load sites.');
    }
  };

  const togglePayment = async (companyName: string, enabled: boolean) => {
    if (!token) return;
    try {
      await adminApi.togglePaymentDue(companyName, enabled, token);
      await fetchCompanies();
    } catch (e) {
      setError('Failed to update payment status.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Admin Panel — Companies</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && companies.length === 0 && (
        <div className="text-gray-500 mt-8 text-center">No companies found. If you see this, check your backend API and database.</div>
      )}
      <div className="bg-white shadow rounded border p-4">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            {/* Desktop / tablet: horizontal table with overflow */}
            {companies.length > 0 && (
              <div className="hidden sm:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]">
                    <thead>
                      <tr className="text-left text-xs text-gray-500">
                        <th className="py-2">Company</th>
                        <th className="py-2">Admin Email</th>
                        <th className="py-2">Phone</th>
                        <th className="py-2">Created</th>
                        <th className="py-2">Payment Due</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c) => (
                        <tr key={c.id} className="border-t">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="font-medium">{c.companyName}</div>
                              {c.paymentDue && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                                  Payment Due
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 break-words">{c.email}</td>
                          <td className="py-3">{c.phone || '—'}</td>
                          <td className="py-3">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</td>
                          <td className="py-3">
                            <label className="inline-flex items-center space-x-2">
                              <input type="checkbox" className="rounded" checked={!!c.paymentDue} onChange={(e) => togglePayment(c.companyName, e.target.checked)} />
                              <span className="text-xs">{c.paymentDue ? 'Enabled' : 'Disabled'}</span>
                            </label>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2">
                              <button onClick={() => viewUsers(c.companyName)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">View Users</button>
                              <button onClick={() => viewSites(c.companyName)} className="px-3 py-1 bg-gray-700 text-white rounded text-xs">View Sites</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile: stacked cards */}
            <div className="space-y-3 sm:hidden">
              {companies.map((c) => (
                <div key={c.id} className="border rounded p-3 bg-gray-50 shadow-sm">
                  <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold">{c.companyName}</div>
                          {c.paymentDue && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded">
                              Payment Due
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 break-words">{c.email}</div>
                      </div>
                      <div className="text-right text-xs text-gray-500">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</div>
                    </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-xs text-gray-700">Phone: <span className="text-sm text-gray-900">{c.phone || '—'}</span></div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center space-x-2">
                        <input type="checkbox" className="rounded" checked={!!c.paymentDue} onChange={(e) => togglePayment(c.companyName, e.target.checked)} />
                        <span className="text-xs">{c.paymentDue ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => viewUsers(c.companyName)} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm">View Users</button>
                    <button onClick={() => viewSites(c.companyName)} className="flex-1 px-3 py-2 bg-gray-700 text-white rounded text-sm">View Sites</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal / Drawer */}
      {(selectedUsers || selectedSites) && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-lg sm:rounded w-full sm:w-11/12 md:w-2/3 lg:w-1/2 max-h-[85vh] sm:max-h-[80vh] overflow-auto p-4 mx-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold">{modalTitle}</h3>
              <button onClick={() => { setSelectedUsers(null); setSelectedSites(null); }} className="text-gray-600">Close</button>
            </div>
            <div>
              {selectedUsers && (
                <ul className="space-y-2">
                  {selectedUsers.map((u) => (
                    <li key={u.id} className="border rounded p-2 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-gray-500">{u.email} • {u.role}</div>
                      </div>
                      <div className="text-xs text-gray-400">Joined: {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : '—'}</div>
                    </li>
                  ))}
                </ul>
              )}

              {selectedSites && (
                <ul className="space-y-2">
                  {selectedSites.map((s) => (
                    <li key={s.id} className="border rounded p-2">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">{s.description}</div>
                      <div className="text-xs text-gray-400">Contract value: {s.contractValue ?? '—'}</div>
                    </li>
                  ))}
                </ul>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adminpanel;
