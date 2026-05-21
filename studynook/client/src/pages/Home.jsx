import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80";

const Home = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestRooms = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/rooms/latest");

        if (res.data?.success) {
          setRooms(res.data.rooms || []);
        }
      } catch (error) {
        console.error("Latest rooms fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestRooms();
  }, []);

  return (
    <>
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
              Browse and book quiet, private study rooms in your library. List
              your own room and help others study better.
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
              src={fallbackImage}
              alt="Study room"
              className="w-full h-[360px] object-cover rounded-2xl"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-bold text-slate-950">
              Latest Available Study Rooms
            </h2>
            <p className="mt-3 text-slate-600">
              Explore the newest study spaces added by room owners.
            </p>
          </div>

          <Link to="/rooms" className="font-semibold text-blue-600">
            View All Rooms →
          </Link>
        </div>

        {loading ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">Loading latest rooms...</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-600">No rooms available yet.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => {
              const visibleAmenities = room.amenities?.slice(0, 3) || [];
              const extraAmenities =
                room.amenities?.length > 3 ? room.amenities.length - 3 : 0;

              return (
                <div
                  key={room._id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <img
                    src={room.image || fallbackImage}
                    onError={(e) => {
                      e.currentTarget.src = fallbackImage;
                    }}
                    alt={room.roomName}
                    className="w-full h-56 object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-xl font-bold text-slate-950">
                        {room.roomName}
                      </h3>

                      <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                        ${room.hourlyRate}/hr
                      </span>
                    </div>

                    <p className="mt-3 text-slate-600">
                      {room.description?.length > 100
                        ? `${room.description.slice(0, 100)}...`
                        : room.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Floor</p>
                        <p className="font-semibold text-slate-950">
                          {room.floor}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-slate-500">Capacity</p>
                        <p className="font-semibold text-slate-950">
                          {room.capacity} people
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {visibleAmenities.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                        >
                          {item}
                        </span>
                      ))}

                      {extraAmenities > 0 && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                          +{extraAmenities} more
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/rooms/${room._id}`}
                      className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">
              Quiet Spaces
            </h3>
            <p className="mt-3 text-slate-600">
              Find focused study rooms designed for reading, assignments, and
              exam preparation.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">
              Easy Booking
            </h3>
            <p className="mt-3 text-slate-600">
              Choose your date and time slot, then confirm your room booking in
              a few simple steps.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xl font-bold text-slate-950">
              Owner Dashboard
            </h3>
            <p className="mt-3 text-slate-600">
              Room owners can list study rooms and manage their available spaces
              from one dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="rounded-3xl bg-slate-950 text-white p-8 md:p-12 grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-4xl font-bold">
              Study smarter with the right environment.
            </h2>
            <p className="mt-4 text-slate-300">
              StudyNook helps students reserve private, quiet rooms so every
              study session feels organized, focused, and productive.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-5 text-center">
              <p className="text-3xl font-bold">24/7</p>
              <p className="mt-2 text-slate-300">Online Booking</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 text-center">
              <p className="text-3xl font-bold">0</p>
              <p className="mt-2 text-slate-300">Double Booking</p>
            </div>

            <div className="rounded-2xl bg-white/10 p-5 text-center">
              <p className="text-3xl font-bold">Fast</p>
              <p className="mt-2 text-slate-300">Room Discovery</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;