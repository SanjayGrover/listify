const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  subItems: [
    {
      text: { type: String, required: true },
      completed: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    }
  ]
});

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' }
    }
  ],
  items: [itemSchema],
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);