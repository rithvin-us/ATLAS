import { useState, useEffect } from 'react';
import { getFirebaseDb } from '@/lib/firebase-client';
import { NotificationItem } from '@/components/notifications';
import { collection, query, where, onSnapshot, Timestamp, limit, orderBy } from 'firebase/firestore';

export function useNotifications(userId: string, userType: 'agent' | 'contractor') {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const db = getFirebaseDb();
    if (!db) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const unsubscribers: (() => void)[] = [];

    try {
      if (userType === 'agent') {
        // Listen for auctions created by this agent
        try {
          const auctionsQuery = query(
            collection(db, 'auctions'),
            where('agentId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
          );

          const auctionUnsubscribe = onSnapshot(
            auctionsQuery,
            (snapshot) => {
              const newNotifications: NotificationItem[] = [];

              snapshot.docs.forEach((doc) => {
                const auction = doc.data();
                
                // Bidding started notification
                newNotifications.push({
                  id: `auction_${doc.id}_started`,
                  type: 'bidding_started',
                  title: 'Bidding Started',
                  message: `Auction "${auction.title || 'New Auction'}" is now accepting bids`,
                  timestamp: auction.createdAt?.toDate ? auction.createdAt.toDate() : new Date(),
                  read: false,
                  data: auction,
                });

                // Bidding ended notification if closed
                if (auction.status === 'closed') {
                  newNotifications.push({
                    id: `auction_${doc.id}_ended`,
                    type: 'bidding_ended',
                    title: 'Bidding Ended',
                    message: `Auction "${auction.title || 'Auction'}" has closed with ${(auction.bids || []).length} bids received`,
                    timestamp: new Date(),
                    read: false,
                    data: auction,
                  });
                }
              });

              setNotifications(newNotifications);
              setIsLoading(false);
            },
            (error) => {
              console.error('Error fetching auctions:', error);
              setError('Failed to load notifications');
              setIsLoading(false);
            }
          );

          unsubscribers.push(auctionUnsubscribe);
        } catch (err) {
          console.error('Auctions query error:', err);
          setIsLoading(false);
        }
      } else if (userType === 'contractor') {
        // Listen for invoices assigned to this contractor
        try {
          const invoicesQuery = query(
            collection(db, 'invoices'),
            where('contractorId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
          );

          const invoiceUnsubscribe = onSnapshot(
            invoicesQuery,
            (snapshot) => {
              const newNotifications: NotificationItem[] = [];

              snapshot.docs.forEach((doc) => {
                const invoice = doc.data();
                
                if (invoice.status === 'submitted' || invoice.status === 'approved') {
                  newNotifications.push({
                    id: `invoice_${doc.id}`,
                    type: 'invoice_pending',
                    title: 'Pending Invoice',
                    message: `Invoice #${invoice.invoiceNumber || doc.id.slice(0, 8)} (${invoice.status}) is awaiting action`,
                    timestamp: invoice.createdAt?.toDate ? invoice.createdAt.toDate() : new Date(),
                    read: false,
                    data: invoice,
                  });
                }
              });

              setNotifications(newNotifications);
              setIsLoading(false);
            },
            (error) => {
              console.error('Error fetching invoices:', error);
              setError('Failed to load notifications');
              setIsLoading(false);
            }
          );

          unsubscribers.push(invoiceUnsubscribe);
        } catch (err) {
          console.error('Invoices query error:', err);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error('Notifications setup error:', err);
      setError('Failed to setup notifications');
      setIsLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [userId, userType]);

  return { notifications, isLoading, error };
}
