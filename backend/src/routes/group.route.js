import express from 'express';
import {
  createGroup,
  getUserGroups,
  getGroupDetails,
  addGroupMembers,
  removeGroupMember,
  updateGroupSettings,
  leaveGroup,
  deleteGroup
} from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// All group routes require authentication
router.use(protectRoute);

// Create a new group
router.post('/', createGroup);

// Get user's groups
router.get('/', getUserGroups);

// Get group details
router.get('/:groupId', getGroupDetails);

// Add members to group
router.post('/:groupId/members', addGroupMembers);

// Remove member from group
router.delete('/:groupId/members', removeGroupMember);

// Update group settings
router.put('/:groupId', updateGroupSettings);

// Leave group
router.post('/:groupId/leave', leaveGroup);

// Delete group
router.delete('/:groupId', deleteGroup);

export default router;
