const { ObjectId } = require("mongodb");

const isValidObjectId = (id) => ObjectId.isValid(id);

const addRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");
    const usersCollection = db.collection("users");

    const {
      roomName,
      description,
      image,
      floor,
      capacity,
      hourlyRate,
      amenities,
    } = req.body || {};

    if (
      !roomName ||
      !description ||
      !image ||
      !floor ||
      !capacity ||
      !hourlyRate ||
      !Array.isArray(amenities) ||
      amenities.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Room name, description, image, floor, capacity, hourly rate, and amenities are required.",
      });
    }

    const owner = await usersCollection.findOne({
      _id: new ObjectId(req.user.id),
    });

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: "Owner user not found.",
      });
    }

    const newRoom = {
      roomName: roomName.trim(),
      description: description.trim(),
      image: image.trim(),
      floor: String(floor).trim(),
      capacity: Number(capacity),
      hourlyRate: Number(hourlyRate),
      amenities,
      bookingCount: 0,
      ownerId: new ObjectId(req.user.id),
      owner: {
        name: owner.name,
        email: owner.email,
        photoURL: owner.photoURL,
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
    console.error("Add room error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding the room.",
    });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");

    const { search, amenities, minRate, maxRate, floor } = req.query;

    const query = {};

    if (search) {
      query.roomName = {
        $regex: search,
        $options: "i",
      };
    }

    if (amenities) {
      const amenitiesArray = amenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      if (amenitiesArray.length > 0) {
        query.amenities = {
          $in: amenitiesArray,
        };
      }
    }

    if (floor) {
      query.floor = {
        $regex: floor,
        $options: "i",
      };
    }

    if (minRate || maxRate) {
      query.hourlyRate = {};

      if (minRate) {
        query.hourlyRate.$gte = Number(minRate);
      }

      if (maxRate) {
        query.hourlyRate.$lte = Number(maxRate);
      }
    }

    const rooms = await roomsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get all rooms error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching rooms.",
    });
  }
};

const getLatestRooms = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");

    const rooms = await roomsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get latest rooms error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching latest rooms.",
    });
  }
};

const getSingleRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const room = await roomsCollection.findOne({
      _id: new ObjectId(id),
    });

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
    console.error("Get single room error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching room details.",
    });
  }
};

const getMyListings = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");

    const rooms = await roomsCollection
      .find({
        ownerId: new ObjectId(req.user.id),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error("Get my listings error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your listings.",
    });
  }
};

const updateRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const existingRoom = await roomsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (existingRoom.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You can update only your own room.",
      });
    }

    const allowedFields = [
      "roomName",
      "description",
      "image",
      "floor",
      "capacity",
      "hourlyRate",
      "amenities",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (updateData.roomName) updateData.roomName = updateData.roomName.trim();
    if (updateData.description) updateData.description = updateData.description.trim();
    if (updateData.image) updateData.image = updateData.image.trim();
    if (updateData.floor) updateData.floor = String(updateData.floor).trim();
    if (updateData.capacity) updateData.capacity = Number(updateData.capacity);
    if (updateData.hourlyRate) updateData.hourlyRate = Number(updateData.hourlyRate);

    updateData.updatedAt = new Date();

    const result = await roomsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    return res.status(200).json({
      success: true,
      message: "Room updated successfully.",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Update room error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the room.",
    });
  }
};

const deleteRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");

    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const existingRoom = await roomsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    if (existingRoom.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You can delete only your own room.",
      });
    }

    const relatedBookings = await bookingsCollection
      .find({
        roomId: new ObjectId(id),
      })
      .project({ _id: 1 })
      .toArray();

    const relatedBookingIds = relatedBookings.map((booking) => booking._id);

    if (relatedBookingIds.length > 0) {
      await usersCollection.updateMany(
        {},
        {
          $pull: {
            bookings: {
              $in: relatedBookingIds,
            },
          },
        }
      );

      await bookingsCollection.deleteMany({
        roomId: new ObjectId(id),
      });
    }

    await roomsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    return res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
    });
  } catch (error) {
    console.error("Delete room error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the room.",
    });
  }
};

module.exports = {
  addRoom,
  getAllRooms,
  getLatestRooms,
  getSingleRoom,
  getMyListings,
  updateRoom,
  deleteRoom,
};