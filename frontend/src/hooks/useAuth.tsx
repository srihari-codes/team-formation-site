import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  batch: "A" | "B" | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, username: string, batch: "A" | "B") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    username: null,
    batch: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const username = localStorage.getItem("username");
    const batch = localStorage.getItem("batch") as "A" | "B" | null;

    if (token) {
      setAuthState({
        isAuthenticated: true,
        token,
        username,
        batch,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useCallback((token: string, username: string, batch: "A" | "B") => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("batch", batch);
    setAuthState({
      isAuthenticated: true,
      token,
      username,
      batch,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("username");
    localStorage.removeItem("batch");
    setAuthState({
      isAuthenticated: false,
      token: null,
      username: null,
      batch: null,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
