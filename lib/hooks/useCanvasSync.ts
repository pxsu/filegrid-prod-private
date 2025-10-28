// lib/hooks/useCanvasSync.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@/lib/models/Canvas';
import { Viewport } from '@/lib/canvas/Viewport';
import { getAuthoritativeSync } from '@/lib/services/AuthoritativeSync';

/**
 * useCanvasSync - Syncs PixiJS Viewport with Firestore
 * 
 * This hook bridges the gap between the client-side rendering (PixiJS)
 * and the authoritative server state (Firestore)
 */
export function useCanvasSync(
    canvas: Canvas | null,
    viewport: Viewport | null,
    onCanvasUpdate?: (canvas: Canvas) => void
) {
    const syncRef = useRef(getAuthoritativeSync());
    const lastSyncTimeRef = useRef<number>(0);
    const syncThrottleMs = 50; // Sync viewport max 20 times per second

    /**
     * Sync viewport position to Firestore (throttled)
     */
    const syncViewportToServer = useCallback(() => {
        if (!canvas || !viewport) return;

        const now = Date.now();
        if (now - lastSyncTimeRef.current < syncThrottleMs) {
            return;
        }
        lastSyncTimeRef.current = now;

        const position = viewport.position;
        const zoom = viewport.zoom;

        // Only sync if values have changed
        if (
            canvas.data.viewport.x !== position.x ||
            canvas.data.viewport.y !== position.y ||
            canvas.data.viewport.zoom !== zoom
        ) {
            syncRef.current.updateViewport(canvas.id, {
                x: position.x,
                y: position.y,
                zoom
            });
        }
    }, [canvas, viewport, syncThrottleMs]);

    /**
     * Apply server viewport state to local viewport
     */
    const applyServerViewport = useCallback((serverCanvas: Canvas) => {
        if (!viewport) return;

        const serverViewport = serverCanvas.data.viewport;
        const currentPos = viewport.position;
        const currentZoom = viewport.zoom;

        // Only update if different (avoid feedback loop)
        const threshold = 1; // 1 pixel threshold
        const zoomThreshold = 0.01;

        if (
            Math.abs(currentPos.x - serverViewport.x) > threshold ||
            Math.abs(currentPos.y - serverViewport.y) > threshold ||
            Math.abs(currentZoom - serverViewport.zoom) > zoomThreshold
        ) {
            viewport.container.position.set(serverViewport.x, serverViewport.y);
            viewport.container.scale.set(serverViewport.zoom);
        }
    }, [viewport]);

    /**
     * Listen to viewport updates from server
     */
    useEffect(() => {
        if (!canvas) return;

        const sync = syncRef.current;

        const unsubViewport = sync.on('viewport_updated', (event) => {
            const serverViewport = event.data;
            if (viewport) {
                viewport.container.position.set(serverViewport.x, serverViewport.y);
                viewport.container.scale.set(serverViewport.zoom);
            }
        });

        const unsubCanvas = sync.on('canvas_updated', (event) => {
            const updatedCanvas = event.data as Canvas;
            applyServerViewport(updatedCanvas);
            if (onCanvasUpdate) {
                onCanvasUpdate(updatedCanvas);
            }
        });

        return () => {
            unsubViewport();
            unsubCanvas();
        };
    }, [canvas?.id, viewport, applyServerViewport, onCanvasUpdate]);

    return {
        syncViewportToServer,
        applyServerViewport
    };
}
