import { Link } from "react-router-dom";

const Home = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="inline-flex px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
            Library Study Room Booking
          </p>

          <h1 className="mt-6 text-4xl md:text-6xl font-bold text-slate-950 leading-tight">
            Find Your Perfect Study Room
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-xl">
            Browse and book quiet, private study rooms in your library. List your own room and help others study better.
          </p>

          <Link
            to="/rooms"
            className="inline-flex mt-8 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Explore Rooms
          </Link>
        </div>

        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
          <img
            src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da"
            alt="Study room"
            className="w-full h-[360px] object-cover rounded-2xl"
          />
        </div>
      </div>
    </section>
  );
};

export default Home;