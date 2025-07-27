import React, { useState, useEffect } from "react";
import { X, Users, Search, Plus, Check } from "lucide-react";
import { axiosInstance } from '../lib/axios';
import { toast } from "react-hot-toast";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    memberIds: [],
    settings: {
      isPrivate: false,
      onlyAdminsCanMessage: false,
      onlyAdminsCanAddMembers: false,
    },
  });

  const [friends, setFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const response = await axiosInstance.get('/users/friends');
      setFriends(response.data.friends || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingChange = (setting) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: !prev.settings[setting]
      }
    }));
  };

  const handleMemberToggle = (friendId) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(friendId)
        ? prev.memberIds.filter(id => id !== friendId)
        : [...prev.memberIds, friendId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    if (formData.memberIds.length === 0) {
      toast.error('Please select at least one member');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post('/groups', formData);
      onGroupCreated(response.data.group);
      toast.success("Group created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Group
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[calc(90vh-120px)] overflow-y-auto"
        >
          {/* Group Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Group Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter group name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Group Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter group description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Group Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Group Settings
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.isPrivate}
                  onChange={() => handleSettingChange("isPrivate")}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Private Group</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.onlyAdminsCanMessage}
                  onChange={() => handleSettingChange("onlyAdminsCanMessage")}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Only admins can send messages
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.settings.onlyAdminsCanAddMembers}
                  onChange={() =>
                    handleSettingChange("onlyAdminsCanAddMembers")
                  }
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  Only admins can add members
                </span>
              </label>
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Add Members ({formData.memberIds.length} selected)
            </label>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Friends List */}
            <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {loadingFriends ? (
                <div className="p-4 text-center text-gray-500">
                  Loading friends...
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? "No friends found" : "No friends available"}
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        {friend.profilePic ? (
                          <img
                            src={friend.profilePic}
                            alt={friend.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {friend.fullName.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {friend.fullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{friend.username}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMemberToggle(friend._id)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        formData.memberIds.includes(friend._id)
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                      }`}
                    >
                      {formData.memberIds.includes(friend._id) ? (
                        <Check size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.name.trim() ||
              formData.memberIds.length === 0
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Users size={16} />
                <span>Create Group</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
