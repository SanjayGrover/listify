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

// POST /api/lists/:id/share — Share a list with another user
router.post('/:id/share', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    if (list.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only the owner can share this list' });

    const { email, role } = req.body;
    if (!['viewer', 'editor'].includes(role)) return res.status(400).json({ message: 'Role must be viewer or editor' });

    // Find the user to share with
    const User = require('../models/User');
    const targetUser = await User.findOne({ email });
    if (!targetUser) return res.status(404).json({ message: 'No user found with that email' });
    if (targetUser._id.toString() === req.user.id) return res.status(400).json({ message: 'You cannot share a list with yourself' });

    // Check if already shared
    const alreadyShared = list.sharedWith.find(s => s.user.toString() === targetUser._id.toString());
    if (alreadyShared) {
      alreadyShared.role = role; // Update role if already shared
    } else {
      list.sharedWith.push({ user: targetUser._id, role });
    }

    await list.save();
    res.json({ message: `List shared with ${targetUser.name} as ${role}` });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/lists/:id/share/:userId — Remove a user from shared list
router.delete('/:id/share/:userId', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id);
    if (!list) return res.status(404).json({ message: 'List not found' });
    if (list.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Only the owner can manage sharing' });

    list.sharedWith = list.sharedWith.filter(s => s.user.toString() !== req.params.userId);
    await list.save();
    res.json({ message: 'User removed from shared list' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/lists/:id/share — Get all users a list is shared with
router.get('/:id/share', auth, async (req, res) => {
  try {
    const list = await List.findById(req.params.id).populate('sharedWith.user', 'name email');
    if (!list) return res.status(404).json({ message: 'List not found' });
    if (list.owner.toString() !== req.user.id) return res.status(403).json({ message: 'Access denied' });

    res.json(list.sharedWith);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;