const express = require('express');
const router = express.Router();
const List = require('../models/List');
const auth = require('../middleware/auth');

// GET /api/lists — Get all lists for logged in user
router.get('/', auth, async (req, res) => {
  try {
    const lists = await List.find({
      $or: [
        { owner: req.user.id },
        { 'sharedWith.user': req.user.id }
      ]
    });
    res.json(lists);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/lists/:id — Get a single list
router.get('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });

    const isOwner = list.owner.toString() === req.user.id;
    const isShared = list.sharedWith.some(s => s.user.toString() === req.user.id);
    if (!isOwner && !isShared) return res.status(403).json({ message: 'Access denied' });

    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/lists — Create a new list
router.post('/', auth, async (req, res) => {
  try {
    const { title } = req.body;
    const list = await List.create({ title, owner: req.user.id, items: [] });
    res.status(201).json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/lists/:id — Update list title
router.put('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    if (list.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    list.title = req.body.title || list.title;
    await list.save();
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/lists/:id — Delete a list
router.delete('/:id', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    if (list.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    await list.deleteOne();
    res.json({ message: 'List deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;