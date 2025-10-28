// lib/services/CanvasService.ts

import { Canvas } from '@/lib/models/Canvas';
import { CanvasObject } from '@/lib/models/CanvasObjects';
import { db } from '@/lib/firebase/config';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    orderBy,
    limit
} from 'firebase/firestore';

export class CanvasService {
    private static COLLECTION = 'canvases';

    // Generate unique slug 
    static generateSlug(): string {
        const randomNum = Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, '0');
        return `f${randomNum}`;
    }

    // Create a new canvas
    static async createCanvas(options?: {
        title?: string;
        ownerId?: string;
        isPublic?: boolean;
    }): Promise<Canvas> {
        // Generate unique slug
        let slug = this.generateSlug();

        // Check if slug exists, regenerate if it does
        while (await this.slugExists(slug)) {
            slug = this.generateSlug();
        }

        const canvas = new Canvas(slug, undefined, options);

        // Save to Firestore
        await setDoc(doc(db, this.COLLECTION, canvas.id), canvas.toJSON());

        return canvas;
    }

    // Get canvas by slug
    static async getCanvasBySlug(slug: string): Promise<Canvas | null> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('slug', '==', slug),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            const data = querySnapshot.docs[0].data();
            return Canvas.fromJSON(data);
        } catch (error) {
            console.error('Error fetching canvas by slug:', error);
            return null;
        }
    }

    // Get canvas by id
    static async getCanvasById(id: string): Promise<Canvas | null> {
        try {
            const docRef = doc(db, this.COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return Canvas.fromJSON(docSnap.data());
        } catch (error) {
            console.error('Error fetching canvas by id:', error);
            return null;
        }
    }

    // Update canvas
    static async updateCanvas(canvas: Canvas): Promise<Canvas> {
        canvas.updatedAt = new Date();
        await updateDoc(doc(db, this.COLLECTION, canvas.id), canvas.toJSON());
        return canvas;
    }

    // Delete canvas
    static async deleteCanvas(canvasId: string): Promise<void> {
        await deleteDoc(doc(db, this.COLLECTION, canvasId));
    }

    // Add object to canvas
    static async addObjectToCanvas(canvas: Canvas, object: CanvasObject): Promise<Canvas> {
        canvas.addObject(object);
        return await this.updateCanvas(canvas);
    }

    // Remove object from canvas
    static async removeObjectFromCanvas(canvas: Canvas, objectId: string): Promise<Canvas> {
        canvas.removeObject(objectId);
        return await this.updateCanvas(canvas);
    }

    // Update canvas title
    static async updateCanvasTitle(canvas: Canvas, newTitle: string): Promise<Canvas> {
        canvas.updateTitle(newTitle);
        return await this.updateCanvas(canvas);
    }

    // Toggle canvas visibility
    static async toggleCanvasPublic(canvas: Canvas): Promise<Canvas> {
        canvas.togglePublic();
        return await this.updateCanvas(canvas);
    }

    // Validate slug format
    static isValidSlugFormat(slug: string): boolean {
        return /^f\d{6}$/.test(slug);
    }

    // Check if slug exists (to be implemented with database)
    static async slugExists(slug: string): Promise<boolean> {
        const canvas = await this.getCanvasBySlug(slug);
        return canvas !== null;
    }

    // Get all canvases for a user
    static async getCanvasesByUser(userId: string): Promise<Canvas[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('ownerId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => Canvas.fromJSON(doc.data()));
        } catch (error) {
            console.error('Error fetching user canvases:', error);
            return [];
        }
    }

    // Get public canvases
    static async getPublicCanvases(limitCount: number = 20): Promise<Canvas[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('isPublic', '==', true),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => Canvas.fromJSON(doc.data()));
        } catch (error) {
            console.error('Error fetching public canvases:', error);
            return [];
        }
    }
}