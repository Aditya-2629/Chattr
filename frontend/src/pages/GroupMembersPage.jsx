import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, UserPlus, UserMinus, Crown, Search, Users } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { getUserFriends } from '../lib/api';
import useAuthUser from '../hooks/useAuthUser';
import { toast } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const GroupMembersPage = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch friends data
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: getUserFriends,
  });

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/groups/${groupId}`);
      setGroup(response.data.group);
    } catch (error) {
      toast.error('Failed to fetch group details');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMembers = async () => {
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend to add');
      return;
    }

    setActionLoading(true);
    try {
      const response = await axiosInstance.post(`/groups/${groupId}/members`, {
        memberIds: selectedFriends
      });
      
      setGroup(response.data.group);
      setSelectedFriends([]);
      setShowAddMembers(false);
      toast.success(`Added ${selectedFriends.length} member(s) successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add members');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setActionLoading(true);
    try {
      const response = await axiosInstance.delete(`/groups/${groupId}/members`, {
        data: { memberId }
      });
      
      setGroup(response.data.group);
      toast.success('Member removed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Group not found</p>
        <button
          onClick={() => navigate('/groups')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isAdmin = group.admin._id === authUser.id;
  
  // Filter friends who are not already members
  const availableFriends = friends.filter(friend => 
    !group.members.some(member => member.user._id === friend._id) &&
    friend.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = group.members.filter(member =>
    member.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/groups')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              
              <div className="flex items-center space-x-3">
                {group.groupPic ? (
                  <img
                    src={group.groupPic}
                    alt={group.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                  <p className="text-gray-600">{group.members.length} members</p>
                </div>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddMembers(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                disabled={actionLoading}
              >
                <UserPlus size={20} />
                <span>Add Members</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Group Members</h2>
          
          {filteredMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600">No members found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      {member.user.profilePic ? (
                        <img
                          src={member.user.profilePic}
                          alt={member.user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-700">
                          {member.user.fullName?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {member.user.fullName}
                        {member.user._id === authUser.id && ' (You)'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          member.role === 'admin' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                        {member.role === 'admin' && <Crown size={14} className="text-yellow-500" />}
                      </div>
                    </div>
                  </div>

                  {isAdmin && member.user._id !== authUser.id && member.role !== 'admin' && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={actionLoading}
                    >
                      <UserMinus size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Members Modal */}
        {showAddMembers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Friends to Group</h3>
                <button
                  onClick={() => {
                    setShowAddMembers(false);
                    setSelectedFriends([]);
                    setSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {friendsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              ) : availableFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">
                    {friends.length === 0 ? 'No friends found' : 'All friends are already in this group'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Search friends..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto mb-4">
                    <div className="space-y-2">
                      {availableFriends.map((friend) => (
                        <label
                          key={friend._id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFriends.includes(friend._id)}
                            onChange={() => toggleFriendSelection(friend._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            {friend.profilePic ? (
                              <img
                                src={friend.profilePic}
                                alt={friend.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-gray-700">
                                {friend.fullName?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {friend.fullName}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowAddMembers(false);
                        setSelectedFriends([]);
                        setSearchTerm('');
                      }}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
                      disabled={actionLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddMembers}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      disabled={selectedFriends.length === 0 || actionLoading}
                    >
                      {actionLoading ? 'Adding...' : `Add ${selectedFriends.length} Member(s)`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupMembersPage;
