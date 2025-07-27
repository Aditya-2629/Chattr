import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router';

const GroupTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Users className="mx-auto text-blue-600 mb-4" size={64} />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Messaging Test</h1>
          <p className="text-gray-600">Testing the group functionality</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Available Features:</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Groups Page - View and manage groups</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Create Group Modal - Create new groups with members</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Group Chat - Real-time messaging with Stream Chat</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Push Notifications - Get notified of new group messages</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Group Management - Add/remove members, admin controls</span>
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button
              onClick={() => navigate('/groups')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Groups
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-medium mb-2">Setup Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure your backend server is running on port 5001</li>
            <li>• Add your Stream API keys to the environment variables</li>
            <li>• Configure Stream Chat webhooks for push notifications</li>
            <li>• Generate VAPID keys for web push notifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GroupTestPage;
