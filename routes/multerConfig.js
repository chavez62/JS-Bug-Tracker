const multer = require("multer");
const path = require("path");

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Store files in the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append file extension to a timestamped filename
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
