'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { getUserProfile, updateUserProfile } from '@/lib/auth';
import { 
  fetchContractorProfile, 
  fetchContractorCredibility, 
  fetchContractorProjects 
} from '@/lib/contractor-api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  AlertCircle, 
  CheckCircle2, 
  Edit, 
  Save, 
  X, 
  User, 
  Mail, 
  Building, 
  Phone, 
  Calendar, 
  Award,
  TrendingUp,
  FileCheck,
  MapPin
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ContractorProfile() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [credibility, setCredibility] = useState<any>(null);
  const [stats, setStats] = useState({ projectsCompleted: 0, activeProjects: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Editable fields
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || role !== 'contractor')) {
      router.push('/auth/contractor/login');
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

      const [profileData, vendorData, credibilityData, projects] = await Promise.all([
        getUserProfile(user.uid),
        fetchContractorProfile(user.uid),
        fetchContractorCredibility(user.uid),
        fetchContractorProjects(user.uid),
      ]);

      setProfile(profileData);
      setVendorProfile(vendorData);
      setCredibility(credibilityData);
      setDisplayName(profileData?.displayName || profileData?.name || '');
      setPhone(profileData?.phone || '');

      // Calculate stats
      const completed = projects.filter((p) => p.status === 'completed').length;
      const active = projects.filter((p) => p.status === 'active' || p.status === 'in-progress').length;
      setStats({ projectsCompleted: completed, activeProjects: active });
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

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-500">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Not Verified</Badge>;
    }
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
            <p className="text-muted-foreground">View and manage your contractor profile</p>
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
                    value="Contractor"
                    disabled
                    className="bg-muted flex-1"
                  />
                  {getVerificationBadge(vendorProfile?.verificationStatus)}
                </div>
              </div>
            </div>

            {/* Company/Organization */}
            {vendorProfile && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Name
                    <Badge variant="secondary" className="text-xs">System-controlled</Badge>
                  </Label>
                  <Input
                    value={vendorProfile.name || 'N/A'}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {vendorProfile.location && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      value={vendorProfile.location}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                {vendorProfile.industry && (
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input
                      value={vendorProfile.industry}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </>
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

        {/* Credibility Score */}
        {credibility && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Credibility Score
              </CardTitle>
              <CardDescription>Your performance and trust rating</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{credibility.score.toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">Out of 100</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Project Completion</span>
                    <span className="font-medium">{credibility.factors.projectCompletion}%</span>
                  </div>
                  <Progress value={credibility.factors.projectCompletion} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Timely Delivery</span>
                    <span className="font-medium">{credibility.factors.timelyDelivery}%</span>
                  </div>
                  <Progress value={credibility.factors.timelyDelivery} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Quality Rating</span>
                    <span className="font-medium">{credibility.factors.qualityRating}%</span>
                  </div>
                  <Progress value={credibility.factors.qualityRating} />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Compliance Score</span>
                    <span className="font-medium">{credibility.factors.complianceScore}%</span>
                  </div>
                  <Progress value={credibility.factors.complianceScore} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Activity Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Activity Overview
            </CardTitle>
            <CardDescription>Your project history and current engagements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Projects Completed</p>
                <p className="text-3xl font-bold">{stats.projectsCompleted}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-3xl font-bold">{stats.activeProjects}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Verification Status</p>
                <div className="pt-2">
                  {getVerificationBadge(vendorProfile?.verificationStatus)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specialties */}
        {vendorProfile?.specialties && vendorProfile.specialties.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Specialties</CardTitle>
              <CardDescription>Your areas of expertise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {vendorProfile.specialties.map((specialty: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
