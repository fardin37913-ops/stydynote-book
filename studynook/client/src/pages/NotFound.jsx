import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-blue-600 font-semibold">404 Error</p>

        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-slate-950">
          Page not found
        </h1>

        <p className="mt-5 text-slate-600 max-w-xl mx-auto">
          The page you are looking for does not exist or may have been moved.
          Please return to the homepage and continue browsing StudyNook.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
};

export default NotFound;