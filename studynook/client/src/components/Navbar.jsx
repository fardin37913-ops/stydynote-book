import { Link, NavLink } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useAuth();

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold"
      : "text-slate-700 hover:text-blue-600";

  const handleLogout = async () => {
    try {
      const data = await logoutUser();

      if (data?.success) {
        toast.success(data.message || "Logout successful.");
      } else {
        toast.error(data?.message || "Logout failed.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed.");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
      <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-slate-900">
          StudyNook
        </Link>

        <div className="hidden md:flex items-center gap-6">
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
              <div className="hidden sm:flex items-center gap-2">
                <img
                  src={user.photoURL}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover border border-slate-200"
                />
                <span className="font-semibold text-slate-800">
                  {user.name}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg border border-red-500 text-red-600 font-medium hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
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