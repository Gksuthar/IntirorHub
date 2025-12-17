import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi, ApiError } from "../services/api";
import { Mail, User, Phone, Shield, Loader2 } from "lucide-react";

const roles = [
  { value: "MANAGER", label: "Manager", description: "Project management" },
  { value: "AGENT", label: "Agent", description: "Field execution" },
  { value: "CLIENT", label: "Client", description: "Project visibility" },
];

const Invite: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    role: roles[0].value,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const token = useMemo(() => localStorage.getItem("authToken"), []);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    authApi.me(token).catch(() => navigate("/login", { replace: true }));
  }, [navigate, token]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await authApi.inviteUser(
        {
          email: formData.email.trim(),
          name: formData.name.trim() || undefined,
          phone: formData.phone.trim() || undefined,
          role: formData.role as "MANAGER" | "AGENT" | "CLIENT",
        },
        token
      );

      setSuccess("Invitation sent. The teammate receives a temporary password via email.");
      setFormData({ email: "", name: "", phone: "", role: roles[0].value });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Unable to send invite";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="mx-auto w-full max-w-3xl px-4 pt-32 pb-16">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-gray-400">Invite team</p>
          <h1 className="text-3xl font-semibold text-black">Add a teammate to your workspace</h1>
          <p className="text-sm text-gray-500">
            Choose the right role and the system generates a secure password automatically. The invitee receives an email with the credentials and your company details.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Teammate name
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Hasnen Agent"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
              Phone (optional)
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="08003779983"
                  className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
                />
              </div>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Work email
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hasnen+agent@gmail.com"
                required
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
              />
            </div>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700">
            Role access
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            >
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {`${role.label} – ${role.description}`}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <Shield className="mt-0.5 h-4 w-4 text-black" />
            <p>
              The invitee receives a secure, auto-generated password. Ask them to log in and change it after the first access for maximum safety.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-black py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending invite
              </>
            ) : (
              "Send invite"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Invite;
