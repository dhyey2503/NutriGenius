
'use client';

import type { UserProfile } from '@/lib/types';
import type { GenerateMealPlanInput } from '@/ai/flows/generate-meal-plan';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, UtensilsCrossed } from 'lucide-react';
import { useEffect } from 'react';

const mealPlanGeneratorSchema = z.object({
  dietaryRestrictions: z.string().min(1, 'Dietary restrictions are required.'),
  healthGoals: z.string().min(1, 'Health goals are required.'),
  preferences: z.string().min(1, 'Food preferences are required.'),
  mealCount: z.coerce.number().min(1, 'At least one meal per day.').max(4, 'Maximum 4 meals per day.'),
});

type MealPlanFormValues = z.infer<typeof mealPlanGeneratorSchema>;

interface MealPlanGeneratorFormProps {
  userProfile: UserProfile | null;
  onSubmit: (data: GenerateMealPlanInput) => void;
  isGenerating: boolean;
}

export function MealPlanGeneratorForm({ userProfile, onSubmit, isGenerating }: MealPlanGeneratorFormProps) {
  const form = useForm<MealPlanFormValues>({
    resolver: zodResolver(mealPlanGeneratorSchema),
    defaultValues: {
      dietaryRestrictions: userProfile?.dietaryRestrictions || '',
      healthGoals: userProfile?.healthGoals || '',
      preferences: userProfile?.preferences || '',
      mealCount: 3,
    },
  });

  useEffect(() => {
    if (userProfile) {
      form.reset({
        dietaryRestrictions: userProfile.dietaryRestrictions,
        healthGoals: userProfile.healthGoals,
        preferences: userProfile.preferences,
        mealCount: form.getValues('mealCount') || 3,
      });
    }
  }, [userProfile, form]);


  const handleSubmit = (data: MealPlanFormValues) => {
    onSubmit(data);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <UtensilsCrossed className="h-7 w-7 text-primary" />
          Generate Your Meal Plan
        </CardTitle>
        <CardDescription>
          Fill in your details below, or use your saved profile, to get a personalized meal plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Vegetarian, Gluten-free" {...field} />
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
                  <FormLabel>Health Goals</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Weight loss, Muscle gain" {...field} />
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
                  <FormLabel>Food Preferences & Dislikes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Love Italian, dislike spicy food" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mealCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Meals per Day (1-4)</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="4" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isGenerating}>
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating Plan...' : 'Generate My Meal Plan'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
