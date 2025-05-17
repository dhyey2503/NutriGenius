'use server';
/**
 * @fileOverview Generates personalized meal plans based on user dietary preferences and health goals, including nutritional information and quantities.
 *
 * - generateMealPlan - A function that generates a personalized meal plan with nutritional details and quantities.
 * - GenerateMealPlanInput - The input type for the generateMealPlan function.
 * - GenerateMealPlanOutput - The return type for the generateMealPlan function, now a structured object.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateMealPlanInputSchema = z.object({
  dietaryRestrictions: z
    .string()
    .describe(
      'Any dietary restrictions the user has (e.g., vegetarian, gluten-free, dairy-free.'
    ),
  healthGoals: z
    .string()
    .describe(
      'The user’s health goals (e.g., weight loss, muscle gain, improved energy.'
    ),
  preferences: z
    .string()
    .describe(
      'The user’s food preferences (e.g., favorite foods, cuisines, disliked foods.'
    ),
  mealCount: z
    .number()
    .min(1, "Minimum 1 meal per day.")
    .max(4, "Maximum 4 meals per day.")
    .describe('The number of meals to include in the plan (min: 1, max: 4). Default is 3 if not specified or invalid.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;

const MealItemSchema = z.object({
  itemName: z.string().describe("The name of the food item."),
  quantity: z.string().optional().describe("Estimated quantity of the food item, e.g., '100g', '1 cup', '2 slices'. Provide 'N/A' only if truly unknown and cannot be estimated."),
  calories: z.string().describe("Estimated calories. MUST be a string like '150 kcal'. If zero or negligible, use '0 kcal'. Use 'N/A' ONLY as a last resort if truly un-estimatable."),
  protein: z.string().describe("Estimated protein. MUST be a string like '10g'. If zero or negligible, use '0g'. Use 'N/A' ONLY as a last resort if truly un-estimatable."),
  carbs: z.string().describe("Estimated carbohydrates. MUST be a string like '20g'. If zero or negligible, use '0g'. Use 'N/A' ONLY as a last resort if truly un-estimatable."),
  fat: z.string().describe("Estimated fat. MUST be a string like '5g'. If zero or negligible, use '0g'. Use 'N/A' ONLY as a last resort if truly un-estimatable."),
  sugar: z.string().describe("Estimated sugar. MUST be a string like '2g'. If zero or negligible, use '0g'. Use 'N/A' ONLY as a last resort if truly un-estimatable."),
});

const MealSchema = z.object({
  mealTitle: z.string().describe("The title of the meal (e.g., Breakfast, Lunch, High-Tea, Dinner)."),
  items: z.array(MealItemSchema).describe("A list of food items for this meal, including their quantity and nutritional information."),
});

const DayPlanSchema = z.object({
  dayTitle: z.string().describe("The title of the day (e.g., Day 1, Day 2)."),
  meals: z.array(MealSchema).describe("A list of meals for this day."),
});

const GenerateMealPlanOutputSchema = z.object({
  days: z.array(DayPlanSchema).describe("A 7-day meal plan, where each day contains a list of meals and their items with quantity and nutritional information."),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;


export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
  // Ensure mealCount is within 1-4 range, default to 3 if not provided or invalid.
  const validatedInput = {
    ...input,
    mealCount: Math.min(Math.max(input.mealCount || 3, 1), 4) 
  };

  const result = await generateMealPlanFlow(validatedInput);
  if (!result) {
    throw new Error('AI failed to generate a meal plan output.');
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateMealPlanPrompt',
  input: {schema: GenerateMealPlanInputSchema},
  output: {schema: GenerateMealPlanOutputSchema},
  prompt: `You are an expert nutritionist. Generate a personalized 7-day meal plan for the user.
Each day MUST include exactly {{{mealCount}}} meals.

**Nutritional Information for Each Item (CRITICAL - Adhere Strictly):**
For EACH food item, you MUST provide its:
1.  \`itemName\` (e.g., "Grilled Chicken Breast")
2.  \`quantity\` (e.g., "100g", "1 cup", "2 slices"; provide 'N/A' only if truly unknown and un-estimatable for a typical serving)
3.  \`calories\` (e.g., "165 kcal")
4.  \`protein\` (e.g., "31g")
5.  \`carbs\` (e.g., "0g")
6.  \`fat\` (e.g., "3.6g")
7.  \`sugar\` (e.g., "0g")

**Formatting Nutritional Values (ABSOLUTELY CRITICAL - ZERO TOLERANCE FOR DEVIATION):**
- Nutritional value fields (calories, protein, carbs, fat, sugar) MUST be EXTREMELY concise strings.
- Each string MUST contain **ONLY** the numerical value AND its unit (e.g., "150 kcal", "10g", "0.5g", "0g"). For example, "10g" is CORRECT.
- **ABSOLUTELY NO OTHER TEXT**: There MUST BE NO other text, branding, commentary, disclaimers, or any extraneous characters whatsoever in these fields.
    - For example, a value like "5g Sugar, (C) BrandName" is **INCORRECT**.
    - A value like "sugar: 5g (estimated)" is **INCORRECT**.
    - A value like "sugar: 1g Coca Cola, Inc. - All Rights Reserved. ..." is **COMPLETELY UNACCEPTABLE AND INCORRECT**.
    - The field value MUST be *exactly* like "5g" or "165 kcal".
- Your primary goal is to provide ACCURATE NUMERICAL ESTIMATES for these values. If you cannot find an exact value, estimate it for a typical serving of the food item. Do not just put "0g" or "N/A" if a reasonable estimate can be made.

**Handling Zero or Unavailable Nutritional Values (STRICT RULES):**
- If a nutritional value (calories, protein, carbs, fat, sugar) for an item is TRULY zero or negligible after a genuine attempt to estimate, you MUST explicitly state it as "0 kcal", "0g", etc. This value must still follow the "numerical value unit" format.
- Do NOT omit these fields for zero/negligible values. All nutritional fields are REQUIRED.
- Use "N/A" ONLY as an ABSOLUTE LAST RESORT if the information is genuinely unobtainable even after a diligent estimation attempt for a typical serving. Prioritize providing an estimate or "0" (e.g., "0g") over "N/A".
- **CRITICAL REMINDER**: All nutritional fields for every item MUST be populated with the best possible numerical estimate and follow the "number unit" format. Users depend on this for accurate meal totals. Avoid placeholder text, non-numerical responses, or any extra text. If you cannot find a value for an item, try to find a similar item and use its values as an estimate. Your goal is to make these fields as numerically useful and clean as possible.

**Meal Naming Convention based on 'Desired number of meals per day ({{{mealCount}}}):**
- If {{{mealCount}}} is 1, the meal title MUST be "Main Meal".
- If {{{mealCount}}} is 2, the meal titles MUST be "Breakfast" and "Dinner", in that order.
- If {{{mealCount}}} is 3, the meal titles MUST be "Breakfast", "Lunch", and "Dinner", in that order.
- If {{{mealCount}}} is 4, the meal titles MUST be "Breakfast", "Lunch", "High-Tea", and "Dinner", in that order.
You MUST use these exact titles in the order specified for the given {{{mealCount}}} and assign them to the \`mealTitle\` field for each meal.
It is CRITICAL that if {{{mealCount}}} is 4, you generate FOUR distinct meals for each day: Breakfast, Lunch, High-Tea, and Dinner, in this specific order. "High-Tea" is a separate meal between Lunch and Dinner.

**Output Structure (VERY IMPORTANT - Adhere Strictly):**
Your response MUST be structured as a list of days. Each day object MUST have a 'dayTitle' (e.g., "Day 1") and a 'meals' array.
EACH meal object within the 'meals' array MUST have a 'mealTitle' field (populated according to the naming convention above) and an 'items' array.
Each item object in the 'items' array MUST include all the fields specified under "Nutritional Information for Each Item" with correctly formatted values as per the "Formatting Nutritional Values" and "Handling Zero or Unavailable Nutritional Values" sections. All nutritional fields (calories, protein, carbs, fat, sugar) are REQUIRED.

Example for one item in a meal (ensure all fields are present and correctly formatted, with NO extraneous text):
{
  "itemName": "Grilled Chicken Breast",
  "quantity": "100g",
  "calories": "165 kcal",
  "protein": "31g",
  "carbs": "0g",
  "fat": "3.6g",
  "sugar": "0g"
}

User's details:
Dietary Restrictions: {{{dietaryRestrictions}}}
HealthGoals: {{{healthGoals}}}
Preferences: {{{preferences}}}
Desired number of meals per day: {{{mealCount}}}

Generate the 7-day meal plan.
**FINAL CHECK (MANDATORY - YOUR RESPONSE WILL BE REJECTED IF THESE ARE NOT MET):**
1.  The ENTIRE response MUST be valid JSON.
2.  EVERY meal object MUST have the 'mealTitle' field, populated according to the naming convention for {{{mealCount}}}.
3.  EVERY item in EVERY meal MUST have ALL nutritional fields: 'calories', 'protein', 'carbs', 'fat', 'sugar'. These fields are REQUIRED.
4.  EVERY nutritional field (calories, protein, carbs, fat, sugar) MUST contain ONLY a numerical value and its unit (e.g., "10g", "150 kcal", "0g"). NO EXTRA TEXT, no commentary, no branding. Use "N/A" as an absolute last resort if an estimate is impossible, but "0g" or "0 kcal" is preferred for zero values.
5.  Ensure that if {{{mealCount}}} is 4, the 'High-Tea' meal is distinct and appears after 'Lunch' and before 'Dinner'.
6.  Double-check that all nutritional fields contain realistic, estimated numerical values and their units ONLY.
`,
});

const generateMealPlanFlow = ai.defineFlow(
  {
    name: 'generateMealPlanFlow',
    inputSchema: GenerateMealPlanInputSchema,
    outputSchema: GenerateMealPlanOutputSchema,
  },
  async (input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a meal plan.');
    }
    // Additional validation to ensure the output structure is as expected,
    // though Zod schema validation on output should handle most of this.
    // For example, you could check if output.days is an array and has items.
    if (!output.days || !Array.isArray(output.days) || output.days.length === 0) {
        console.error("AI returned no days in the meal plan:", output);
        throw new Error("AI returned an empty or invalid meal plan (no days).");
    }
    output.days.forEach(day => {
        if (!day.meals || !Array.isArray(day.meals)) {
            console.error("AI returned a day with no meals array:", day);
            throw new Error("AI returned a day with invalid meals structure.");
        }
        day.meals.forEach(meal => {
            if (typeof meal.mealTitle !== 'string' || meal.mealTitle.trim() === '') {
                 console.error("AI returned a meal with missing or empty mealTitle:", meal);
                 throw new Error("AI returned a meal with missing or empty mealTitle.");
            }
            if (!meal.items || !Array.isArray(meal.items)) {
                console.error("AI returned a meal with no items array:", meal);
                throw new Error("AI returned a meal with invalid items structure.");
            }
            meal.items.forEach(item => {
                const requiredFields: (keyof typeof item)[] = ['itemName', 'calories', 'protein', 'carbs', 'fat', 'sugar'];
                for (const field of requiredFields) {
                    if (typeof item[field] !== 'string' || (item[field] as string).trim() === '') {
                        // console.warn(`AI returned an item with missing or empty required field '${field}':`, item);
                        // Potentially throw error or try to recover if this becomes a frequent issue despite strong prompts.
                        // For now, the Zod schema at the prompt level should catch this.
                    }
                }
            });
        });
    });

    return output;
  }
);

