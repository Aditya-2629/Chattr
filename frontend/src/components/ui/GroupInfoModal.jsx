import React, { useState, useEffect } from 'react';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';
import { 
  Users, 
  Settings, 
  Crown, 
  UserPlus, 
  UserMinus, 
  LogOut, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Camera,
  Shield,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const GroupInfoModal = ({ isOpen, onClose, groupData, onGroupUpdate, onGroupDelete, onLeaveGroup, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [newName, setNewName] = useState(groupData?.name || '');
  const [newDescription, setNewDescription] = useState(groupData?.description || '');
  const [members, setMembers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const videoClient = useStreamVideoClient();

  useEffect(() => {
    if (isOpen && groupData) {
      setNewName(groupData.name || '');
      setNewDescription(groupData.description || '');
      fetchGroupMembers();
    }
  }, [isOpen, groupData]);

  const fetchGroupMembers = async () => {
    try {
      setLoading(true);
      // Fetch group members from Stream Chat
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        const members = await call.queryMembers();
        setMembers(members.members || []);
      }
    } catch (error) {
      console.error('Error fetching group members:', error);
      toast.error('Failed to fetch group members');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupName = async () => {
    if (!newName.trim() || newName === groupData.name) {
      setEditingName(false);
      return;
    }

    try {
      setLoading(true);
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        await call.update({
          data: {
            ...groupData,
            name: newName.trim()
          }
        });
        onGroupUpdate?.({ ...groupData, name: newName.trim() });
        toast.success('Group name updated successfully');
      }
    } catch (error) {
      console.error('Error updating group name:', error);
      toast.error('Failed to update group name');
      setNewName(groupData.name);
    } finally {
      setLoading(false);
      setEditingName(false);
    }
  };

  const handleUpdateDescription = async () => {
    if (newDescription === (groupData.description || '')) {
      setEditingDescription(false);
      return;
    }

    try {
      setLoading(true);
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        await call.update({
          data: {
            ...groupData,
            description: newDescription.trim()
          }
        });
        onGroupUpdate?.({ ...groupData, description: newDescription.trim() });
        toast.success('Group description updated successfully');
      }
    } catch (error) {
      console.error('Error updating group description:', error);
      toast.error('Failed to update group description');
      setNewDescription(groupData.description || '');
    } finally {
      setLoading(false);
      setEditingDescription(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) return;

    try {
      setLoading(true);
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        await call.updateCallMembers({
          update_members: [{
            user_id: newMemberEmail.trim(),
            role: 'user'
          }]
        });
        await fetchGroupMembers();
        setNewMemberEmail('');
        setShowAddMember(false);
        toast.success('Member added successfully');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      setLoading(true);
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        await call.updateCallMembers({
          remove_members: [memberId]
        });
        await fetchGroupMembers();
        toast.success('Member removed successfully');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    try {
      setLoading(true);
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        await call.updateCallMembers({
          remove_members: [currentUser.id]
        });
        onLeaveGroup?.(groupData.id);
        toast.success('Left group successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error('Failed to leave group');
    } finally {
      setLoading(false);
      setShowLeaveConfirm(false);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      setLoading(true);
      const call = videoClient?.call('default', groupData.id);
      if (call) {
        await call.delete({ hard: true });
        onGroupDelete?.(groupData.id);
        toast.success('Group deleted successfully');
        onClose();
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      toast.error('Failed to delete group');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const copyGroupLink = () => {
    const groupLink = `${window.location.origin}/chat/group/${groupData.id}`;
    navigator.clipboard.writeText(groupLink).then(() => {
      toast.success('Group link copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy group link');
    });
  };

  const isGroupAdmin = () => {
    const userMember = members.find(m => m.user_id === currentUser.id);
    return userMember?.role === 'admin' || userMember?.role === 'owner';
  };

  if (!isOpen || !groupData) return null;

  const tabs = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 chat-modal">
      <div className="bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden chat-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-base-content">{groupData.name}</h2>
              <p className="text-sm text-base-content/60">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'text-primary border-b-2 border-primary bg-primary/5' 
                    : 'text-base-content/60 hover:text-base-content hover:bg-base-200'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] chat-scroll">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Group Name */}
              <div className="chat-card">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-base-content/80">Group Name</label>
                  {isGroupAdmin() && !editingName && (
                    <button 
                      onClick={() => setEditingName(true)}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="input input-bordered flex-1 enhanced-input"
                      autoFocus
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateGroupName()}
                    />
                    <button 
                      onClick={handleUpdateGroupName}
                      className="btn btn-primary btn-sm chat-btn-primary"
                      disabled={loading}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        setEditingName(false);
                        setNewName(groupData.name);
                      }}
                      className="btn btn-ghost btn-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-base-content font-medium">{groupData.name}</p>
                )}
              </div>

              {/* Group Description */}
              <div className="chat-card">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-base-content/80">Description</label>
                  {isGroupAdmin() && !editingDescription && (
                    <button 
                      onClick={() => setEditingDescription(true)}
                      className="btn btn-ghost btn-sm btn-circle"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {editingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="textarea textarea-bordered w-full enhanced-input"
                      placeholder="Add a group description..."
                      rows={3}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleUpdateDescription}
                        className="btn btn-primary btn-sm chat-btn-primary"
                        disabled={loading}
                      >
                        <Check className="w-4 h-4" />
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setEditingDescription(false);
                          setNewDescription(groupData.description || '');
                        }}
                        className="btn btn-ghost btn-sm"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-base-content/80">
                    {groupData.description || 'No description set'}
                  </p>
                )}
              </div>

              {/* Group Actions */}
              <div className="chat-card">
                <h3 className="text-sm font-medium text-base-content/80 mb-3">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={copyGroupLink}
                    className="btn btn-outline btn-sm chat-btn-ghost"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Link
                  </button>
                  <button 
                    onClick={() => window.open(`/chat/group/${groupData.id}`, '_blank')}
                    className="btn btn-outline btn-sm chat-btn-ghost"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open in New Tab
                  </button>
                </div>
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="chat-card text-center">
                  <div className="text-2xl font-bold text-primary">{members.length}</div>
                  <div className="text-sm text-base-content/60">Members</div>
                </div>
                <div className="chat-card text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {new Date(groupData.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-base-content/60">Created</div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Add Member */}
              {isGroupAdmin() && (
                <div className="chat-card">
                  {!showAddMember ? (
                    <button 
                      onClick={() => setShowAddMember(true)}
                      className="btn btn-primary btn-sm w-full chat-btn-primary"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Member
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="Enter member email"
                        className="input input-bordered w-full enhanced-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                      />
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleAddMember}
                          className="btn btn-primary btn-sm chat-btn-primary"
                          disabled={loading || !newMemberEmail.trim()}
                        >
                          Add
                        </button>
                        <button 
                          onClick={() => {
                            setShowAddMember(false);
                            setNewMemberEmail('');
                          }}
                          className="btn btn-ghost btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Members List */}
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="chat-loading"></div>
                  </div>
                ) : (
                  members.map((member) => (
                    <div key={member.user_id} className="chat-card">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-10 h-10 rounded-full chat-avatar">
                              {member.user?.image ? (
                                <img src={member.user.image} alt={member.user.name} />
                              ) : (
                                <div className="bg-primary/10 flex items-center justify-center">
                                  <span className="text-primary font-medium">
                                    {member.user?.name?.[0] || member.user_id[0].toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-base-content">
                              {member.user?.name || member.user_id}
                            </p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-base-content/60">
                                {member.user?.email || member.user_id}
                              </p>
                              {member.role === 'admin' && (
                                <div className="badge badge-primary badge-sm">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Admin
                                </div>
                              )}
                              {member.user_id === currentUser.id && (
                                <div className="badge badge-secondary badge-sm">You</div>
                              )}
                            </div>
                          </div>
                        </div>
                        {isGroupAdmin() && member.user_id !== currentUser.id && (
                          <div className="dropdown dropdown-end">
                            <button className="btn btn-ghost btn-sm btn-circle" tabIndex={0}>
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                              <li>
                                <button 
                                  onClick={() => handleRemoveMember(member.user_id)}
                                  className="text-error"
                                >
                                  <UserMinus className="w-4 h-4" />
                                  Remove Member
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Danger Zone */}
              <div className="chat-card border-error/20">
                <h3 className="text-sm font-medium text-error mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  {/* Leave Group */}
                  <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                    <div>
                      <p className="font-medium text-base-content">Leave Group</p>
                      <p className="text-sm text-base-content/60">
                        You will no longer be able to access this group
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowLeaveConfirm(true)}
                      className="btn btn-error btn-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave
                    </button>
                  </div>

                  {/* Delete Group (Admin Only) */}
                  {isGroupAdmin() && (
                    <div className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                      <div>
                        <p className="font-medium text-base-content">Delete Group</p>
                        <p className="text-sm text-base-content/60">
                          Permanently delete this group and all its data
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowDeleteConfirm(true)}
                        className="btn btn-error btn-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 chat-modal-content">
            <h3 className="text-lg font-bold text-base-content mb-4">Leave Group?</h3>
            <p className="text-base-content/80 mb-6">
              Are you sure you want to leave this group? You won't be able to access it unless someone adds you back.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLeaveGroup}
                className="btn btn-error flex-1"
                disabled={loading}
              >
                {loading ? <div className="chat-loading"></div> : <LogOut className="w-4 h-4" />}
                Leave Group
              </button>
              <button 
                onClick={() => setShowLeaveConfirm(false)}
                className="btn btn-ghost flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
          <div className="bg-base-100 rounded-2xl p-6 max-w-md w-full mx-4 chat-modal-content">
            <h3 className="text-lg font-bold text-error mb-4">Delete Group?</h3>
            <p className="text-base-content/80 mb-6">
              This action cannot be undone. This will permanently delete the group and all its messages.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDeleteGroup}
                className="btn btn-error flex-1"
                disabled={loading}
              >
                {loading ? <div className="chat-loading"></div> : <Trash2 className="w-4 h-4" />}
                Delete Group
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-ghost flex-1"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoModal;
