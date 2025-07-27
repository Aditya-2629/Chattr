import React, { useState } from "react";
import { useNavigate } from 'react-router';
import {
  Users,
  MessageSquare,
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  LogOut,
  Crown,
  Lock,
} from "lucide-react";
import { axiosInstance } from '../lib/axios';
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";

const GroupCard = ({ group, currentUser, onGroupUpdated, onGroupDeleted }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = group.admin._id === currentUser.id;
  const memberCount = group.members.length;
  const lastActivity = group.lastActivity
    ? new Date(group.lastActivity)
    : new Date();

  const handleChatClick = () => {
    navigate(`/groups/${group._id}/chat`);
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/groups/${group._id}/leave`);
      onGroupDeleted(group._id);
      toast.success('Left group successfully');
    } catch (error) {
      toast.error('Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      await axiosInstance.delete(`/groups/${group._id}`);
      onGroupDeleted(group._id);
      toast.success('Group deleted successfully');
    } catch (error) {
      toast.error('Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  const handleManageMembers = () => {
    navigate(`/groups/${group._id}/members`);
  };

  const handleEditGroup = () => {
    navigate(`/groups/${group._id}/settings`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Group Header */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
          {group.groupPic ? (
            <img
              src={group.groupPic}
              alt={group.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Users className="text-blue-600" size={32} />
            </div>
          )}
        </div>

        {/* Settings Dropdown */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-1 transition-all"
            disabled={loading}
          >
            <MoreVertical className="text-white" size={20} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={handleChatClick}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <MessageSquare size={16} />
                  <span>Open Chat</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={handleEditGroup}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Edit size={16} />
                      <span>Edit Group</span>
                    </button>
                    <button
                      onClick={handleManageMembers}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <UserPlus size={16} />
                      <span>Manage Members</span>
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleDeleteGroup}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <Trash2 size={16} />
                      <span>Delete Group</span>
                    </button>
                  </>
                )}

                {!isAdmin && (
                  <>
                    <hr className="my-1" />
                    <button
                      onClick={handleLeaveGroup}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-2 text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Leave Group</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Group Settings Indicators */}
        <div className="absolute bottom-2 left-2 flex space-x-1">
          {group.settings.isPrivate && (
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <Lock className="text-white" size={12} />
            </div>
          )}
          {isAdmin && (
            <div className="bg-white bg-opacity-20 rounded-full p-1">
              <Crown className="text-yellow-300" size={12} />
            </div>
          )}
        </div>
      </div>

      {/* Group Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
            {group.name}
          </h3>
        </div>

        {group.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Group Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{memberCount} members</span>
          </div>
          <div className="text-xs">
            {formatDistanceToNow(lastActivity, { addSuffix: true })}
          </div>
        </div>

        {/* Admin Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">
                {group.admin.fullName?.charAt(0) || "A"}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              Admin: {group.admin.fullName || "Unknown"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleChatClick}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            disabled={loading}
          >
            <MessageSquare size={16} />
            <span>Chat</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleManageMembers}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
              disabled={loading}
            >
              <Settings size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
