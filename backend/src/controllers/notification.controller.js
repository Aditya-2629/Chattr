// Removed push notification functionality
// import PushSubscription from '../models/PushSubscription.js';

// Empty functions
export const subscribeToPush = async (req, res) => {
  res.status(501).send('Not Implemented');
};

export const unsubscribeFromPush = async (req, res) => {
  res.status(501).send('Not Implemented');
};

// Send group message notification (push notifications removed)
export const sendGroupMessageNotification = async (groupId, senderId, message) => {
  try {
    // Notification functionality removed - push notifications disabled
    console.log(`Group message notification would be sent for group ${groupId} from user ${senderId}`);
  } catch (error) {
    console.error('Error in group message notification:', error);
  }
};
