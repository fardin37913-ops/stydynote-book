import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

const MyListings = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyListings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/rooms/my-listings");

      if (res.data?.success) {
        setRooms(res.data.rooms || []);
      } else {
        toast.error(res.data?.message || "Failed to load your listings.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load your listings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this room?");

    if (!confirmDelete) return;

    try {
      const res = await api.delete(`/api/rooms/${roomId}`);

      if (res.data?.success) {
        toast.success(res.data.message || "Room deleted successfully.");
        setRooms((prev) => prev.filter((room) => room._id !== roomId));
      } else {
        toast.error(res.data?.message || "Failed to delete room.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete room.");
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-slate-600">Loading your listings...</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">My Listings</h1>
          <p className="mt-3 text-slate-600">
            Manage the study rooms you have added.
          </p>
        </div>

        <p className="text-slate-600">
          Total Listings:{" "}
          <span className="font-semibold text-slate-950">{rooms.length}</span>
        </p>
      </div>

      {rooms.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">You have not added any rooms yet.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
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
                    <p className="font-semibold text-slate-950">{room.floor}</p>
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

                <button
                  onClick={() => handleDeleteRoom(room._id)}
                  className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Delete Room
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyListings;