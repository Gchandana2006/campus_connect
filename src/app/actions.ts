// src/app/actions.ts
'use server';

import {
  generateItemDetailsFromImage,
  type GenerateItemDetailsFromImageInput,
} from '@/ai/flows/generate-item-details-from-image';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/server';

export async function analyzeImageAction(input: GenerateItemDetailsFromImageInput) {
  try {
    const result = await generateItemDetailsFromImage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error analyzing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Failed to analyze image. ${errorMessage}` };
  }
}

export type PostItemInput = {
    name: string;
    status: 'Lost' | 'Found';
    category: string;
    description: string;
    location: string;
    date: string;
    userId: string;
    imageUri: string;
};

export async function postItemAction(input: PostItemInput) {
    try {
        const { firestore } = initializeFirebase();
        const collectionName = input.status === 'Lost' ? 'lostItems' : 'foundItems';
        
        await addDoc(collection(firestore, 'items'), {
            ...input,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return { success: true };

    } catch (error) {
        console.error('Error posting item:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { success: false, error: `Failed to post item. ${errorMessage}` };
    }
}
