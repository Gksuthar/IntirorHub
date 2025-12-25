import React, { useState } from 'react';
import { authApi } from '../services/api';

const AdminSignup: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
    await authApi.registerAdmin(form);
    setSuccess('Admin registered! Please check your email for verification.');
    } catch (err: any) {
      setError(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Admin Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="w-full border p-2 rounded" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full border p-2 rounded" required type="email" />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" className="w-full border p-2 rounded" required />
        <input name="companyName" value={form.companyName} onChange={handleChange} placeholder="Company Name" className="w-full border p-2 rounded" required />
        <input name="password" value={form.password} onChange={handleChange} placeholder="Password" className="w-full border p-2 rounded" required type="password" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>{loading ? 'Registering...' : 'Register as Admin'}</button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {success && <div className="text-green-600 mt-4">{success}</div>}
    </div>
  );
};

export default AdminSignup;
