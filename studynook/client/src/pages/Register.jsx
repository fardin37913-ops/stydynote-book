import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, googleLogin } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    photoURL: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must include at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must include at least one lowercase letter.";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.photoURL ||
      !formData.password
    ) {
      toast.error("Name, email, photo URL, and password are required.");
      return;
    }

    const passwordError = validatePassword(formData.password);

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        photoURL: formData.photoURL.trim(),
        password: formData.password,
      });

      if (data?.success) {
        toast.success(data.message || "Registration successful. Please login.");
        navigate("/login");
      } else {
        toast.error(data?.message || "Registration failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setGoogleLoading(true);

      const data = await googleLogin();

      if (data?.success) {
        toast.success(data.message || "Google registration successful.");
        navigate("/");
      } else {
        toast.error(data?.message || "Google registration failed.");
      }
    } catch (error) {
      console.error("Google register error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Google registration failed."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <section className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-slate-950">Register</h1>

        <p className="mt-2 text-slate-600">
          Create your StudyNook account.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Name
            </label>

            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Arafat"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

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
              Photo URL
            </label>

            <input
              type="text"
              name="photoURL"
              required
              value={formData.photoURL}
              onChange={handleChange}
              placeholder="https://example.com/photo.jpg"
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

            <p className="mt-2 text-sm text-slate-500">
              Password must include 6 characters, one uppercase, and one lowercase letter.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200"></div>
          <span className="text-sm text-slate-500">OR</span>
          <div className="h-px flex-1 bg-slate-200"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={googleLoading}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {googleLoading ? "Connecting..." : "Continue with Google"}
        </button>

        <p className="mt-6 text-center text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Register;