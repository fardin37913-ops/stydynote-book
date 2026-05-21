import { NavLink, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logout successful.");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold"
      : "text-slate-700 font-medium hover:text-blue-600";

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
        <Link to="/" className="text-2xl font-bold text-slate-950">
          StudyNook
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>

          <NavLink to="/rooms" className={navLinkClass}>
            Rooms
          </NavLink>

          <NavLink to="/add-room" className={navLinkClass}>
            Add Room
          </NavLink>

          <NavLink to="/my-listings" className={navLinkClass}>
            My Listings
          </NavLink>

          <NavLink to="/my-bookings" className={navLinkClass}>
            My Bookings
          </NavLink>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <img
                  src={user.photoURL || "https://i.ibb.co/4pDNDk1/avatar.png"}
                  onError={(e) => {
                    e.currentTarget.src = "https://i.ibb.co/4pDNDk1/avatar.png";
                  }}
                  alt={user.name || "User"}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />

                <span className="hidden sm:inline font-semibold text-slate-800">
                  {user.name || "User"}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-500 px-4 py-2 font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl border border-blue-600 px-5 py-2 font-semibold text-blue-600 hover:bg-blue-50"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;