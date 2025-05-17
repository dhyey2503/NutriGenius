
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MealPlanDisplay } from '@/components/meal-plan/MealPlanDisplay';
import { FoodSwapTool } from '@/components/meal-plan/FoodSwapTool';
import { useUserProfile } from '@/contexts/UserProfileContext';
import type { StructuredMealPlan } from '@/lib/types'; // Updated type
import { Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const MEAL_PLAN_LOCAL_STORAGE_KEY = 'nutrigenius_current_meal_plan_structured'; // Updated key

export default function MealPlanViewPage() {
  const { userProfile } = useUserProfile();
  const [currentMealPlan, setCurrentMealPlan] = useState<StructuredMealPlan | null>(null); // Updated type
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [selectedFoodForSwap, setSelectedFoodForSwap] = useState<string | undefined>(undefined);
  const [errorLoadingPlan, setErrorLoadingPlan] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const storedPlan = localStorage.getItem(MEAL_PLAN_LOCAL_STORAGE_KEY);
        if (storedPlan) {
          setCurrentMealPlan(JSON.parse(storedPlan) as StructuredMealPlan); // Parse JSON to structured type
        } else {
          setErrorLoadingPlan('No meal plan found. Please generate a new one.');
        }
      }
    } catch (error) {
      console.error('Failed to load meal plan from local storage:', error);
      setErrorLoadingPlan('Could not load your meal plan. Please try generating a new one.');
    } finally {
      setIsLoadingPlan(false);
    }
  }, []);

  const handleSelectFoodForSwap = (foodItem: string) => {
    setSelectedFoodForSwap(foodItem);
  };
  
  const handleFoodSwapToolClose = () => {
    setSelectedFoodForSwap(undefined);
  };

  if (isLoadingPlan) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your meal plan...</p>
      </div>
    );
  }

  if (errorLoadingPlan) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Meal Plan</AlertTitle>
          <AlertDescription>{errorLoadingPlan}</AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/meal-plan')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Generate New Plan
        </Button>
      </div>
    );
  }

  if (!currentMealPlan) {
     return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">No meal plan available.</p>
        <Button onClick={() => router.push('/meal-plan')} className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Generate New Plan
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button onClick={() => router.push('/meal-plan')} variant="outline" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Generate Another Plan
      </Button>
      {/* Pass the structured meal plan to MealPlanDisplay */}
      <MealPlanDisplay structuredMealPlan={currentMealPlan} onSelectFoodForSwap={handleSelectFoodForSwap} />
      <FoodSwapTool 
        userProfile={userProfile} 
        currentMealPlan={currentMealPlan} // Pass structured plan
        foodToSwapInitially={selectedFoodForSwap}
        onSwapComplete={handleFoodSwapToolClose}
      />
    </div>
  );
}
