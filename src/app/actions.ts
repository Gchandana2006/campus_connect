// src/app/actions.ts
'use server';

import {
  generateItemDetailsFromImage,
  type GenerateItemDetailsFromImageInput,
  type GenerateItemDetailsFromImageOutput,
} from '@/ai/flows/generate-item-details-from-image';

export async function analyzeImageAction(input: GenerateItemDetailsFromImageInput): Promise<{ success: boolean, data?: GenerateItemDetailsFromImageOutput, error?: string }> {
  try {
    const result = await generateItemDetailsFromImage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to analyze image. ${errorMessage}` };
  }
}
