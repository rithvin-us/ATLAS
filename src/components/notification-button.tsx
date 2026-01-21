'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationsPanel, NotificationItem } from '@/components/notifications';

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [userType, setUserType] = useState<'agent' | 'contractor'>('contractor');
  
  useEffect(() => {
    setMounted(true);
    
    // Detect user type
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isAgent = pathname.includes('/agent/');
    const detected = isAgent ? 'agent' : 'contractor';
    setUserType(detected);
    
    console.log('NotificationButton mounted, user type:', detected);

    // Create mock data
    const mockData: NotificationItem[] = [
      {
        id: '1',
        type: isAgent ? 'bidding_started' : 'invoice_pending',
        title: isAgent ? '🎯 Bidding Started' : '📄 Invoice #INV-001',
        message: isAgent 
          ? 'Website Redesign Project is now accepting bids'
          : 'Invoice #INV-001 for $5,000 is awaiting approval',
        timestamp: new Date(),
        read: false,
      },
      {
        id: '2',
        type: isAgent ? 'bidding_ended' : 'invoice_pending',
        title: isAgent ? '✅ Bidding Ended' : '📄 Invoice #INV-002',
        message: isAgent
          ? 'Mobile App Development auction closed with 5 bids'
          : 'Invoice #INV-002 for $3,500 awaiting approval',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
      },
      {
        id: '3',
        type: isAgent ? 'bidding_started' : 'invoice_pending',
        title: isAgent ? '🎯 Bidding Started' : '📄 Invoice #INV-003',
        message: isAgent
          ? 'Database Migration auction accepting bids from contractors'
          : 'Invoice #INV-003 for $2,200 submitted and pending',
        timestamp: new Date(Date.now() - 7200000),
        read: false,
      },
    ];
    
    setNotifications(mockData);
  }, []);

  if (!mounted) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full relative"
        onClick={() => {
          console.log('Bell clicked');
          setIsOpen(!isOpen);
        }}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute top-0 right-0 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationsPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        userType={userType}
      />
    </>
  );
}
