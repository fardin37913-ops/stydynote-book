import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/api/rooms");

        if (res.data?.success) {
          setRooms(res.data.rooms || []);
        } else {
          setError("Failed to load rooms.");
        }
      } catch (err) {
        console.error("Fetch rooms error:", err);
        setError("Could not connect to backend server.");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-slate-600">Loading rooms...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-950">Available Rooms</h1>
        <p className="mt-4 text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">
            Available Rooms
          </h1>
          <p className="mt-3 text-slate-600">
            Browse available study rooms and book your preferred time slot.
          </p>
        </div>

        <p className="text-slate-600">
          Total Rooms:{" "}
          <span className="font-semibold text-slate-950">{rooms.length}</span>
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No rooms found.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <img
                src={room.image}
                alt={room.roomName}
                className="w-full h-56 object-cover"
              />

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-slate-950">
                    {room.roomName}
                  </h2>

                  <span className="shrink-0 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    ${room.hourlyRate}/hr
                  </span>
                </div>

                <p className="mt-3 text-slate-600 line-clamp-3">
                  {room.description}
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
                  {room.amenities?.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/rooms/${room._id}`}
                  className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Rooms;