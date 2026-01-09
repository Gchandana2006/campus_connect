// src/ai/flows/generate-item-details-from-image.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow that analyzes an image of a lost or found item
 * and generates a description and suggested categories for the item.
 *
 * - generateItemDetailsFromImage - A function that takes an image data URI as input and returns a description and suggested categories.
 * - GenerateItemDetailsFromImageInput - The input type for the generateItemDetailsFromImage function.
 * - GenerateItemDetailsFromImageOutput - The return type for the generateItemDetailsFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateItemDetailsFromImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the lost or found item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateItemDetailsFromImageInput = z.infer<typeof GenerateItemDetailsFromImageInputSchema>;

const GenerateItemDetailsFromImageOutputSchema = z.object({
  description: z.string().describe('A detailed description of the item in the image.'),
  suggestedCategories: z.array(z.string()).describe('An array of suggested categories for the item.'),
});
export type GenerateItemDetailsFromImageOutput = z.infer<typeof GenerateItemDetailsFromImageOutputSchema>;

export async function generateItemDetailsFromImage(
  input: GenerateItemDetailsFromImageInput
): Promise<GenerateItemDetailsFromImageOutput> {
  return generateItemDetailsFromImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateItemDetailsFromImagePrompt',
  input: {schema: GenerateItemDetailsFromImageInputSchema},
  output: {schema: GenerateItemDetailsFromImageOutputSchema},
  prompt: `You are an AI assistant designed to analyze images of lost or found items and generate a description and suggested categories for them.

  Analyze the image and provide a detailed description of the item. Also, suggest a few relevant categories for the item.

  Image: {{media url=photoDataUri}}

  Description:
  Suggested Categories:`, // Ensure output matches the schema
});

const generateItemDetailsFromImageFlow = ai.defineFlow(
  {
    name: 'generateItemDetailsFromImageFlow',
    inputSchema: GenerateItemDetailsFromImageInputSchema,
    outputSchema: GenerateItemDetailsFromImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
