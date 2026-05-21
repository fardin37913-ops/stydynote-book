const express = require("express");
const {
  addRoom,
  getAllRooms,
  getMyListings,
  getSingleRoom,
  deleteRoom,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllRooms);
router.get("/my-listings", authMiddleware, getMyListings);
router.get("/:id", getSingleRoom);
router.post("/", authMiddleware, addRoom);
router.delete("/:id", authMiddleware, deleteRoom);

module.exports = router;