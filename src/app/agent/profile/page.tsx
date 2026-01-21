'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile } from '@/lib/auth';
import { fetchProjects } from '@/lib/agent-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle2, Edit, Save, X, User, Mail, Building, Phone, Calendar, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AgentProfile() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ projectsCreated: 0, rfqsPosted: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'agent')) {
      router.push('/auth/agent/login');
    }
  }, [user, role, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');

      const profileData = await getUserProfile(user.uid);
      setProfile(profileData);
      setDisplayName(profileData?.displayName || profileData?.name || '');
      setPhone(profileData?.phone || '');

      // Load stats
      const projects = await fetchProjects(user.uid);
      setStats({
        projectsCreated: projects.length,
        rfqsPosted: projects.filter((p) => p.rfqId).length,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const result = await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        phone: phone.trim(),
      });

      if (result.success) {
        setSuccess('Profile updated successfully');
        setEditing(false);
        await loadProfileData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(profile?.displayName || profile?.name || '');
    setPhone(profile?.phone || '');
    setEditing(false);
    setError('');
  };

  if (authLoading || loading) {
    return (
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Unable to load profile data</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex-1 container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
          {!editing ? (
            <Button onClick={() => setEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleCancel} variant="outline" disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
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

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your account and identity details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!editing}
                  placeholder="Your name"
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                  <Badge variant="secondary" className="text-xs">Read-only</Badge>
                </Label>
                <Input
                  id="email"
                  value={profile.email || user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="h-4 w-4 inline mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!editing}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  Role
                  <Badge variant="secondary" className="text-xs">System-controlled</Badge>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="role"
                    value="Agent"
                    disabled
                    className="bg-muted flex-1"
                  />
                  <Badge variant="default">Verified</Badge>
                </div>
              </div>
            </div>

            {/* Organization */}
            {profile.organizationId && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Organization
                  <Badge variant="secondary" className="text-xs">System-controlled</Badge>
                </Label>
                <Input
                  value={profile.organizationName || profile.organizationId}
                  disabled
                  className="bg-muted"
                />
              </div>
            )}

            {/* Account Created */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </Label>
              <Input
                value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Agent Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Activity Overview
            </CardTitle>
            <CardDescription>Your platform activity and contributions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Projects Created</p>
                <p className="text-3xl font-bold">{stats.projectsCreated}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">RFQs Posted</p>
                <p className="text-3xl font-bold">{stats.rfqsPosted}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold">Verified</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
