import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= Auto redirect if logged in ================= */
  useEffect(() => {
    const user = localStorage.getItem("auth_user");
    if (user) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  /* ================= Login Handler ================= */
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (email === "admin@test.com" && password === "admin123") {
      localStorage.setItem(
        "auth_user",
        JSON.stringify({
          email,
          loginAt: new Date().toISOString(),
        })
      );
      navigate("/", { replace: true });
    } else {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen flex items-center justify-center px-4
        bg-gradient-to-br
        from-[#0A1A3A] via-[#0F2A5F] to-[#132F7A]
      "
    >
      {/* ===== Login Card ===== */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        
        {/* ===== Top Accent Bar ===== */}
        <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600" />

        <div className="p-8">
          {/* ===== Header ===== */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-7 w-7 text-blue-900" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-blue-900">
              Security Monitoring Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              TM One ESOC Unified Platform
            </p>
          </div>

          {/* ===== Error ===== */}
          {error && (
            <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          {/* ===== Login Form ===== */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Email
              </label>
              <input
                type="email"
                placeholder="admin@test.com"
                className="
                  h-11 w-full rounded-md border border-gray-300 px-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-600
                "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="
                  h-11 w-full rounded-md border border-gray-300 px-3 text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-600
                "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                mt-2 h-11 w-full rounded-md
                bg-orange-500 text-white text-sm font-semibold
                hover:bg-orange-600 transition
                disabled:opacity-60 disabled:cursor-not-allowed
              "
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* ===== Footer Info ===== */}
          <div className="mt-6 rounded-md bg-gray-50 p-3 text-center text-xs text-gray-600">
            <p className="font-medium text-gray-700">Demo Access</p>
            <p>
              <b>admin@test.com</b> / <b>admin123</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
