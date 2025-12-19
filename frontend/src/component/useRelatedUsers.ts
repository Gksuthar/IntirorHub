import { useEffect, useState } from "react";

export interface RelatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  joinedAt: string;
  siteAccessCount?: number;
}

export function useRelatedUsers(token: string | undefined) {
  const [users, setUsers] = useState<RelatedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/users/related`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: { users: RelatedUser[] } = await res.json();
        setUsers(data.users);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return { users, loading, error };
}
