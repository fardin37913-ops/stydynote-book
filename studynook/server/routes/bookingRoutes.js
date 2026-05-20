const express = require("express");
const {
  bookRoom,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, bookRoom);
router.get("/my-bookings", authMiddleware, getMyBookings);
router.patch("/:id/cancel", authMiddleware, cancelBooking);

module.exports = router;