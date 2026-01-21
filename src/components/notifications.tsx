'use client';

import { X, Bell, DollarSign, Gavel, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface NotificationItem {
  id: string;
  type: 'bidding_started' | 'bidding_ended' | 'invoice_pending' | 'auction_ended';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationsProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  userType: 'agent' | 'contractor';
}

export function NotificationsPanel({ isOpen, onClose, notifications, userType }: NotificationsProps) {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    if (type === 'invoice_pending') {
      return <DollarSign className="h-5 w-5 text-blue-600" />;
    }
    return <Gavel className="h-5 w-5 text-purple-600" />;
  };

  const getColor = (type: string) => {
    if (type === 'invoice_pending') return 'bg-blue-50 border-l-blue-500';
    if (type === 'bidding_ended') return 'bg-orange-50 border-l-orange-500';
    return 'bg-purple-50 border-l-purple-500';
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />
      <div className="fixed top-0 right-0 z-50 w-full max-w-md h-screen bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Notifications</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-l-4 ${getColor(notif.type)} hover:bg-gray-50`}
                >
                  <div className="flex gap-3">
                    {getIcon(notif.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{notif.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
