import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Check, Plus } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { getUserFriends } from '../lib/api';
import { toast } from 'react-hot-toast';
import { useThemeStore } from '../store/useThemeStore';
import { useQuery } from '@tanstack/react-query';

const AddMembersModal = ({ group, onClose, onMembersAdded }) => {
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch friends
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  // Filter friends who are not already members
  const existingMemberIds = group.members.map(m => m.user._id);
  const availableFriends = friends.filter(friend => 
    !existingMemberIds.includes(friend._id) &&
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberToggle = (friendId) => {
    setSelectedMembers(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0) {
      toast.error('Please select at least one member to add');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/groups/${group._id}/members`, {
        memberIds: selectedMembers
      });
      
      onMembersAdded(response.data.group);
      toast.success(`✅ Added ${selectedMembers.length} member(s) successfully`);
      onClose();
    } catch (error) {
      toast.error('❌ Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-theme={theme}>
      <div className="bg-base-100 rounded-xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-gradient-to-r from-base-200/50 to-base-300/30">
          <div>
            <h2 className="text-xl font-semibold text-base-content">
              Add Members
            </h2>
            <p className="text-base-content/60 text-sm">
              Add friends to {group.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-sm"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-base-300">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={16} />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered w-full pl-10"
              disabled={loading}
            />
          </div>
          {selectedMembers.length > 0 && (
            <div className="mt-2 text-sm text-base-content/60">
              {selectedMembers.length} member(s) selected
            </div>
          )}
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loadingFriends ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="loading loading-spinner loading-sm"></div>
              <p className="text-base-content/60 mt-2">Loading friends...</p>
            </div>
          ) : availableFriends.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-base-content/30" />
              <h3 className="font-semibold text-base-content mb-2">
                {searchTerm ? 'No friends found' : 'All friends are already members'}
              </h3>
              <p className="text-base-content/60 text-sm">
                {searchTerm 
                  ? 'Try adjusting your search term'
                  : 'Invite more friends to your network to add them here'
                }
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {availableFriends.map((friend) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-3 hover:bg-base-200/50 rounded-lg transition-all cursor-pointer"
                  onClick={() => handleMemberToggle(friend._id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        {friend.profilePic ? (
                          <img
                            src={friend.profilePic}
                            alt={friend.fullName}
                            className="rounded-full"
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
                      <p className="font-medium text-base-content">
                        {friend.fullName}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {friend.email}
                      </p>
                    </div>
                  </div>

                  <button
                    className={`btn btn-circle btn-sm transition-all ${
                      selectedMembers.includes(friend._id)
                        ? 'btn-primary'
                        : 'btn-outline'
                    }`}
                    disabled={loading}
                  >
                    {selectedMembers.includes(friend._id) ? (
                      <Check size={16} />
                    ) : (
                      <Plus size={16} />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-base-300 bg-base-200/30">
          <button
            onClick={onClose}
            className="btn btn-outline"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleAddMembers}
            disabled={loading || selectedMembers.length === 0}
            className="btn btn-primary gap-2"
          >
            {loading ? (
              <>
                <div className="loading loading-spinner loading-sm"></div>
                <span>Adding...</span>
              </>
            ) : (
              <>
                <UserPlus size={16} />
                <span>Add {selectedMembers.length || ''} Member{selectedMembers.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddMembersModal;
