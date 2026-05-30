import { useState } from "react";
import "./LoginPage.css";

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_TRACKING_USERS;
      if (!baseUrl) {
        setError("API not configured");
        setLoading(false);
        return;
      }

      const apiBase = baseUrl.replace(/\/users\/?$/, "");
      const verifyUrl = `${apiBase}/users/verify-password`;

      const res = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setError(data.message || "Invalid email or password");
        setLoading(false);
        return;
      }

      if (!data.passwordValid) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      const user = data.data;
      const userId = user.user_id;
      const userName = user.full_name || user.username || user.email;

      onLoginSuccess(userId, userName, user);
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="48" height="48" rx="12" fill="#1e293b"/>
            <path d="M24 12L36 18V30L24 36L12 30V18L24 12Z" stroke="white" strokeWidth="2" fill="none"/>
            <path d="M24 18V30M18 21V27M30 21V27" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div className="login-header">
          <h1 className="login-title">iHOMIS Extension</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="login-error-icon">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="email" className="login-label">Email</label>
            <div className="login-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="login-input-icon">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <div className="login-input-wrapper">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="login-input-icon">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <>
                <span className="login-spinner" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Agusan Del Norte Health System</p>
        </div>
      </div>
    </div>
  );
}

interface LoginPageProps {
  onLoginSuccess: (userId: string, userName: string, userData: any) => void;
}

export default LoginPage;
