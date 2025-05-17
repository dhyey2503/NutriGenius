'use client';

import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile as UserProfileType } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { userProfile, setUserProfile, isLoading: isProfileLoading } = useUserProfile();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [componentReady, setComponentReady] = useState(false);

  // Ensure component only renders after profile is loaded to prevent hydration issues with form defaults
  useEffect(() => {
    if (!isProfileLoading) {
      setComponentReady(true);
    }
  }, [isProfileLoading]);

  const handleSaveProfile = (data: UserProfileType) => {
    setIsSaving(true);
    setUserProfile(data);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: 'Profile Updated',
        description: 'Your nutrition profile has been saved successfully.',
      });
      setIsSaving(false);
    }, 500);
  };
  
  if (!componentReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <UserProfileForm
        initialProfile={userProfile}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </div>
  );
}
