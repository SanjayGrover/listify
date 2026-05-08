const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParams lets us access :id from the parent route
const List = require('../models/List');
const auth = require('../middleware/auth');

// Helper to check list access
const getListWithAccess = async (listId, userId, requireEditor = false) => {
  const list = await List.findById(listId);
  if (!list) return null;

  const isOwner = list.owner.toString() === userId;
  const sharedEntry = list.sharedWith.find(s => s.user.toString() === userId);
  const isEditor = sharedEntry?.role === 'editor';

  if (!isOwner && !sharedEntry) return null;
  if (requireEditor && !isOwner && !isEditor) return null;

  return list;
};

// POST /api/lists/:id/items — Add an item
router.post('/', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    const newItem = { text: req.body.text, order: list.items.length };
    list.items.push(newItem);
    await list.save();
    res.status(201).json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/lists/:id/items/:itemId — Update an item
router.put('/:itemId', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (req.body.text !== undefined) item.text = req.body.text;
    if (req.body.completed !== undefined) item.completed = req.body.completed;

    await list.save();
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/lists/:id/items/:itemId — Delete an item
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    list.items = list.items.filter(item => item._id.toString() !== req.params.itemId);
    await list.save();
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/lists/:id/items/reorder — Reorder items
router.put('/reorder/all', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    // req.body.orderedIds is an array of item IDs in the new order
    const { orderedIds } = req.body;
    const itemMap = Object.fromEntries(list.items.map(item => [item._id.toString(), item]));
    list.items = orderedIds.map((id, index) => {
      const item = itemMap[id];
      item.order = index;
      return item;
    });

    await list.save();
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/lists/:id/items/:itemId/subitems — Add a subitem
router.post('/:itemId/subitems', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.subItems.push({ text: req.body.text, order: item.subItems.length });
    await list.save();
    res.status(201).json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/lists/:id/items/:itemId/subitems/:subItemId — Update a subitem
router.put('/:itemId/subitems/:subItemId', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const subItem = item.subItems.id(req.params.subItemId);
    if (!subItem) return res.status(404).json({ message: 'Subitem not found' });

    if (req.body.text !== undefined) subItem.text = req.body.text;
    if (req.body.completed !== undefined) subItem.completed = req.body.completed;

    await list.save();
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/lists/:id/items/:itemId/subitems/:subItemId — Delete a subitem
router.delete('/:itemId/subitems/:subItemId', auth, async (req, res) => {
  try {
    const list = await getListWithAccess(req.params.id, req.user.id, true);
    if (!list) return res.status(403).json({ message: 'Access denied or list not found' });

    const item = list.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.subItems = item.subItems.filter(sub => sub._id.toString() !== req.params.subItemId);
    await list.save();
    res.json(list);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;