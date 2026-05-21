import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const fallbackImage =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80";

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isBookingCancellable = (booking) => {
  if (booking.status !== "confirmed") return false;

  const today = getTodayDateString();

  if (booking.date > today) return true;
  if (booking.date < today) return false;

  const [startHour, startMinute] = booking.startTime.split(":").map(Number);
  const bookingStart = new Date();
  bookingStart.setHours(startHour, startMinute, 0, 0);

  return bookingStart > new Date();
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/bookings/my-bookings");

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login first to view your bookings.");
        navigate("/login");
        return;
      }

      toast.error(error.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelTarget) return;

    try {
      setCancelLoading(true);

      const res = await api.patch(`/api/bookings/${cancelTarget._id}/cancel`);

      if (res.data?.success) {
        toast.success(res.data.message || "Booking cancelled.");

        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === cancelTarget._id
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );

        setCancelTarget(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      toast.error("Please login first to view your bookings.");
      navigate("/login");
      return;
    }

    fetchMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  if (authLoading || loading) {
    return <LoadingSpinner text="Loading your bookings..." />;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">My Bookings</h1>
          <p className="mt-3 text-slate-600">
            View and manage your study room bookings.
          </p>
        </div>

        <p className="text-slate-600">
          Total Bookings:{" "}
          <span className="font-semibold text-slate-950">
            {bookings.length}
          </span>
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">You have no bookings yet.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => {
            const room = booking.roomSnapshot || {};
            const canCancel = isBookingCancellable(booking);

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <img
                  src={room.image || fallbackImage}
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                  alt={room.roomName || "Booked room"}
                  className="w-full h-56 object-cover"
                />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-950">
                      {room.roomName || "Study Room"}
                    </h2>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                        booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Date</p>
                      <p className="font-semibold text-slate-950">
                        {booking.date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Time</p>
                      <p className="font-semibold text-slate-950">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Total Hours</p>
                      <p className="font-semibold text-slate-950">
                        {booking.totalHours}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Total Cost</p>
                      <p className="font-semibold text-slate-950">
                        ${booking.totalCost}
                      </p>
                    </div>
                  </div>

                  {booking.specialNote && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3">
                      <p className="text-slate-500">Special Note</p>
                      <p className="mt-1 text-slate-700">
                        {booking.specialNote}
                      </p>
                    </div>
                  )}

                  {canCancel && (
                    <button
                      onClick={() => setCancelTarget(booking)}
                      className="mt-5 w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-950">
              Cancel Booking?
            </h2>

            <p className="mt-3 text-slate-600">
              Are you sure you want to cancel this booking?
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
              </button>

              <button
                onClick={() => setCancelTarget(null)}
                disabled={cancelLoading}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default MyBookings;