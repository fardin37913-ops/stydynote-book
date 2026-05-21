const { ObjectId } = require("mongodb");

const getUserId = (req) => {
  return req.user?.id || req.user?._id?.toString();
};

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const isValidHourlySlot = (time) => {
  if (!time || typeof time !== "string") return false;

  const allowedSlots = [
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

  return allowedSlots.includes(time);
};

const getHour = (time) => {
  return Number(time.split(":")[0]);
};

const bookRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");

    const userId = getUserId(req);
    const { roomId, date, startTime, endTime, specialNote } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first.",
      });
    }

    if (!roomId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Room, date, start time, and end time are required.",
      });
    }

    if (!ObjectId.isValid(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    const today = getTodayDateString();

    if (date < today) {
      return res.status(400).json({
        success: false,
        message: "Booking date must be today or a future date.",
      });
    }

    if (!isValidHourlySlot(startTime) || !isValidHourlySlot(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time must be valid hourly slots.",
      });
    }

    const startHour = getHour(startTime);
    const endHour = getHour(endTime);

    if (endHour <= startHour) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time.",
      });
    }

    const room = await roomsCollection.findOne({
      _id: new ObjectId(roomId),
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
      });
    }

    const conflictBooking = await bookingsCollection.findOne({
      roomId: new ObjectId(roomId),
      date,
      status: "confirmed",
      $or: [
        {
          startHour: {
            $gte: startHour,
            $lt: endHour,
          },
        },
        {
          endHour: {
            $gt: startHour,
            $lte: endHour,
          },
        },
        {
          startHour: {
            $lte: startHour,
          },
          endHour: {
            $gte: endHour,
          },
        },
      ],
    });

    if (conflictBooking) {
      return res.status(409).json({
        success: false,
        message: "This room is already booked for the selected time slot.",
      });
    }

    const totalHours = endHour - startHour;
    const totalCost = totalHours * Number(room.hourlyRate);

    const newBooking = {
      roomId: new ObjectId(roomId),
      userId: new ObjectId(userId),
      date,
      startTime,
      endTime,
      startHour,
      endHour,
      totalHours,
      totalCost,
      specialNote: specialNote || "",
      status: "confirmed",
      roomSnapshot: {
        roomName: room.roomName,
        image: room.image,
        floor: room.floor,
        capacity: room.capacity,
        hourlyRate: room.hourlyRate,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $push: {
          bookings: result.insertedId,
        },
      }
    );

    await roomsCollection.updateOne(
      { _id: new ObjectId(roomId) },
      {
        $inc: {
          bookingCount: 1,
        },
      }
    );

    return res.status(201).json({
      success: true,
      message: "Room booked successfully!",
      bookingId: result.insertedId,
    });
  } catch (error) {
    console.error("Book room error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while booking the room.",
    });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const bookingsCollection = db.collection("bookings");

    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first.",
      });
    }

    const bookings = await bookingsCollection
      .find({
        userId: new ObjectId(userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching your bookings.",
    });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");
    const roomsCollection = db.collection("rooms");

    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login first.",
      });
    }

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
    }

    const booking = await bookingsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    if (booking.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to cancel this booking.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled.",
      });
    }

    const today = getTodayDateString();

    if (booking.date < today) {
      return res.status(400).json({
        success: false,
        message: "Past bookings cannot be cancelled.",
      });
    }

    await bookingsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      }
    );

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      {
        $pull: {
          bookings: new ObjectId(id),
        },
      }
    );

    await roomsCollection.updateOne(
      {
        _id: booking.roomId,
        bookingCount: {
          $gt: 0,
        },
      },
      {
        $inc: {
          bookingCount: -1,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled.",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while cancelling the booking.",
    });
  }
};

module.exports = {
  bookRoom,
  getMyBookings,
  cancelBooking,
};