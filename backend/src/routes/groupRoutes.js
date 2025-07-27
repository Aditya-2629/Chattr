import express from 'express';
import Group from '../models/Group';

const router = express.Router();

// Create a new group
router.post('/create', async (req, res) => {
  try {
    const group = new Group(req.body);
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add a member to a group
router.post('/:groupId/members/add', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) throw new Error('Group not found');

    group.members.push(req.body);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove a member from a group
router.post('/:groupId/members/remove', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) throw new Error('Group not found');

    group.members = group.members.filter(member => member.user.toString() !== userId);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update group information
router.put('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByIdAndUpdate(groupId, req.body, { new: true });
    if (!group) throw new Error('Group not found');

    res.json(group);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// List members of a group
router.get('/:groupId/members', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId).populate('members.user');
    if (!group) throw new Error('Group not found');

    res.json(group.members);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a group
router.delete('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) throw new Error('Group not found');

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
