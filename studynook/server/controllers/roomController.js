const { ObjectId } = require("mongodb");

const roomsCollectionName = "rooms";

const addRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection(roomsCollectionName);

    const user = req.user;
    const { roomName, description, image, floor, capacity, hourlyRate, amenities } = req.body;

    if (!roomName || !description || !image || !floor || !capacity || !hourlyRate) {
      return res.status(400).json({
        success: false,
        message: "All required room fields are needed.",
      });
    }

    const newRoom = {
      roomName,
      description,
      image,
      floor,
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      amenities: Array.isArray(amenities) ? amenities : [],
      bookingCount: 0,
      ownerId: user._id,
      owner: {
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await roomsCollection.insertOne(newRoom);

    return res.status(201).json({
      success: true,
      message: "Room added successfully.",
      roomId: result.insertedId,
    });
  } catch (error) {
    console.error("Add room error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding room.",
    });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection(roomsCollectionName);

    const rooms = await roomsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get rooms error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching rooms.",
    });
  }
};

const getMyListings = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection(roomsCollectionName);

    const user = req.user;

    const rooms = await roomsCollection
      .find({ ownerId: user._id })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your listings.",
    });
  }
};

const getSingleRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection(roomsCollectionName);

    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const room = await roomsCollection.findOne({ _id: new ObjectId(id) });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get single room error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching room.",
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection(roomsCollectionName);

    const user = req.user;
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const room = await roomsCollection.findOne({ _id: new ObjectId(id) });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (room.ownerId !== user._id) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this room.",
      });
    }

    await roomsCollection.deleteOne({ _id: new ObjectId(id) });

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting room.",
    });
  }
};

module.exports = {
  addRoom,
  getAllRooms,
  getMyListings,
  getSingleRoom,
  deleteRoom,
};