import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import { authApi, ApiError } from "../services/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  // loading state removed
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      // loading removed
      await authApi.forgotPassword({ email: email.trim() });
      setMessage(
        "If an account exists with this email, a password reset link was sent."
      );
      setEmail("");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to send reset email";
      setError(msg);
    } finally {
      // loading removed
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Forgot password</h2>
        <p className="text-sm text-gray-500 mb-4">Enter your account email and we'll send a link to reset your password.</p>

        {error && <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
        {message && <div className="mb-3 rounded-lg border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-700">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Work email
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>
          </label>

          <div className="flex items-center justify-between">
            <Link to="/login" className="text-sm text-gray-500">Back to login</Link>
            <button type="submit" className="rounded-xl bg-black px-4 py-2 text-white">
              Send reset link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
