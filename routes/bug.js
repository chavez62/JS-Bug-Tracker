const express = require("express");
const router = express.Router();
const Bug = require("../models/Bug");
const upload = require("../routes/multerConfig"); // Update the path to your multer configuration

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

// Home route with pagination
router.get("/", isAuthenticated, async (req, res) => {
  const filter = req.query.filter;
  const page = parseInt(req.query.page) || 1; // Current page number
  const limit = 10; // Number of items per page

  let query = {};

  if (filter) {
    const filterLower = filter.toLowerCase();
    query = {
      $or: [
        { title: { $regex: filterLower, $options: "i" } },
        { module: { $regex: filterLower, $options: "i" } },
        { description: { $regex: filterLower, $options: "i" } },
        { reporter: { $regex: filterLower, $options: "i" } },
        { steps: { $regex: filterLower, $options: "i" } },
        { expectedBehavior: { $regex: filterLower, $options: "i" } },
        { actualBehavior: { $regex: filterLower, $options: "i" } },
        { severity: { $regex: filterLower, $options: "i" } },
        { status: { $regex: filterLower, $options: "i" } },
        { priority: { $regex: filterLower, $options: "i" } },
      ],
    };
  }

  const totalItems = await Bug.countDocuments(query);
  const totalPages = Math.ceil(totalItems / limit);

  const bugs = await Bug.find(query)
    .skip((page - 1) * limit)
    .limit(limit);

  res.render("index", {
    bugs,
    currentPage: page,
    totalPages,
    filter,
  });
});

// Create new bug
router.get("/create", isAuthenticated, (req, res) => {
  res.render("create");
});

router.post(
  "/create",
  isAuthenticated,
  upload.single("attachment"),
  async (req, res) => {
    const {
      title,
      module,
      description,
      reporter,
      dateReported,
      steps,
      expectedBehavior,
      actualBehavior,
      severity,
      status,
      priority,
    } = req.body;
    const attachment = req.file ? req.file.filename : null;

    const newBug = new Bug({
      title,
      module,
      description,
      reporter,
      dateReported,
      steps,
      expectedBehavior,
      actualBehavior,
      severity,
      status,
      priority,
      attachment,
    });

    await newBug.save();
    res.redirect("/");
  }
);

// Edit bug
router.get("/edit/:id", isAuthenticated, async (req, res) => {
  const bug = await Bug.findOne({ id: req.params.id });

  if (bug.dateReported) {
    bug.dateReported = bug.dateReported.toISOString().split('T')[0];
  }

  res.render("edit", { bug });
});

router.post("/edit/:id", isAuthenticated, upload.single("attachment"), async (req, res) => {
  const {
    title,
    module,
    description,
    reporter,
    dateReported,
    steps,
    expectedBehavior,
    actualBehavior,
    severity,
    status,
    priority
  } = req.body;

  const attachment = req.file ? req.file.filename : req.body.existingAttachment;

  await Bug.findOneAndUpdate(
    { id: req.params.id },
    {
      title,
      module,
      description,
      reporter,
      dateReported,
      steps,
      expectedBehavior,
      actualBehavior,
      severity,
      status,
      priority,
      attachment,
    }
  );

  res.redirect("/");
});

// Delete bug
router.post("/delete/:id", isAuthenticated, async (req, res) => {
  await Bug.findOneAndDelete({ id: req.params.id });
  res.redirect("/");
});

module.exports = router;