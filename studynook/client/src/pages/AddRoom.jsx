import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const AddRoom = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    roomName: "",
    description: "",
    image: "",
    floor: "",
    capacity: "",
    hourlyRate: "",
    amenities: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();

    if (
      !formData.roomName ||
      !formData.description ||
      !formData.image ||
      !formData.floor ||
      !formData.capacity ||
      !formData.hourlyRate
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      const roomData = {
        roomName: formData.roomName,
        description: formData.description,
        image: formData.image,
        floor: formData.floor,
        capacity: Number(formData.capacity),
        hourlyRate: Number(formData.hourlyRate),
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      const res = await api.post("/api/rooms", roomData);

      if (res.data?.success) {
        toast.success(res.data.message || "Room added successfully.");
        navigate("/rooms");
      } else {
        toast.error(res.data?.message || "Failed to add room.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add room.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-slate-950">Add Room</h1>
        <p className="mt-3 text-slate-600">
          Add a study room so students can browse and book it.
        </p>

        <form onSubmit={handleAddRoom} className="mt-8 grid gap-5">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Room Name
            </label>
            <input
              type="text"
              name="roomName"
              value={formData.roomName}
              onChange={handleChange}
              placeholder="Quiet Focus Room"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="A peaceful private study room designed for deep focus."
              rows="4"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/photo-1521587760476-6c12a4b040da"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Floor
              </label>
              <input
                type="text"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                placeholder="3rd Floor"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Capacity
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="4"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Hourly Rate
              </label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                placeholder="5"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Amenities
            </label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
              placeholder="Whiteboard, Wi-Fi, Power Outlets, Quiet Zone"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
            <p className="mt-2 text-sm text-slate-500">
              Separate amenities with comma.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Adding Room..." : "Add Room"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AddRoom;