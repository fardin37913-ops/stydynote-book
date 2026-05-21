const express = require("express");
const {
  addRoom,
  getAllRooms,
  getLatestRooms,
  getSingleRoom,
  getMyListings,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllRooms);
router.get("/latest", getLatestRooms);
router.get("/my-listings", authMiddleware, getMyListings);
router.get("/:id", getSingleRoom);

router.post("/", authMiddleware, addRoom);
router.patch("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);

module.exports = router;