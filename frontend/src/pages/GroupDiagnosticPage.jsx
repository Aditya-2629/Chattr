import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import useAuthUser from '../hooks/useAuthUser';
import { toast } from 'react-hot-toast';

const GroupDiagnosticPage = () => {
  const { authUser } = useAuthUser();
  const [diagnostics, setDiagnostics] = useState({
    auth: null,
    friends: null,
    groups: null,
    streamEnv: null,
  });

  const [testResults, setTestResults] = useState([]);

  const addResult = (test, status, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      status, // 'success', 'error', 'warning'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const testAuth = () => {
    addResult('Authentication', authUser ? 'success' : 'error', 
      authUser ? `Logged in as ${authUser.fullName}` : 'Not authenticated', authUser);
  };

  const testStreamEnv = () => {
    const streamKey = import.meta.env.VITE_STREAM_API_KEY;
    addResult('Stream Environment', streamKey ? 'success' : 'error',
      streamKey ? `Stream API Key configured: ${streamKey.substring(0, 10)}...` : 'Stream API Key missing');
  };

  const testFriends = async () => {
    try {
      const response = await axiosInstance.get('/users/friends');
      addResult('Friends API', 'success', `Found ${response.data?.length || 0} friends`, response.data);
    } catch (error) {
      addResult('Friends API', 'error', `Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const testGroups = async () => {
    try {
      const response = await axiosInstance.get('/groups');
      addResult('Groups API', 'success', `Found ${response.data?.groups?.length || 0} groups`, response.data);
    } catch (error) {
      addResult('Groups API', 'error', `Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const testGroupCreate = async () => {
    try {
      // First get friends
      const friendsResponse = await axiosInstance.get('/users/friends');
      const friends = friendsResponse.data || [];
      
      if (friends.length === 0) {
        addResult('Group Creation', 'warning', 'Cannot test - no friends available');
        return;
      }

      const testGroupData = {
        name: `Test Group ${Date.now()}`,
        description: 'This is a test group created by diagnostic tool',
        memberIds: [friends[0]._id], // Add first friend
        settings: {
          isPrivate: false,
          onlyAdminsCanMessage: false,
          onlyAdminsCanAddMembers: false
        }
      };

      const response = await axiosInstance.post('/groups', testGroupData);
      addResult('Group Creation', 'success', 'Test group created successfully', response.data);
      
      // Clean up - delete the test group
      if (response.data?.group?._id) {
        try {
          await axiosInstance.delete(`/groups/${response.data.group._id}`);
          addResult('Group Cleanup', 'success', 'Test group deleted successfully');
        } catch (cleanupError) {
          addResult('Group Cleanup', 'warning', 'Could not delete test group');
        }
      }
    } catch (error) {
      addResult('Group Creation', 'error', `Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    testAuth();
    testStreamEnv();
    await testFriends();
    await testGroups();
    await testGroupCreate();
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Group Chat Diagnostics
          </h1>
          <p className="text-gray-600 mb-4">
            This page helps diagnose issues with group chat functionality.
          </p>
          <button
            onClick={runAllTests}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Run All Tests
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">No tests run yet. Click "Run All Tests" to start.</p>
          ) : (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.status === 'success' 
                      ? 'bg-green-50 border-green-400 text-green-800'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{result.test}</h3>
                    <span className="text-sm opacity-70">{result.timestamp}</span>
                  </div>
                  <p className="text-sm mb-2">{result.message}</p>
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer opacity-70">Show Data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Common Issues & Solutions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-800">Stream API Key Missing</h3>
              <p className="text-sm text-gray-600">
                Make sure you have <code>VITE_STREAM_API_KEY</code> in your frontend .env file
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">No Friends Available</h3>
              <p className="text-sm text-gray-600">
                Add some friends first to be able to create groups
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Backend Not Running</h3>
              <p className="text-sm text-gray-600">
                Ensure your backend server is running on port 5000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDiagnosticPage;
