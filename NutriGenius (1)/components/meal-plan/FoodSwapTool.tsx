
'use client';

import type { UserProfile, StructuredMealPlan } from '@/lib/types'; // Updated type
import type { SuggestFoodSwapsInput, SuggestFoodSwapsOutput } from '@/ai/flows/suggest-food-swaps';
import { suggestFoodSwaps } from '@/ai/flows/suggest-food-swaps';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Textarea } from '@/components/ui/textarea'; // Not used directly here for meal plan
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, Replace, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const foodSwapSchema = z.object({
  foodItem: z.string().min(1, 'Food item to swap is required.'),
});

type FoodSwapFormValues = z.infer<typeof foodSwapSchema>;

interface FoodSwapToolProps {
  userProfile: UserProfile | null;
  currentMealPlan: StructuredMealPlan | null; // Updated type
  foodToSwapInitially?: string;
  onSwapComplete?: () => void;
}

export function FoodSwapTool({ userProfile, currentMealPlan, foodToSwapInitially, onSwapComplete }: FoodSwapToolProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [swapSuggestion, setSwapSuggestion] = useState<SuggestFoodSwapsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FoodSwapFormValues>({
    resolver: zodResolver(foodSwapSchema),
    defaultValues: {
      foodItem: foodToSwapInitially || '',
    },
  });

  useEffect(() => {
    if (foodToSwapInitially) {
      form.setValue('foodItem', foodToSwapInitially);
      setIsOpen(true); 
      setSwapSuggestion(null);
    }
  }, [foodToSwapInitially, form]);

  const handleSuggestSwap = async (data: FoodSwapFormValues) => {
    if (!currentMealPlan) {
      toast({ title: 'Error', description: 'No current meal plan to reference for swaps.', variant: 'destructive' });
      return;
    }
    if (!userProfile) {
      toast({ title: 'Error', description: 'User profile not available for context.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setSwapSuggestion(null);
    try {
      // Convert structured meal plan to string (JSON) for the AI flow
      const mealPlanString = JSON.stringify(currentMealPlan);

      const input: SuggestFoodSwapsInput = {
        mealPlan: mealPlanString,
        foodItem: data.foodItem,
        dietaryRestrictions: userProfile.dietaryRestrictions,
        healthGoals: userProfile.healthGoals,
      };
      const result = await suggestFoodSwaps(input);
      setSwapSuggestion(result);
    } catch (error) {
      console.error('Error suggesting food swap:', error);
      toast({
        title: 'AI Error',
        description: 'Could not suggest a food swap at this time. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({ foodItem: '' });
      setSwapSuggestion(null);
      onSwapComplete?.();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {!foodToSwapInitially && (
          <Button variant="outline">
            <Replace className="mr-2 h-4 w-4" /> Smart Food Swap
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Replace className="h-6 w-6 text-primary" />
            Smart Food Swap
          </DialogTitle>
          <DialogDescription>
            Enter a food item from your meal plan to get an AI-powered healthy alternative.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSuggestSwap)} className="space-y-4">
            <FormField
              control={form.control}
              name="foodItem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Item to Swap</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., White Rice, Potato Chips" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              {isLoading ? 'Thinking...' : 'Suggest Swap'}
            </Button>
          </form>
        </Form>

        {swapSuggestion && (
          <Card className="mt-6 bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-lg">Swap Suggestion:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-primary">Try this instead: {swapSuggestion.alternativeFood}</h4>
              </div>
              <div>
                <h4 className="font-semibold">Why it's a good swap:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{swapSuggestion.explanation}</p>
              </div>
            </CardContent>
          </Card>
        )}
        <DialogFooter className="sm:justify-start mt-4">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
