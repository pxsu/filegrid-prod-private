// lib/hooks/useCanvas.ts

'use client';

import { useState, useEffect } from 'react';
import { Canvas } from '@/lib/models/Canvas';
import { CanvasService } from '@/lib/services/CanvasService';

export function useCanvas(slug?: string) {
    const [canvas, setCanvas] = useState<Canvas | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* 
    Core functions:
        1. loadCanvas()
        2. createCanvas()
        3. updateCanvas()
        4. updateTitle()
        5. togglePublic()
        6. addObject()
        7. removeObject()
    */

    // ! ----------------------------------------------------------
    useEffect(() => {
        if (!slug) {
            setLoading(false);
            return;
        }

        loadCanvas();
    }, [slug]);

    // ! ----------------------------------------------------------
    const loadCanvas = async () => {
        if (!slug) return;

        try {
            setLoading(true);
            setError(null);
            const data = await CanvasService.getCanvasBySlug(slug);
            setCanvas(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load canvas');
        } finally {
            setLoading(false);
        }
    };
    // ! ----------------------------------------------------------

    // ! ----------------------------------------------------------
    const createCanvas = async (options?: {
        title?: string;
        ownerId?: string;
        isPublic?: boolean;
    }) => {
        try {
            setLoading(true);
            setError(null);
            const newCanvas = await CanvasService.createCanvas(options);
            setCanvas(newCanvas);
            return newCanvas;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create canvas');
            return null;
        } finally {
            setLoading(false);
        }
    };
    // ! ----------------------------------------------------------

    // ! ----------------------------------------------------------
    const updateCanvas = async (updatedCanvas: Canvas) => {
        try {
            setError(null);
            const updated = await CanvasService.updateCanvas(updatedCanvas);
            setCanvas(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update canvas');
            return null;
        }
    };
    // ! ----------------------------------------------------------
    
    // ! ----------------------------------------------------------
    const updateTitle = async (newTitle: string) => {
        if (!canvas) return null;

        try {
            setError(null);
            const updated = await CanvasService.updateCanvasTitle(canvas, newTitle);
            setCanvas(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update title');
            return null;
        }
    };
    // ! ----------------------------------------------------------

    // ! ----------------------------------------------------------
    const togglePublic = async () => {
        if (!canvas) return null;

        try {
            setError(null);
            const updated = await CanvasService.toggleCanvasPublic(canvas);
            setCanvas(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to toggle visibility');
            return null;
        }
    };
    // ! ----------------------------------------------------------

    // ! ----------------------------------------------------------
    const addObject = async (object: any) => {
        if (!canvas) return null;

        try {
            setError(null);
            const updated = await CanvasService.addObjectToCanvas(canvas, object);
            setCanvas(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add object');
            return null;
        }
    };
    // ! ----------------------------------------------------------

    // ! ----------------------------------------------------------
    const removeObject = async (objectId: string) => {
        if (!canvas) return null;

        try {
            setError(null);
            const updated = await CanvasService.removeObjectFromCanvas(canvas, objectId);
            setCanvas(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove object');
            return null;
        }
    };
    // ! ----------------------------------------------------------

    return {
        canvas,
        loading,
        error,
        loadCanvas,
        createCanvas,
        updateCanvas,
        updateTitle,
        togglePublic,
        addObject,
        removeObject,
    };
}