import { Link } from "react-router-dom";

const socialLinks = [
  {
    name: "Facebook",
    label: "f",
    href: "https://facebook.com",
  },
  {
    name: "X",
    label: "𝕏",
    href: "https://x.com",
  },
  {
    name: "LinkedIn",
    label: "in",
    href: "https://linkedin.com",
  },
  {
    name: "Instagram",
    label: "◎",
    href: "https://instagram.com",
  },
];

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-bold">StudyNook</h2>

            <p className="mt-4 max-w-sm text-slate-300 leading-relaxed">
              Find and book quiet study rooms for better focus and productive
              study sessions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Useful Links</h3>

            <div className="mt-4 flex flex-col gap-3 text-slate-300">
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>

              <Link to="/rooms" className="hover:text-white transition">
                Rooms
              </Link>

              <Link to="/add-room" className="hover:text-white transition">
                Add Room
              </Link>

              <Link to="/my-bookings" className="hover:text-white transition">
                My Bookings
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Contact</h3>

            <div className="mt-4 space-y-3 text-slate-300">
              <p>Email: support@studynook.com</p>
              <p>Phone: +880 1234 567890</p>
            </div>

            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={item.name}
                  title={item.name}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white hover:bg-blue-600 transition"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-slate-400">
          © 2026 StudyNook. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;