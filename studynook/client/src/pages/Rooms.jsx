import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

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

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    floor: "",
    minRate: "",
    maxRate: "",
    amenities: [],
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();

    if (filters.search.trim()) {
      params.append("search", filters.search.trim());
    }

    if (filters.floor.trim()) {
      params.append("floor", filters.floor.trim());
    }

    if (filters.minRate) {
      params.append("minRate", filters.minRate);
    }

    if (filters.maxRate) {
      params.append("maxRate", filters.maxRate);
    }

    if (filters.amenities.length > 0) {
      params.append("amenities", filters.amenities.join(","));
    }

    return params.toString();
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError("");

      const queryString = buildQueryString();
      const endpoint = queryString ? `/api/rooms?${queryString}` : "/api/rooms";

      const res = await api.get(endpoint);

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

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFilters((prev) => {
      const alreadySelected = prev.amenities.includes(amenity);

      return {
        ...prev,
        amenities: alreadySelected
          ? prev.amenities.filter((item) => item !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchRooms();
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      floor: "",
      minRate: "",
      maxRate: "",
      amenities: [],
    });

    setTimeout(() => {
      fetchRooms();
    }, 0);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-950">
            Available Rooms
          </h1>
          <p className="mt-3 text-slate-600">
            Search, filter, and book your preferred study room.
          </p>
        </div>

        <p className="text-slate-600">
          Total Rooms:{" "}
          <span className="font-semibold text-slate-950">{rooms.length}</span>
        </p>
      </div>

      <form
        onSubmit={handleFilterSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Search Room
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleInputChange}
              placeholder="Quiet Focus Room"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Floor
            </label>
            <input
              type="text"
              name="floor"
              value={filters.floor}
              onChange={handleInputChange}
              placeholder="3rd Floor"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Min Rate
            </label>
            <input
              type="number"
              name="minRate"
              value={filters.minRate}
              onChange={handleInputChange}
              placeholder="5"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Max Rate
            </label>
            <input
              type="number"
              name="maxRate"
              value={filters.maxRate}
              onChange={handleInputChange}
              placeholder="20"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600"
            />
          </div>
        </div>

        <div className="mt-5">
          <label className="block mb-3 font-medium text-slate-700">
            Amenities
          </label>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {amenityOptions.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 cursor-pointer hover:border-blue-400"
              >
                <input
                  type="checkbox"
                  checked={filters.amenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="h-4 w-4"
                />
                <span className="font-medium text-slate-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Apply Filters
          </button>

          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {loading ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">Loading rooms...</p>
        </div>
      ) : error ? (
        <div className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-600">No rooms found.</p>
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
                    <h2 className="text-xl font-bold text-slate-950">
                      {room.roomName}
                    </h2>

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
  );
};

export default Rooms;