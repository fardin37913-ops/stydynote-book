import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-bold text-slate-950">404</h1>
      <p className="mt-4 text-xl text-slate-600">Page not found</p>
      <Link
        to="/"
        className="inline-flex mt-8 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
      >
        Back to Home
      </Link>
    </section>
  );
};

export default NotFound;