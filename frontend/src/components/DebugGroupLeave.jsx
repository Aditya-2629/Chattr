import React, { useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';

const DebugGroupLeave = ({ group, onLeaveSuccess }) => {
  const { authUser } = useAuthUser();
  const [loading, setLoading] = useState(false);
  
  const testLeaveGroup = async () => {
    console.log('=== LEAVE GROUP DEBUG ===');
    console.log('Group ID:', group?._id);
    console.log('Auth User:', authUser);
    console.log('Is Admin:', group?.admin?._id === authUser?._id);
    console.log('User ID:', authUser?._id);
    console.log('Admin ID:', group?.admin?._id);
    
    if (!group) {
      toast.error('No group data available');
      return;
    }
    
    if (!authUser) {
      toast.error('Not authenticated');
      return;
    }
    
    if (group.admin._id === authUser._id) {
      toast.error('Admin cannot leave group (this is correct behavior)');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Making API call to:', `/groups/${group._id}/leave`);
      const response = await axiosInstance.post(`/groups/${group._id}/leave`);
      console.log('API Response:', response.data);
      
      toast.success('Successfully left group!');
      if (onLeaveSuccess) onLeaveSuccess();
      
    } catch (error) {
      console.error('Leave group error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      toast.error(error.response?.data?.message || 'Failed to leave group');
    } finally {
      setLoading(false);
    }
  };
  
  if (!group || !authUser) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-yellow-800">Missing group or auth data</p>
      </div>
    );
  }
  
  const isAdmin = group.admin._id === authUser._id;
  
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded">
      <h3 className="font-bold mb-2">Debug Leave Group</h3>
      
      <div className="text-sm mb-4 space-y-1">
        <p><strong>Group:</strong> {group.name}</p>
        <p><strong>Group ID:</strong> {group._id}</p>
        <p><strong>User:</strong> {authUser.fullName}</p>
        <p><strong>User ID:</strong> {authUser._id}</p>
        <p><strong>Admin ID:</strong> {group.admin._id}</p>
        <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
        <p><strong>Can Leave:</strong> {isAdmin ? 'No (Admin)' : 'Yes'}</p>
      </div>
      
      <button
        onClick={testLeaveGroup}
        disabled={loading || isAdmin}
        className={`px-4 py-2 rounded transition-colors ${
          isAdmin 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-blue-300 text-blue-700'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {loading ? 'Leaving...' : isAdmin ? 'Cannot Leave (Admin)' : 'Test Leave Group'}
      </button>
    </div>
  );
};

export default DebugGroupLeave;
