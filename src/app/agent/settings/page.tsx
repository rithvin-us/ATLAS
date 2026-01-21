'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  Bell, 
  Monitor, 
  Globe,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AgentSettings() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [rfqNotifications, setRfqNotifications] = useState(true);
  const [bidNotifications, setBidNotifications] = useState(true);
  const [invoiceNotifications, setInvoiceNotifications] = useState(true);

  // Display preferences
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'agent')) {
      router.push('/auth/agent/login');
    }
  }, [user, role, authLoading, router]);

  const handlePasswordChange = async () => {
    if (!user) return;

    setError('');
    setSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email!,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else {
        setError(err.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (setting: string, value: boolean) => {
    setPendingAction(() => () => {
      switch (setting) {
        case 'email':
          setEmailNotifications(value);
          break;
        case 'rfq':
          setRfqNotifications(value);
          break;
        case 'bid':
          setBidNotifications(value);
          break;
        case 'invoice':
          setInvoiceNotifications(value);
          break;
      }
      setSuccess('Notification preferences updated');
      setTimeout(() => setSuccess(''), 3000);
    });
    setShowConfirmDialog(true);
  };

  const confirmAction = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
    setShowConfirmDialog(false);
  };

  if (authLoading) {
    return (
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences and security</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your password and authentication settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                />
              </div>

              <Button 
                onClick={handlePasswordChange} 
                disabled={loading}
                className="w-full sm:w-auto"
              >
                <Lock className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage how you receive updates and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>RFQ Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts for new RFQ responses and updates
                </p>
              </div>
              <Switch
                checked={rfqNotifications}
                onCheckedChange={(checked) => handleNotificationChange('rfq', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bid Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts for auction bids and results
                </p>
              </div>
              <Switch
                checked={bidNotifications}
                onCheckedChange={(checked) => handleNotificationChange('bid', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Invoice Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Alerts for invoice submissions and approvals
                </p>
              </div>
              <Switch
                checked={invoiceNotifications}
                onCheckedChange={(checked) => handleNotificationChange('invoice', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Display
            </CardTitle>
            <CardDescription>Customize your visual experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use dark theme for the interface
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </Label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update this setting?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
