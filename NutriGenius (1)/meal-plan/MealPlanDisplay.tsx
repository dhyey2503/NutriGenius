'use client';

import type { StructuredMealPlan, DailyMealPlanWithNutrition, MealWithNutrition, MealItemNutition } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Apple, Leaf, Drumstick, Fish, ChefHat, Utensils, NotebookText, CalendarDays, Coffee, Info, Weight, Flame, Beef, Vegan, Zap, CandlestickChart } from 'lucide-react';
import { Separator } from '../ui/separator';

interface MealPlanDisplayProps {
  structuredMealPlan: StructuredMealPlan | null;
  onSelectFoodForSwap: (foodItem: string) => void;
}

const getIconForMeal = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('breakfast')) return <Apple className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('lunch')) return <Drumstick className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('dinner')) return <Fish className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('snack')) return <Leaf className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('high-tea') || lowerTitle.includes('hightea')) return <Coffee className="h-5 w-5 text-primary" />;
  if (lowerTitle.includes('main meal')) return <Utensils className="h-5 w-5 text-primary"/>;
  return <Utensils className="h-5 w-5 text-primary" />;
};

const NutritionDetail: React.FC<{ label: string; value?: string; icon?: React.ReactNode }> = ({ label, value, icon }) => {
  if (!value || value.toLowerCase() === 'n/a') return null;
  return (
    <p className="text-xs text-muted-foreground flex items-center">
      {icon && <span className="mr-1">{icon}</span>}
      <span className="font-medium">{label}:</span> {value}
    </p>
  );
};

// Helper function to parse nutrient string values (e.g., "150 kcal", "10g") into numbers
function parseNutrientValue(value?: string): number {
  if (!value || value.toLowerCase() === 'n/a' || value.trim() === '') {
    return 0;
  }
  // Remove units (kcal, g, etc.) and parse the number
  const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
  return isNaN(numericValue) ? 0 : numericValue;
}

interface MealTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalSugar: number;
}

// Helper function to calculate total nutrition for a meal
function calculateMealTotals(items: MealItemNutition[]): MealTotals {
  const totals: MealTotals = {
    totalCalories: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalSugar: 0,
  };

  if (!items || items.length === 0) return totals;

  items.forEach(item => {
    totals.totalCalories += parseNutrientValue(item.calories);
    totals.totalProtein += parseNutrientValue(item.protein);
    totals.totalCarbs += parseNutrientValue(item.carbs);
    totals.totalFat += parseNutrientValue(item.fat);
    totals.totalSugar += parseNutrientValue(item.sugar);
  });

  return totals;
}

const MealTotalDisplay: React.FC<{ label: string; value: number; unit: string; icon?: React.ReactNode }> = ({ label, value, unit, icon }) => {
  // Removed condition: if (value <= 0 && !(label === "Total Calories" && value === 0)) return null;
  // Now, it will always display the nutrient line, even if the value is 0.
  return (
    <div className="text-xs text-muted-foreground flex items-center">
      {icon && <span className="mr-1.5">{icon}</span>}
      <span className="font-medium text-foreground">{label}:</span> 
      <span className="ml-1">{value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })} {unit}</span>
    </div>
  );
};


export function MealPlanDisplay({ structuredMealPlan, onSelectFoodForSwap }: MealPlanDisplayProps) {
  if (!structuredMealPlan || structuredMealPlan.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2"><NotebookText className="h-6 w-6 text-primary"/>Your Meal Plan</CardTitle>
          <CardDescription>No meal plan data available. Please generate a plan.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Meal plan details will appear here once generated.</p>
        </CardContent>
      </Card>
    );
  }

  const daysToDisplay = structuredMealPlan;

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-primary border-2">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl flex items-center gap-3 font-bold text-primary">
            <CalendarDays className="h-8 w-8" />
            Your 7-Day Personalized Meal Plan
          </CardTitle>
          <CardDescription className="text-base">
            Here is your AI-generated 7-day meal plan with estimated quantities and nutritional info. Expand each day to see the meals. Click on any food item to explore healthy swaps. Each meal includes a summary of its total nutritional content.
          </CardDescription>
        </CardHeader>
      </Card>

      {daysToDisplay.length > 0 ? (
        <Accordion type="multiple" defaultValue={daysToDisplay.length > 0 ? [daysToDisplay[0].dayTitle] : []} className="w-full">
          {daysToDisplay.map((day: DailyMealPlanWithNutrition, dayIndex: number) => (
            <AccordionItem value={day.dayTitle} key={dayIndex} className="border-b border-border">
              <AccordionTrigger className="py-4 px-2 hover:bg-muted/50 rounded-md transition-colors">
                <div className="flex items-center gap-3">
                  <ChefHat className="h-6 w-6 text-accent" />
                  <span className="text-xl font-semibold text-foreground">{day.dayTitle}</span>
                  <Badge variant="outline" className="text-sm">{day.meals.length} meal{day.meals.length === 1 ? '' : 's'}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-1 pb-4 px-2">
                {day.meals.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pt-2">
                    {day.meals.map((meal: MealWithNutrition, mealIndex: number) => {
                      const mealTotals = calculateMealTotals(meal.items);
                      // Display "Meal Totals" section if there are items in the meal.
                      const showTotalsSection = meal.items && meal.items.length > 0;

                      return (
                        <Card key={mealIndex} className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col bg-card">
                          <CardHeader className="pb-3 bg-secondary/20 rounded-t-lg">
                            <CardTitle className="text-lg flex items-center gap-2 font-medium">
                              {getIconForMeal(meal.mealTitle)}
                              {meal.mealTitle}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 flex-grow space-y-4">
                            {meal.items && meal.items.length > 0 ? (
                              meal.items.map((item: MealItemNutition, itemIndex: number) => (
                                <div key={itemIndex} className="mb-3 pb-3 border-b border-border last:border-b-0 last:pb-0 last:mb-0">
                                  <Badge
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-sm py-1 px-2.5 border-border mb-2"
                                    onClick={() => onSelectFoodForSwap(item.itemName)}
                                    title={`Click to swap: ${item.itemName}`}
                                  >
                                    {item.itemName}
                                  </Badge>
                                  <div className="pl-1 space-y-0.5">
                                    <NutritionDetail label="Quantity" value={item.quantity} icon={<Weight className="h-3 w-3 text-muted-foreground" />} />
                                    <NutritionDetail label="Calories" value={item.calories} />
                                    <NutritionDetail label="Protein" value={item.protein} />
                                    <NutritionDetail label="Carbs" value={item.carbs} />
                                    <NutritionDetail label="Fat" value={item.fat} />
                                    <NutritionDetail label="Sugar" value={item.sugar} />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No specific items provided for this meal.</p>
                            )}
                          </CardContent>
                          
                          <CardFooter className="text-xs text-muted-foreground pt-3 border-t mt-auto flex flex-col items-start space-y-2">
                            {showTotalsSection && (
                              <div className="w-full pb-2 mb-2 border-b border-dashed">
                                <p className="font-semibold text-sm text-foreground mb-1.5">Meal Totals:</p>
                                <div className="space-y-1">
                                  <MealTotalDisplay label="Calories" value={mealTotals.totalCalories} unit="kcal" icon={<Flame className="h-3.5 w-3.5 text-orange-500"/>} />
                                  <MealTotalDisplay label="Protein" value={mealTotals.totalProtein} unit="g" icon={<Beef className="h-3.5 w-3.5 text-red-500"/>} />
                                  <MealTotalDisplay label="Carbs" value={mealTotals.totalCarbs} unit="g" icon={<Zap className="h-3.5 w-3.5 text-yellow-500"/>} />
                                  <MealTotalDisplay label="Fat" value={mealTotals.totalFat} unit="g" icon={<CandlestickChart className="h-3.5 w-3.5 text-purple-500"/>}/>
                                  <MealTotalDisplay label="Sugar" value={mealTotals.totalSugar} unit="g" icon={<Vegan className="h-3.5 w-3.5 text-green-500"/>} />
                                </div>
                              </div>
                            )}
                             {meal.items.length > 0 && (
                                <p className="w-full"> 
                                    <Info className="h-3 w-3 mr-1.5 inline-block"/> Click an item to find alternatives. All info is estimated.
                                </p>
                             )}
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground p-4 text-center">No meals specified for {day.dayTitle}.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
         <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <NotebookText className="h-6 w-6 text-primary" />
              Meal Plan Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">The meal plan could not be displayed in the structured format.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

