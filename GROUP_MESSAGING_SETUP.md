# Group Messaging & Push Notifications Setup

This guide will help you set up group messaging with push notifications for your Strimify app.

## Features Implemented

✅ **Group Management**
- Create groups with multiple members
- Add/remove members from groups
- Group admin controls
- Group settings (private groups, admin-only messaging)

✅ **Real-time Group Chat**
- Powered by Stream Chat
- Real-time messaging
- File sharing support
- Message reactions and replies

✅ **Push Notifications**
- Web push notifications for new group messages
- Background notifications when app is closed
- Customizable notification settings

## Backend Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=BJsyCG16ksm6mzcpYSSzuFmf_Djzwlx8cFq1_iAmjB5VpfITrIr7IxuisK7R6914Z_rUxgY8voyOn1P_IiMFS2M
VAPID_PRIVATE_KEY=bpcNeclfsuHUWiobUCJVL8nI2DOjCxj-lGMW1MSZR2s

# Stream Chat (make sure these are set)
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret
```

### 2. Generated Files

The following files have been created/updated:

**Models:**
- `src/models/Group.js` - Group schema (enhanced)
- `src/models/PushSubscription.js` - Push subscription storage

**Controllers:**
- `src/controllers/group.controller.js` - Group management (enhanced)
- `src/controllers/notification.controller.js` - Push notifications
- `src/controllers/webhook.controller.js` - Stream Chat webhooks

**Routes:**
- `src/routes/group.route.js` - Group API endpoints
- `src/routes/notification.route.js` - Push notification endpoints

**Utils:**
- `src/lib/pushNotifications.js` - Push notification utilities

**Server:**
- `src/server.js` - Updated with new routes

## Frontend Setup

### 1. Service Worker

A service worker has been created at `public/sw.js` to handle push notifications.

### 2. Push Notification Utils

- `src/utils/pushNotifications.js` - Frontend push notification manager
- `src/components/PushNotificationToggle.jsx` - UI component for notification settings

## API Endpoints

### Group Management

```
POST   /api/groups              - Create a new group
GET    /api/groups              - Get user's groups
GET    /api/groups/:groupId     - Get group details
POST   /api/groups/:groupId/members - Add members to group
DELETE /api/groups/:groupId/members - Remove member from group
PUT    /api/groups/:groupId     - Update group settings
POST   /api/groups/:groupId/leave - Leave group
DELETE /api/groups/:groupId     - Delete group
```

### Push Notifications

```
POST   /api/notifications/subscribe    - Subscribe to push notifications
POST   /api/notifications/unsubscribe  - Unsubscribe from push notifications
GET    /api/notifications/vapid-public-key - Get VAPID public key
```

### Webhooks

```
POST   /webhook/stream - Stream Chat webhook for message notifications
```

## Usage Examples

### 1. Creating a Group

```javascript
const response = await api.post('/api/groups', {
  name: 'My Group',
  description: 'A group for my friends',
  memberIds: ['user1', 'user2', 'user3'],
  settings: {
    isPrivate: false,
    onlyAdminsCanMessage: false
  }
});
```

### 2. Adding Push Notification Toggle

```jsx
import PushNotificationToggle from '../components/PushNotificationToggle';

function SettingsPage() {
  return (
    <div>
      <h1>Settings</h1>
      <PushNotificationToggle />
    </div>
  );
}
```

### 3. Initializing Push Notifications

```javascript
import { pushNotificationManager } from '../utils/pushNotifications';

// Initialize when app loads
useEffect(() => {
  pushNotificationManager.init();
}, []);
```

## Stream Chat Webhook Setup

To receive push notifications, you need to configure Stream Chat webhooks:

1. Go to your Stream Chat dashboard
2. Navigate to Chat > Webhooks
3. Add a new webhook with URL: `https://your-domain.com/webhook/stream`
4. Select the "message.new" event
5. Save the webhook

## Testing Push Notifications

1. Open your app in a browser
2. Enable push notifications using the toggle component
3. Send a group message from another device/browser
4. You should receive a push notification

## Troubleshooting

### Push Notifications Not Working

1. **Check browser support**: Push notifications work in Chrome, Firefox, Safari, and Edge
2. **Check HTTPS**: Push notifications require HTTPS in production
3. **Check permissions**: Ensure notification permissions are granted
4. **Check service worker**: Verify the service worker is registered correctly

### Group Messages Not Sending Notifications

1. **Check webhook**: Ensure Stream Chat webhook is configured correctly
2. **Check environment variables**: Verify VAPID keys are set
3. **Check logs**: Look for errors in server logs

## Security Notes

- VAPID keys should be kept secret
- The webhook endpoint should validate requests from Stream Chat
- Consider rate limiting for push notifications
- Store push subscriptions securely

## Next Steps

1. Add push notification customization (sound, vibration patterns)
2. Implement notification batching for high-volume groups
3. Add notification preferences per group
4. Implement offline message queuing
5. Add push notifications for other events (friend requests, mentions, etc.)
