import { sendGroupMessageNotification } from './notification.controller.js';
import Group from '../models/Group.js';

// Handle Stream Chat webhooks
export const handleStreamWebhook = async (req, res) => {
  try {
    const { type, message, channel } = req.body;

    // Only handle new message events for group channels
    if (type === 'message.new' && channel.type === 'messaging' && channel.id.startsWith('group-')) {
      // Find the group by stream channel ID
      const group = await Group.findOne({ streamChannelId: channel.id });
      
      if (group) {
        // Send push notification to group members
        await sendGroupMessageNotification(group._id, message.user.id, message);
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Stream webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
