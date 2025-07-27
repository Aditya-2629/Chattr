import Group from "../models/Group.js";
import User from "../models/User.js";
import { StreamChat } from "stream-chat";
import { v4 as uuidv4 } from "uuid";
import { sendGroupMessageNotification } from "./notification.controller.js";

const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, description, memberIds = [], settings = {} } = req.body;
    const adminId = req.user.id;

    // Generate unique stream channel ID
    const streamChannelId = `group-${uuidv4()}`;

    // Create Stream Chat channel
    const channel = streamClient.channel('messaging', streamChannelId, {
      name,
      created_by_id: adminId,
      members: [adminId, ...memberIds]
    });
    await channel.create();

    // Prepare members array
    const members = [
      { user: adminId, role: "admin" },
      ...memberIds.map(id => ({ user: id, role: "member" }))
    ];

    // Create group in database
    const group = new Group({
      name,
      description,
      admin: adminId,
      members,
      settings: {
        isPrivate: settings.isPrivate || false,
        onlyAdminsCanMessage: settings.onlyAdminsCanMessage || false,
        onlyAdminsCanAddMembers: settings.onlyAdminsCanAddMembers || false
      },
      streamChannelId
    });

    await group.save();
    await group.populate('admin members.user');

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      group
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create group" 
    });
  }
};

// Get user's groups
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;

    const groups = await Group.find({
      "members.user": userId
    })
    .populate('admin members.user')
    .sort({ lastActivity: -1 });

    res.json({
      success: true,
      groups
    });
  } catch (error) {
    console.error("Get user groups error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch groups" 
    });
  }
};

// Get group details
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId)
      .populate('admin members.user');

    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if user is a member
    const isMember = group.members.some(member => 
      member.user._id.toString() === userId
    );

    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not a member of this group" 
      });
    }

    res.json({
      success: true,
      group
    });
  } catch (error) {
    console.error("Get group details error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch group details" 
    });
  }
};

// Add members to group
export const addGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if user is admin or has permission to add members
    const userMember = group.members.find(member => 
      member.user.toString() === userId
    );

    if (!userMember) {
      return res.status(403).json({ 
        success: false, 
        message: "You are not a member of this group" 
      });
    }

    if (group.settings.onlyAdminsCanAddMembers && userMember.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Only admins can add members" 
      });
    }

    // Add members to group
    const newMembers = memberIds.filter(memberId => 
      !group.members.some(member => member.user.toString() === memberId)
    );

    for (const memberId of newMembers) {
      group.members.push({ user: memberId, role: "member" });
    }

    // Add members to Stream Chat channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.addMembers(newMembers);

    group.lastActivity = new Date();
    await group.save();
    await group.populate('admin members.user');

    res.json({
      success: true,
      message: "Members added successfully",
      group
    });
  } catch (error) {
    console.error("Add group members error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to add members" 
    });
  }
};

// Remove member from group
export const removeGroupMember = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberId } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only admin can remove members" 
      });
    }

    // Cannot remove admin
    if (memberId === group.admin.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot remove group admin" 
      });
    }

    // Remove member from group
    group.members = group.members.filter(member => 
      member.user.toString() !== memberId
    );

    // Remove member from Stream Chat channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.removeMembers([memberId]);

    group.lastActivity = new Date();
    await group.save();
    await group.populate('admin members.user');

    res.json({
      success: true,
      message: "Member removed successfully",
      group
    });
  } catch (error) {
    console.error("Remove group member error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to remove member" 
    });
  }
};

// Update group settings
export const updateGroupSettings = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, settings, groupPic } = req.body;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only admin can update group settings" 
      });
    }

    // Update group
    if (name) group.name = name;
    if (description) group.description = description;
    if (groupPic) group.groupPic = groupPic;
    if (settings) group.settings = { ...group.settings, ...settings };

    // Update Stream Chat channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.update({ name: group.name });

    group.lastActivity = new Date();
    await group.save();
    await group.populate('admin members.user');

    res.json({
      success: true,
      message: "Group updated successfully",
      group
    });
  } catch (error) {
    console.error("Update group settings error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update group" 
    });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Admin cannot leave, must transfer ownership first
    if (group.admin.toString() === userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Admin cannot leave group. Transfer ownership first." 
      });
    }

    // Remove user from group
    group.members = group.members.filter(member => 
      member.user.toString() !== userId
    );

    // Remove user from Stream Chat channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.removeMembers([userId]);

    group.lastActivity = new Date();
    await group.save();

    res.json({
      success: true,
      message: "Left group successfully"
    });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to leave group" 
    });
  }
};

// Delete group
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: "Group not found" 
      });
    }

    // Check if user is admin
    if (group.admin.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Only admin can delete group" 
      });
    }

    // Delete Stream Chat channel
    const channel = streamClient.channel('messaging', group.streamChannelId);
    await channel.delete();

    // Delete group from database
    await Group.findByIdAndDelete(groupId);

    res.json({
      success: true,
      message: "Group deleted successfully"
    });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete group" 
    });
  }
};
