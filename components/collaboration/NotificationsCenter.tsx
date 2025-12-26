import React, { useState, useEffect } from 'react';
import { notificationsService, type Notification } from '../../services/notificationsService';
import { format } from 'date-fns';

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();

    notificationsService.subscribeToNotifications((payload) => {
      loadNotifications();
      loadUnreadCount();
    });
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await notificationsService.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    const count = await notificationsService.getUnreadCount();
    setUnreadCount(count);
  };

  const handleMarkAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    await loadNotifications();
    await loadUnreadCount();
  };

  const handleMarkAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    await loadNotifications();
    await loadUnreadCount();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    await notificationsService.clearAll();
    await loadNotifications();
    await loadUnreadCount();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'invitation':
        return '👥';
      case 'mention':
        return '@';
      case 'activity':
        return '✏️';
      default:
        return '📬';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{getIcon(notification.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {format(new Date(notification.created_at), 'MMM d')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
