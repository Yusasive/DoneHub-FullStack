const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Notification = require("../models/Notification");

// @route   GET api/notifications
// @desc    Get all notifications for a user
// @access  Private
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/notifications/mark-read
// @desc    Mark notifications as read
// @access  Private
router.post("/mark-read", verifyToken, async (req, res) => {
  const { ids } = req.body; // ids can be an array of notification ids or null/empty for all

  try {
    const query = { user_id: req.user.id, read: false };
    if (ids && ids.length > 0) {
      query._id = { $in: ids };
    }

    await Notification.updateMany(query, { $set: { read: true } });

    res.json({ msg: "Notifications marked as read" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
