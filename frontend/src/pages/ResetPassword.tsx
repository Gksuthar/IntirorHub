import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { authApi, ApiError } from "../services/api";

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // loading state removed
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link");
    }
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      // loading removed
      await authApi.resetPassword({ email, token, newPassword: password });
      navigate('/login', { state: { email } });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Unable to reset password";
      setError(msg);
    } finally {
      // loading removed
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Reset password</h2>
        <p className="text-sm text-gray-500 mb-4">Set a new password for your account.</p>

        {error && <div className="mb-3 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            New password
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Confirm password
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </label>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => navigate('/login')} className="text-sm text-gray-500">Back to login</button>
            <button type="submit" className="rounded-xl bg-black px-4 py-2 text-white">
              Save password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
