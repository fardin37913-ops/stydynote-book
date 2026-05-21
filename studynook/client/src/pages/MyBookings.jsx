import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/bookings/my-bookings");

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      } else {
        toast.error(res.data?.message || "Failed to load bookings.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) return;

    try {
      const res = await api.patch(`/api/bookings/${bookingId}/cancel`);

      if (res.data?.success) {
        toast.success(res.data.message || "Booking cancelled successfully.");

        setBookings((prev) =>
          prev.map((booking) =>
            booking._id === bookingId
              ? { ...booking, status: "cancelled" }
              : booking
          )
        );
      } else {
        toast.error(res.data?.message || "Failed to cancel booking.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking.");
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-slate-600">Loading your bookings...</p>
      </section>
    );
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

            return (
              <div
                key={booking._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <img
                  src={room.image}
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

                  {booking.status !== "cancelled" && (
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
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
    </section>
  );
};

export default MyBookings;