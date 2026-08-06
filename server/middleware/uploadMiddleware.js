const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");

// uploads folder agar nahi hai to bana do
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);

  if (ext !== ".xlsx" && ext !== ".xls") {
    return cb(new Error("Only Excel files are allowed"));
  }

  cb(null, true);
};

module.exports = multer({
  storage,
  fileFilter,
});
