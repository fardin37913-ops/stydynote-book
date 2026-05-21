import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    specialNote: "",
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/api/rooms/${id}`);

        if (res.data?.success) {
          setRoom(res.data.room);
        } else {
          toast.error(res.data?.message || "Failed to load room.");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load room.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookRoom = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first to book this room.");
      navigate("/login");
      return;
    }

    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      toast.error("Date, start time, and end time are required.");
      return;
    }

    try {
      setBookingLoading(true);

      const res = await api.post("/api/bookings", {
        roomId: room._id,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        specialNote: bookingData.specialNote,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Room booked successfully.");
        navigate("/my-bookings");
      } else {
        toast.error(res.data?.message || "Failed to book room.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to book room.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-slate-600">Loading room details...</p>
      </section>
    );
  }

  if (!room) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-950">Room not found</h1>
        <Link to="/rooms" className="mt-5 inline-flex text-blue-600 font-semibold">
          Back to rooms
        </Link>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/rooms" className="text-blue-600 font-semibold">
        ← Back to rooms
      </Link>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <img
            src={room.image}
            alt={room.roomName}
            className="w-full h-[420px] object-cover"
          />

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-slate-950">
                  {room.roomName}
                </h1>
                <p className="mt-3 text-slate-600">{room.description}</p>
              </div>

              <span className="shrink-0 rounded-full bg-blue-100 px-4 py-2 text-blue-700 font-bold">
                ${room.hourlyRate}/hr
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Floor</p>
                <p className="font-semibold text-slate-950">{room.floor}</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Capacity</p>
                <p className="font-semibold text-slate-950">
                  {room.capacity} people
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold text-slate-950">Amenities</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {room.amenities?.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {room.owner && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Listed by</p>
                <p className="font-semibold text-slate-950">
                  {room.owner.name}
                </p>
                <p className="text-slate-600">{room.owner.email}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
          <h2 className="text-3xl font-bold text-slate-950">Book This Room</h2>
          <p className="mt-2 text-slate-600">
            Select your preferred date and time slot.
          </p>

          <form onSubmit={handleBookRoom} className="mt-8 space-y-5">
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={bookingData.date}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block mb-2 font-medium text-slate-700">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={bookingData.startTime}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-slate-700">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={bookingData.endTime}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Special Note
              </label>
              <textarea
                name="specialNote"
                value={bookingData.specialNote}
                onChange={handleChange}
                rows="4"
                placeholder="Need a quiet room for exam preparation."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={bookingLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RoomDetails;