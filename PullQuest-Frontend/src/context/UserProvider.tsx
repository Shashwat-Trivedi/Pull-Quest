// src/context/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookie from "js-cookie";

interface User {
  id: string;
  email?: string;
  role: "contributor" | "maintainer" | "company";
  githubUsername?: string;
  accessToken: string; // the JWT
}

interface UserContextType {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      Cookie.set("pq_user", JSON.stringify(u), { expires: 30 });
      Cookie.set("pq_token", u.accessToken, { expires: 30 });
    } else {
      Cookie.remove("pq_user");
      Cookie.remove("pq_token");
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      const storedUser = Cookie.get("pq_user");
      const token = Cookie.get("pq_token");

      if (storedUser && token) {
        try {
          // optional server refresh
          const res = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:8012"}/api/user`,
            {
              credentials: "include",
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (res.ok) {
            const fresh = await res.json();
            setUser(fresh);
          } else {
            setUser(JSON.parse(storedUser)); // fall back to cookie copy
          }
        } catch (err) {
          console.error("User refresh failed:", err);
          setUser(JSON.parse(storedUser));
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const logout = () => {
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

/* Hook */
export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
};
