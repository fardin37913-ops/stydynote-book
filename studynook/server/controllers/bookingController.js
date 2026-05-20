const { ObjectId } = require("mongodb");

const isValidObjectId = (id) => ObjectId.isValid(id);

const parseTimeToHour = (time) => {
  if (!time || typeof time !== "string") return null;

  const [hourText, minuteText] = time.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute !== 0) {
    return null;
  }

  return hour;
};

const isTodayOrFutureDate = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = new Date(`${date}T00:00:00`);
  selectedDate.setHours(0, 0, 0, 0);

  return selectedDate >= today;
};

const bookRoom = async (req, res) => {
  try {
    const db = req.app.locals.db;
    const roomsCollection = db.collection("rooms");
    const bookingsCollection = db.collection("bookings");
    const usersCollection = db.collection("users");

    const { roomId, date, startTime, endTime, specialNote } = req.body || {};

    if (!roomId || !date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Room ID, date, start time, and end time are required.",
      });
    }

    if (!isValidObjectId(roomId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
    }

    if (!isTodayOrFutureDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Booking date must be today or a future date.",
      });
    }

    const startHour = parseTimeToHour(startTime);
    const endHour = parseTimeToHour(endTime);

    if (startHour === null || endHour === null) {
      return res.status(400).json({
        success: false,
        message: "Start time and end time must be valid hourly slots.",
      });
    }

    if (startHour < 8 || startHour > 20) {
      return res.status(400).json({
        success: false,
        message: "Start time must be between 08:00 and 20:00.",
      });
    }

    if (endHour <= startHour) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time.",
      });
    }

    if (endHour > 21) {
      return res.status(400).json({
        success: false,
        message: "End time cannot be after 21:00.",
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
      startHour: { $lt: endHour },
      endHour: { $gt: startHour },
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
      userId: new ObjectId(req.user.id),
      date,
      startTime,
      endTime,
      startHour,
      endHour,
      totalHours,
      totalCost,
      specialNote: specialNote ? specialNote.trim() : "",
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
      { _id: new ObjectId(req.user.id) },
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
      totalCost,
    });
  } catch (error) {
    console.error("Book room error:", error.message);

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

    const bookings = await bookingsCollection
      .aggregate([
        {
          $match: {
            userId: new ObjectId(req.user.id),
          },
        },
        {
          $lookup: {
            from: "rooms",
            localField: "roomId",
            foreignField: "_id",
            as: "room",
          },
        },
        {
          $unwind: {
            path: "$room",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ])
      .toArray();

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error.message);

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

    const { id } = req.params;

    if (!isValidObjectId(id)) {
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

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Forbidden. You can cancel only your own booking.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This booking is already cancelled.",
      });
    }

    if (!isTodayOrFutureDate(booking.date)) {
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
      { _id: new ObjectId(req.user.id) },
      {
        $pull: {
          bookings: new ObjectId(id),
        },
      }
    );

    await roomsCollection.updateOne(
      { _id: booking.roomId },
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
    console.error("Cancel booking error:", error.message);

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