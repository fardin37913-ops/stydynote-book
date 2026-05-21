import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";

const fallbackImage =
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80";

const amenityOptions = [
  "Whiteboard",
  "Projector",
  "Wi-Fi",
  "Power Outlets",
  "Quiet Zone",
  "Air Conditioning",
];

const timeSlots = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

const parseHour = (time) => {
  if (!time) return null;
  return Number(time.split(":")[0]);
};

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const [bookingLoading, setBookingLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    specialNote: "",
  });

  const [editData, setEditData] = useState({
    roomName: "",
    description: "",
    image: "",
    floor: "",
    capacity: "",
    hourlyRate: "",
    amenities: [],
  });

  const isOwner =
    user && room && String(room.ownerId) === String(user._id);

  const availableEndTimes = useMemo(() => {
    if (!bookingData.startTime) return [];

    const startHour = parseHour(bookingData.startTime);

    return timeSlots.filter((slot) => parseHour(slot) > startHour);
  }, [bookingData.startTime]);

  const totalCost = useMemo(() => {
    if (!room || !bookingData.startTime || !bookingData.endTime) return 0;

    const startHour = parseHour(bookingData.startTime);
    const endHour = parseHour(bookingData.endTime);

    if (startHour === null || endHour === null || endHour <= startHour) {
      return 0;
    }

    return (endHour - startHour) * Number(room.hourlyRate);
  }, [room, bookingData.startTime, bookingData.endTime]);

  const fetchRoom = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/rooms/${id}`);

      if (res.data?.success) {
        const fetchedRoom = res.data.room;

        setRoom(fetchedRoom);

        setEditData({
          roomName: fetchedRoom.roomName || "",
          description: fetchedRoom.description || "",
          image: fetchedRoom.image || "",
          floor: fetchedRoom.floor || "",
          capacity: fetchedRoom.capacity || "",
          hourlyRate: fetchedRoom.hourlyRate || "",
          amenities: fetchedRoom.amenities || [],
        });
      } else {
        toast.error(res.data?.message || "Failed to load room.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load room.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleBookingChange = (e) => {
    const { name, value } = e.target;

    setBookingData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      if (name === "startTime") {
        updatedData.endTime = "";
      }

      return updatedData;
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditAmenityChange = (amenity) => {
    setEditData((prev) => {
      const alreadySelected = prev.amenities.includes(amenity);

      return {
        ...prev,
        amenities: alreadySelected
          ? prev.amenities.filter((item) => item !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleLoginToBook = () => {
    navigate("/login");
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

    if (totalCost <= 0) {
      toast.error("Please select a valid time slot.");
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
        toast.success(res.data.message || "Room booked successfully!");
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

  const handleUpdateRoom = async (e) => {
    e.preventDefault();

    if (
      !editData.roomName ||
      !editData.description ||
      !editData.image ||
      !editData.floor ||
      !editData.capacity ||
      !editData.hourlyRate
    ) {
      toast.error("Please fill all required room fields.");
      return;
    }

    if (editData.amenities.length === 0) {
      toast.error("Please select at least one amenity.");
      return;
    }

    try {
      setUpdateLoading(true);

      const res = await api.patch(`/api/rooms/${room._id}`, {
        roomName: editData.roomName.trim(),
        description: editData.description.trim(),
        image: editData.image.trim(),
        floor: editData.floor.trim(),
        capacity: Number(editData.capacity),
        hourlyRate: Number(editData.hourlyRate),
        amenities: editData.amenities,
      });

      if (res.data?.success) {
        toast.success(res.data.message || "Room updated successfully.");
        setShowEditForm(false);
        fetchRoom();
      } else {
        toast.error(res.data?.message || "Failed to update room.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update room.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      setDeleteLoading(true);

      const res = await api.delete(`/api/rooms/${room._id}`);

      if (res.data?.success) {
        toast.success(res.data.message || "Room deleted successfully.");
        setShowDeleteModal(false);
        navigate("/rooms");
      } else {
        toast.error(res.data?.message || "Failed to delete room.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete room.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading room details..." />;
  }

  if (!room) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-950">Room not found</h1>

        <Link
          to="/rooms"
          className="mt-5 inline-flex text-blue-600 font-semibold"
        >
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
            src={room.image || fallbackImage}
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
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

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
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

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-slate-500">Booking Count</p>
                <p className="font-semibold text-slate-950">
                  {room.bookingCount || 0}
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

            {isOwner && (
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowEditForm((prev) => !prev)}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  {showEditForm ? "Close Edit Form" : "Edit Room"}
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
                >
                  Delete Room
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {showEditForm && isOwner && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-3xl font-bold text-slate-950">Edit Room</h2>

              <p className="mt-2 text-slate-600">
                Update your room information.
              </p>

              <form onSubmit={handleUpdateRoom} className="mt-6 space-y-5">
                <div>
                  <label className="block mb-2 font-medium text-slate-700">
                    Room Name
                  </label>
                  <input
                    type="text"
                    name="roomName"
                    value={editData.roomName}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    placeholder="Room name"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editData.description}
                    onChange={handleEditChange}
                    rows="4"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    placeholder="Description"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={editData.image}
                    onChange={handleEditChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    placeholder="Image URL"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">
                      Floor
                    </label>
                    <input
                      type="text"
                      name="floor"
                      value={editData.floor}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Floor"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-slate-700">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={editData.capacity}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Capacity"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-slate-700">
                      Hourly Rate
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={editData.hourlyRate}
                      onChange={handleEditChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                      placeholder="Hourly Rate"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-3 font-medium text-slate-700">
                    Amenities
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {amenityOptions.map((amenity) => (
                      <label
                        key={amenity}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:border-blue-400"
                      >
                        <input
                          type="checkbox"
                          checked={editData.amenities.includes(amenity)}
                          onChange={() => handleEditAmenityChange(amenity)}
                          className="h-4 w-4"
                        />
                        <span className="font-medium text-slate-700">
                          {amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateLoading}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {updateLoading ? "Updating..." : "Update Room"}
                </button>
              </form>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
            <h2 className="text-3xl font-bold text-slate-950">
              Book This Room
            </h2>

            <p className="mt-2 text-slate-600">
              Select your preferred date and hourly time slot.
            </p>

            {!user ? (
              <button
                onClick={handleLoginToBook}
                className="mt-8 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Login to Book
              </button>
            ) : (
              <form onSubmit={handleBookRoom} className="mt-8 space-y-5">
                <div>
                  <label className="block mb-2 font-medium text-slate-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={bookingData.date}
                    onChange={handleBookingChange}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 font-medium text-slate-700">
                      Start Time
                    </label>
                    <select
                      name="startTime"
                      value={bookingData.startTime}
                      onChange={handleBookingChange}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
                    >
                      <option value="">Select start time</option>
                      {timeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-slate-700">
                      End Time
                    </label>
                    <select
                      name="endTime"
                      value={bookingData.endTime}
                      onChange={handleBookingChange}
                      disabled={!bookingData.startTime}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 disabled:bg-slate-100"
                    >
                      <option value="">Select end time</option>
                      {availableEndTimes.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-500">Total Cost</p>
                  <p className="text-2xl font-bold text-slate-950">
                    ${totalCost}
                  </p>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-slate-700">
                    Special Note
                  </label>
                  <textarea
                    name="specialNote"
                    value={bookingData.specialNote}
                    onChange={handleBookingChange}
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
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-slate-950">
              Delete Room?
            </h2>

            <p className="mt-3 text-slate-600">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-950">
                {room.roomName}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDeleteRoom}
                disabled={deleteLoading}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>

              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Room
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default RoomDetails;