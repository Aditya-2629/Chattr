import React, { useState, useEffect } from 'react';
import { 
  X, Users, Settings, Edit3, UserPlus, UserMinus, Crown, Lock, 
  Unlock, MessageSquare, Info, LogOut, Trash2, Copy, Check,
  Shield, AlertTriangle, Image as ImageIcon, Camera
} from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import { useThemeStore } from '../store/useThemeStore';
import useAuthUser from '../hooks/useAuthUser';
import AddMembersModal from './AddMembersModal';

const GroupInfoModal = ({ group, onClose, onGroupUpdated, onGroupDeleted }) => {
  const { theme } = useThemeStore();
  const { authUser } = useAuthUser();
  const [activeTab, setActiveTab] = useState('info'); // info, members, settings
  const [loading, setLoading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [groupName, setGroupName] = useState(group?.name || '');
  const [groupDescription, setGroupDescription] = useState(group?.description || '');
  const [groupSettings, setGroupSettings] = useState(group?.settings || {});
  const [members, setMembers] = useState(group?.members || []);
  const [inviteLink, setInviteLink] = useState('');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);

  const isAdmin = group?.admin?._id === authUser?._id;
  const isMember = members.some(member => member.user._id === authUser?._id);

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description || '');
      setGroupSettings(group.settings || {});
      setMembers(group.members || []);
      generateInviteLink();
    }
  }, [group]);

  const generateInviteLink = () => {
    const link = `${window.location.origin}/join-group/${group._id}`;
    setInviteLink(link);
  };

  const handleUpdateGroupName = async () => {
    if (!groupName.trim() || groupName === group.name) {
      setEditingName(false);
      setGroupName(group.name);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.patch(`/groups/${group._id}`, {
        name: groupName.trim()
      });
      onGroupUpdated(response.data.group);
      toast.success('✅ Group name updated successfully');
      setEditingName(false);
    } catch (error) {
      toast.error('❌ Failed to update group name');
      setGroupName(group.name);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroupDescription = async () => {
    if (groupDescription === (group.description || '')) {
      setEditingDescription(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.patch(`/groups/${group._id}`, {
        description: groupDescription.trim()
      });
      onGroupUpdated(response.data.group);
      toast.success('✅ Group description updated successfully');
      setEditingDescription(false);
    } catch (error) {
      toast.error('❌ Failed to update group description');
      setGroupDescription(group.description || '');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (setting, value) => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const newSettings = { ...groupSettings, [setting]: value };
      const response = await axiosInstance.patch(`/groups/${group._id}`, {
        settings: newSettings
      });
      setGroupSettings(newSettings);
      onGroupUpdated(response.data.group);
      toast.success('✅ Group settings updated');
    } catch (error) {
      toast.error('❌ Failed to update group settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin || memberId === authUser._id) return;

    const memberToRemove = members.find(m => m.user._id === memberId);
    if (!confirm(`Are you sure you want to remove ${memberToRemove?.user?.fullName} from this group?`)) return;

    setLoading(true);
    try {
      const response = await axiosInstance.delete(`/groups/${group._id}/members`, {
        data: { memberId }
      });
      setMembers(prev => prev.filter(m => m.user._id !== memberId));
      onGroupUpdated(response.data.group);
      toast.success('✅ Member removed successfully');
    } catch (error) {
      toast.error('❌ Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeAdmin = async (memberId) => {
    if (!isAdmin || memberId === authUser._id) return;

    const memberToPromote = members.find(m => m.user._id === memberId);
    if (!confirm(`Make ${memberToPromote?.user?.fullName} an admin of this group?`)) return;

    setLoading(true);
    try {
      const response = await axiosInstance.patch(`/groups/${group._id}/admin`, {
        newAdminId: memberId
      });
      onGroupUpdated(response.data.group);
      toast.success('✅ New admin assigned successfully');
      // Close modal since user is no longer admin
      setTimeout(onClose, 1000);
    } catch (error) {
      toast.error('❌ Failed to assign admin');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm("Are you sure you want to leave this group? You won't receive any messages from this group.")) return;

    setLoading(true);
    try {
      await axiosInstance.post(`/groups/${group._id}/leave`);
      onGroupDeleted(group._id);
      toast.success('✅ Left group successfully');
      onClose();
    } catch (error) {
      toast.error('❌ Failed to leave group');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!isAdmin) return;
    
    if (!confirm('⚠️ Are you sure you want to delete this group? This action cannot be undone and all messages will be lost forever.')) return;

    setLoading(true);
    try {
      await axiosInstance.delete(`/groups/${group._id}`);
      onGroupDeleted(group._id);
      toast.success('✅ Group deleted successfully');
      onClose();
    } catch (error) {
      toast.error('❌ Failed to delete group');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success('✅ Invite link copied to clipboard');
    } catch (error) {
      toast.error('❌ Failed to copy invite link');
    }
  };

  const tabs = [
    { id: 'info', label: 'Info', icon: Info },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-theme={theme}>
      <div className="bg-base-100 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-base-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-base-300 bg-gradient-to-r from-base-200/50 to-base-300/30">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 rounded-full ring-2 ring-primary/30">
                <img 
                  src={group?.groupPic || `https://ui-avatars.com/api/?name=${encodeURIComponent(group?.name || 'Group')}&background=random`}
                  alt={group?.name}
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
                {group?.name}
                {groupSettings.isPrivate && <Lock className="h-5 w-5 text-base-content/60" />}
              </h2>
              <p className="text-base-content/60">{members.length} members</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-base-300 bg-base-200/30">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 py-4 px-6 font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === id
                  ? 'bg-primary text-primary-content border-b-2 border-primary'
                  : 'text-base-content/70 hover:bg-base-300/50 hover:text-base-content'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Group Name
                </label>
                {editingName ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="input input-bordered flex-1"
                      disabled={loading}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateGroupName()}
                    />
                    <button
                      onClick={handleUpdateGroupName}
                      className="btn btn-primary btn-sm"
                      disabled={loading || !groupName.trim()}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setGroupName(group.name);
                      }}
                      className="btn btn-ghost btn-sm"
                      disabled={loading}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg">
                    <span className="font-medium">{group.name}</span>
                    {isAdmin && (
                      <button
                        onClick={() => setEditingName(true)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Group Description */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Description
                </label>
                {editingDescription ? (
                  <div className="space-y-2">
                    <textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="textarea textarea-bordered w-full"
                      rows={3}
                      disabled={loading}
                      placeholder="Enter group description..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateGroupDescription}
                        className="btn btn-primary btn-sm"
                        disabled={loading}
                      >
                        <Check size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingDescription(false);
                          setGroupDescription(group.description || '');
                        }}
                        className="btn btn-ghost btn-sm"
                        disabled={loading}
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between p-3 bg-base-200/50 rounded-lg">
                    <span className="text-base-content/80">
                      {group.description || 'No description'}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => setEditingDescription(true)}
                        className="btn btn-ghost btn-sm"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Group Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-200/50 rounded-lg">
                  <div className="stat-figure text-primary">
                    <Users size={32} />
                  </div>
                  <div className="stat-title">Members</div>
                  <div className="stat-value text-primary">{members.length}</div>
                </div>
                <div className="stat bg-base-200/50 rounded-lg">
                  <div className="stat-figure text-secondary">
                    <MessageSquare size={32} />
                  </div>
                  <div className="stat-title">Created</div>
                  <div className="stat-value text-secondary text-sm">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="stat bg-base-200/50 rounded-lg">
                  <div className="stat-figure text-accent">
                    <Crown size={32} />
                  </div>
                  <div className="stat-title">Admin</div>
                  <div className="stat-value text-accent text-sm">
                    {group.admin.fullName}
                  </div>
                </div>
              </div>

              {/* Invite Link */}
              <div>
                <label className="block text-sm font-medium text-base-content mb-2">
                  Invite Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={showInviteLink ? inviteLink : '••••••••••••••••••••••••••••••••'}
                    readOnly
                    className="input input-bordered flex-1"
                  />
                  <button
                    onClick={() => setShowInviteLink(!showInviteLink)}
                    className="btn btn-outline"
                  >
                    {showInviteLink ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                  <button
                    onClick={copyInviteLink}
                    className="btn btn-primary"
                    disabled={!showInviteLink}
                  >
                    <Copy size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Add Member Button */}
              {(isAdmin || !groupSettings.onlyAdminsCanAddMembers) && (
                <button 
                  className="btn btn-primary w-full gap-2"
                  onClick={() => setShowAddMembersModal(true)}
                  disabled={loading}
                >
                  <UserPlus size={16} />
                  Add Members
                </button>
              )}

              {/* Members List */}
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-4 bg-base-200/50 rounded-lg hover:bg-base-200/80 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-12 rounded-full">
                          <img 
                            src={member.user.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.fullName)}&background=random`}
                            alt={member.user.fullName}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-base-content flex items-center gap-2">
                          {member.user.fullName}
                          {member.user._id === authUser._id && <span className="text-primary text-sm">(You)</span>}
                          {member.role === 'admin' && <Crown className="h-4 w-4 text-warning" />}
                        </p>
                        <p className="text-base-content/60 text-sm capitalize">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    {isAdmin && member.user._id !== authUser._id && (
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
                          <Settings size={16} />
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52">
                          {member.role !== 'admin' && (
                            <li>
                              <button onClick={() => handleMakeAdmin(member.user._id)}>
                                <Crown size={16} />
                                Make Admin
                              </button>
                            </li>
                          )}
                          <li>
                            <button 
                              onClick={() => handleRemoveMember(member.user._id)}
                              className="text-error"
                            >
                              <UserMinus size={16} />
                              Remove Member
                            </button>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Group Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-base-content">Privacy Settings</h3>
                
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text flex items-center gap-2">
                      <Lock size={16} />
                      Private Group
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={groupSettings.isPrivate || false}
                      onChange={(e) => handleSettingChange('isPrivate', e.target.checked)}
                      disabled={!isAdmin || loading}
                    />
                  </label>
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">
                      Only invited members can join this group
                    </span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text flex items-center gap-2">
                      <MessageSquare size={16} />
                      Admin Only Messages
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={groupSettings.onlyAdminsCanMessage || false}
                      onChange={(e) => handleSettingChange('onlyAdminsCanMessage', e.target.checked)}
                      disabled={!isAdmin || loading}
                    />
                  </label>
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">
                      Only admins can send messages
                    </span>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text flex items-center gap-2">
                      <UserPlus size={16} />
                      Admin Only Invites
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={groupSettings.onlyAdminsCanAddMembers || false}
                      onChange={(e) => handleSettingChange('onlyAdminsCanAddMembers', e.target.checked)}
                      disabled={!isAdmin || loading}
                    />
                  </label>
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">
                      Only admins can add new members
                    </span>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Danger Zone */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-error flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Danger Zone
                </h3>

                <div className="alert alert-warning">
                  <AlertTriangle size={20} />
                  <span>These actions cannot be undone!</span>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleLeaveGroup}
                    className="btn btn-warning gap-2"
                    disabled={loading}
                  >
                    <LogOut size={16} />
                    Leave Group
                  </button>

                  {isAdmin && (
                    <button
                      onClick={handleDeleteGroup}
                      className="btn btn-error gap-2"
                      disabled={loading}
                    >
                      <Trash2 size={16} />
                      Delete Group
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {loading && (
          <div className="p-4 border-t border-base-300 bg-base-200/30">
            <div className="flex items-center justify-center gap-2">
              <div className="loading loading-spinner loading-sm"></div>
              <span className="text-base-content/60">Processing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Members Modal */}
      {showAddMembersModal && (
        <AddMembersModal
          group={group}
          onClose={() => setShowAddMembersModal(false)}
          onMembersAdded={(updatedGroup) => {
            setMembers(updatedGroup.members);
            onGroupUpdated(updatedGroup);
            setShowAddMembersModal(false);
          }}
        />
      )}
    </div>
  );
};

export default GroupInfoModal;
