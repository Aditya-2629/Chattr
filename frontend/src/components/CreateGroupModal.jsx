import React, { useState, useEffect } from "react";
import { X, Users, Search, Plus, Check } from "lucide-react";
import { axiosInstance } from '../lib/axios';
import { toast } from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";

const CreateGroupModal = ({ onClose, onGroupCreated }) => {
  const { theme } = useThemeStore();
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
      console.log('Friends loaded:', response.data?.length || 0);
      setFriends(response.data || []);
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
      console.log('Creating group with data:', formData);
      const response = await axiosInstance.post('/groups', formData);
      console.log('Create group response:', response.data);
      onGroupCreated(response.data.group);
      toast.success("Group created successfully!");
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" data-theme={theme}>
      <div className="bg-base-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-gradient-to-r from-base-200/50 to-base-300/30">
          <h2 className="text-xl font-semibold text-base-content">
            Create New Group
          </h2>
          <button
            onClick={onClose}
            className="text-base-content/60 hover:text-base-content transition-all btn btn-ghost btn-circle btn-sm"
          >
            <X size={20} />
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
              className="block text-sm font-medium text-base-content mb-2"
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
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Group Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-base-content mb-2"
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
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Group Settings */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-3">
              Group Settings
            </label>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.settings.isPrivate}
                    onChange={() => handleSettingChange("isPrivate")}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">Private Group</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.settings.onlyAdminsCanMessage}
                    onChange={() => handleSettingChange("onlyAdminsCanMessage")}
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">
                    Only admins can send messages
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    checked={formData.settings.onlyAdminsCanAddMembers}
                    onChange={() =>
                      handleSettingChange("onlyAdminsCanAddMembers")
                    }
                    className="checkbox checkbox-primary"
                  />
                  <span className="label-text">
                    Only admins can add members
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-base-content mb-3">
              Add Members ({formData.memberIds.length} selected)
            </label>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40"
                size={16}
              />
              <input
                type="text"
                placeholder="Search friends..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input input-bordered w-full pl-10"
              />
            </div>

            {/* Friends List */}
            <div className="border border-base-300 rounded-lg max-h-48 overflow-y-auto bg-base-50">
              {loadingFriends ? (
                <div className="p-4 text-center text-base-content/60">
                  <div className="loading loading-spinner loading-sm"></div>
                  <p>Loading friends...</p>
                </div>
              ) : filteredFriends.length === 0 ? (
                <div className="p-4 text-center text-base-content/60">
                  {searchTerm ? "No friends found" : "No friends available"}
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between p-3 hover:bg-base-200/50 border-b border-base-300/50 last:border-b-0 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="w-10 rounded-full">
                          {friend.profilePic ? (
                            <img
                              src={friend.profilePic}
                              alt={friend.fullName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="bg-primary/20 w-full h-full rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {friend.fullName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-base-content">
                          {friend.fullName}
                        </p>
                        <p className="text-xs text-base-content/60">
                          {friend.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMemberToggle(friend._id)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 ${
                        formData.memberIds.includes(friend._id)
                          ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-200 hover:bg-blue-700"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-700 active:bg-gray-400"
                      }`}
                      title={formData.memberIds.includes(friend._id) ? 'Remove from group' : 'Add to group'}
                      aria-label={`${formData.memberIds.includes(friend._id) ? 'Remove' : 'Add'} ${friend.fullName} ${formData.memberIds.includes(friend._id) ? 'from' : 'to'} group`}
                    >
                      {formData.memberIds.includes(friend._id) ? (
                        <Check size={16} className="animate-in fade-in duration-200" />
                      ) : (
                        <Plus size={16} className="animate-in fade-in duration-200" />
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-base-300 bg-base-200/30">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-outline transition-all duration-200 hover:scale-[0.98] active:scale-95"
            disabled={loading}
            aria-label="Cancel group creation"
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
            className="btn btn-primary transition-all duration-200 hover:scale-[0.98] active:scale-95 gap-2"
            aria-label={loading ? 'Creating group...' : 'Create group'}
            title={loading ? 'Creating group...' : `Create group with ${formData.memberIds.length} members`}
          >
            {loading ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Users size={16} />
                <span>Create Group ({formData.memberIds.length} members)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
