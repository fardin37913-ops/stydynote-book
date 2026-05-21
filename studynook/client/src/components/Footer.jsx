import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h2 className="text-2xl font-bold">StudyNook</h2>
          <p className="mt-3 text-slate-300">
            Find and book quiet study rooms for better focus and productive study sessions.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Useful Links</h3>
          <div className="flex flex-col gap-2 text-slate-300">
            <Link to="/">Home</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/about">About</Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-slate-300">Email: support@studynook.com</p>
          <p className="text-slate-300">Phone: +880 1234 567890</p>
          <p className="text-slate-300 mt-3">Facebook · X · LinkedIn · Instagram</p>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-slate-400">
        © {new Date().getFullYear()} StudyNook. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;