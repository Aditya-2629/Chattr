import React, { useState, useEffect } from 'react';
import { Plus, Users, MessageSquare, Settings, Search } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import useAuthUser from '../hooks/useAuthUser';
import CreateGroupModal from '../components/CreateGroupModal';
import GroupCard from '../components/GroupCard';
import PageLoader from '../components/PageLoader';
import BackButton from '../components/BackButton';
import DebugGroupLeave from '../components/DebugGroupLeave';
import { toast } from 'react-hot-toast';

const GroupsPage = () => {
  const { authUser } = useAuthUser();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/groups');
      console.log('Groups API response:', response.data);
      setGroups(response.data.groups || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups(prev => [newGroup, ...prev]);
    setShowCreateModal(false);
    toast.success('Group created successfully!');
  };

  const handleGroupUpdated = (updatedGroup) => {
    setGroups(prev => prev.map(group => 
      group._id === updatedGroup._id ? updatedGroup : group
    ));
  };

  const handleGroupDeleted = (deletedGroupId) => {
    setGroups(prev => prev.filter(group => group._id !== deletedGroupId));
    toast.success('Group deleted successfully');
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="flex items-center gap-4">
            <BackButton customRedirect="/" showAlways={true} />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Groups</h1>
              <p className="text-gray-600">Manage your group conversations</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
            title="Create new group"
            aria-label="Create new group"
          >
            <Plus size={20} />
            <span>Create Group</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Users className="text-blue-600 mr-3" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Groups</p>
                <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <MessageSquare className="text-green-600 mr-3" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.filter(g => g.lastActivity > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Settings className="text-purple-600 mr-3" size={24} />
              <div>
                <p className="text-sm font-medium text-gray-600">Admin Of</p>
                <p className="text-2xl font-bold text-gray-900">
                  {groups.filter(g => g.admin._id === authUser._id).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Debug Section - Remove this in production */}
        {groups.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Debug: Test Leave Group</h2>
            <div className="grid gap-4">
              {groups.filter(g => g.admin._id !== authUser._id).slice(0, 1).map(group => (
                <DebugGroupLeave 
                  key={group._id} 
                  group={group} 
                  onLeaveSuccess={() => fetchGroups()}
                />
              ))}
            </div>
          </div>
        )}

        {/* Groups Grid */}
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first group to start messaging with multiple people'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
                title="Create your first group"
                aria-label="Create your first group"
              >
                <Plus size={20} />
                <span>Create Your First Group</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
                currentUser={authUser}
                onGroupUpdated={handleGroupUpdated}
                onGroupDeleted={handleGroupDeleted}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onGroupCreated={handleGroupCreated}
        />
      )}
    </div>
  );
};

export default GroupsPage;
