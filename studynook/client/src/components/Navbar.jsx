import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const navLinkClass = ({ isActive }) =>
    isActive
      ? "text-blue-600 font-semibold"
      : "text-slate-700 hover:text-blue-600";

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
        </div>
      </nav>
    </header>
  );
};

export default Navbar;