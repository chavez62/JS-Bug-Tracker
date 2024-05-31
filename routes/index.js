const express = require("express");
const router = express.Router();
const Bug = require("../models/Bug");

// Home route
router.get("/", async (req, res) => {
  const filter = req.query.filter;
  let bugs = await Bug.find();

  if (filter) {
    const filterLower = filter.toLowerCase();
    bugs = bugs.filter(
      (bug) =>
        bug.title.toLowerCase().includes(filterLower) ||
        bug.module.toLowerCase().includes(filterLower) ||
        bug.description.toLowerCase().includes(filterLower) ||
        bug.reporter.toLowerCase().includes(filterLower) ||
        bug.steps.toLowerCase().includes(filterLower) ||
        bug.expectedBehavior.toLowerCase().includes(filterLower) ||
        bug.actualBehavior.toLowerCase().includes(filterLower) ||
        bug.severity.toLowerCase().includes(filterLower) ||
        bug.status.toLowerCase().includes(filterLower) ||
        bug.priority.toLowerCase().includes(filterLower) ||
        bug.attachment.toLowerCase().includes(filterLower)
    );
  }

  res.render("index", { bugs });
});

// Create new bug
router.get("/create", (req, res) => {
  res.render("create");
});

router.post("/create", async (req, res) => {
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
    attachment,
  } = req.body;
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
});

// Edit bug
router.get("/edit/:id", async (req, res) => {
  const bug = await Bug.findById(req.params.id);
  res.render("edit", { bug });
});

router.post("/edit/:id", async (req, res) => {
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
    attachment,
  } = req.body;
  await Bug.findByIdAndUpdate(req.params.id, {
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
  res.redirect("/");
});

// Delete bug
router.post("/delete/:id", async (req, res) => {
  await Bug.findByIdAndRemove(req.params.id);
  res.redirect("/");
});

module.exports = router;
