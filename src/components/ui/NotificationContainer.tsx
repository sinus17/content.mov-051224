import { useNotificationStore } from '../../store/notifications';
import { Notification } from './Notification';

export function NotificationContainer() {
  const notifications = useNotificationStore(state => state.notifications);

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <Notification key={notification.id} {...notification} />
      ))}
    </div>
  );
}