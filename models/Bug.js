const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bugSchema = new mongoose.Schema({
  id: { type: String, default: () => uuidv4().slice(0, 8) }, // Use first 8 characters of a UUID
  title: { type: String, required: true },
  module: { type: String, required: true },
  description: { type: String, required: true },
  reporter: { type: String, required: true },
  dateReported: { type: Date, required: true },
  steps: { type: String, required: true },
  expectedBehavior: { type: String, required: true },
  actualBehavior: { type: String, required: true },
  severity: { type: String, required: true },
  status: { type: String, required: true },
  priority: { type: String, required: true },
  attachment: { type: String, required: false },
});

module.exports = mongoose.model('Bug', bugSchema);
