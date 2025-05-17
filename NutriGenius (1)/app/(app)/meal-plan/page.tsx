
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MealPlanGeneratorForm } from '@/components/meal-plan/MealPlanGeneratorForm';
import { useUserProfile } from '@/contexts/UserProfileContext';
import type { GenerateMealPlanInput, GenerateMealPlanOutput } from '@/ai/flows/generate-meal-plan';
import { generateMealPlan } from '@/ai/flows/generate-meal-plan';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const MEAL_PLAN_LOCAL_STORAGE_KEY = 'nutrigenius_current_meal_plan_structured';

export default function MealPlanPage() {
  const { userProfile, isLoading: isProfileLoading } = useUserProfile();
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [pageReady, setPageReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isProfileLoading) {
      setPageReady(true);
    }
  }, [isProfileLoading]);

  const handleGenerateMealPlan = async (data: GenerateMealPlanInput) => {
    setIsGenerating(true);
    try {
      const result: GenerateMealPlanOutput = await generateMealPlan(data);
      if (typeof window !== 'undefined') {
        // Store the structured meal plan as a JSON string
        localStorage.setItem(MEAL_PLAN_LOCAL_STORAGE_KEY, JSON.stringify(result.days));
      }
      toast({
        title: 'Meal Plan Generated!',
        description: 'Your personalized meal plan with nutritional info is ready to view.',
      });
      router.push('/meal-plan/view');
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: 'AI Error',
        description: 'Could not generate a meal plan at this time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!pageReady) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-1 space-y-6">
          {!userProfile && !isProfileLoading && (
            <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-900 dark:border-blue-700">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-700 dark:text-blue-300">Welcome to NutriGenius!</AlertTitle>
              <AlertDescription className="text-blue-600 dark:text-blue-400">
                It looks like you don't have a profile yet. For the best experience,
                <Link href="/profile" passHref>
                  <Button variant="link" className="p-0 h-auto ml-1 text-blue-700 dark:text-blue-300 hover:underline">create your profile</Button>
                </Link>
                . You can still generate a plan now by filling the details below.
              </AlertDescription>
            </Alert>
          )}
          <MealPlanGeneratorForm
            userProfile={userProfile}
            onSubmit={handleGenerateMealPlan}
            isGenerating={isGenerating}
          />
        </div>

        <div className="md:col-span-2">
          {isGenerating && (
            <div className="flex flex-col items-center justify-center h-64 bg-card p-6 rounded-lg shadow-md border">
              <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              <p className="text-lg font-semibold text-foreground">Generating your personalized plan with nutritional info...</p>
              <p className="text-sm text-muted-foreground">This might take a few moments.</p>
            </div>
          )}
          {!isGenerating && (
            <div className="flex flex-col items-center justify-center h-64 bg-card p-6 rounded-lg shadow-md border">
                <Info className="h-16 w-16 text-primary mb-4" />
                <p className="text-lg font-semibold text-foreground">Ready to generate your plan?</p>
                <p className="text-sm text-muted-foreground text-center">Fill out the form to create a personalized meal plan with nutritional details. Your plan will appear on the next page once generated.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
