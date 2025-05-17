'use client';

import type { UserProfile } from '@/lib/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListChecks, Target, Activity, Smile, Save, UserCog } from 'lucide-react';

const userProfileSchema = z.object({
  dietaryRestrictions: z.string().min(1, 'Dietary restrictions are required.'),
  healthGoals: z.string().min(1, 'Health goals are required.'),
  medicalConditions: z.string().min(1, 'Medical conditions are required.'),
  preferences: z.string().min(1, 'Food preferences are required.'),
});

interface UserProfileFormProps {
  initialProfile: UserProfile | null;
  onSave: (data: UserProfile) => void;
  isSaving: boolean;
}

export function UserProfileForm({ initialProfile, onSave, isSaving }: UserProfileFormProps) {
  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: initialProfile || {
      dietaryRestrictions: '',
      healthGoals: '',
      medicalConditions: '',
      preferences: '',
    },
  });

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserCog className="h-7 w-7 text-primary" />
          Your Nutrition Profile
        </CardTitle>
        <CardDescription>
          Help us understand your needs to generate the best meal plans for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5 text-primary" />Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Vegetarian, Gluten-free, No nuts"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="healthGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" />Health Goals</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Weight loss, Muscle gain, Better digestion"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medicalConditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-primary" />Medical Conditions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Diabetes, Allergies (shellfish, soy)"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferences"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-lg"><Smile className="h-5 w-5 text-primary" />Food Preferences & Dislikes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Love Italian food, dislike spicy food, prefer quick meals"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
