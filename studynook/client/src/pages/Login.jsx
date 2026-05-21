import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (data?.success) {
        toast.success(data.message || "Login successful.");
        navigate("/");
      } else {
        toast.error(data?.message || "Login failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);

      const data = await googleLogin();

      if (data?.success) {
        toast.success(data.message || "Google login successful.");
        navigate("/");
      } else {
        toast.error(data?.message || "Google login failed.");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google login failed."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">Login</h1>

        <p className="mt-2 text-slate-600">
          Login to your StudyNook account.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="arafat@example.com"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Test123"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-sm text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-slate-600">
          Do not have an account?{" "}
          <Link to="/register" className="font-semibold text-blue-600">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;