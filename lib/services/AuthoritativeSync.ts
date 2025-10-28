// lib/services/AuthoritativeSync.ts

import { Canvas, CanvasData } from '@/lib/models/Canvas';
import { Player } from '@/lib/models/Player';
import { db } from '@/lib/firebase/config';
import {
    doc,
    getDoc,
    onSnapshot,
    updateDoc,
    Unsubscribe,
    collection,
    query,
    where
} from 'firebase/firestore';

export type SyncEventType = 
    | 'canvas_updated'
    | 'object_added'
    | 'object_updated'
    | 'object_removed'
    | 'viewport_updated'
    | 'player_joined'
    | 'player_left'
    | 'player_cursor_moved'
    | 'player_selection_changed';

export interface SyncEvent {
    type: SyncEventType;
    data: any;
    timestamp: number;
    playerId?: string;
}

export type SyncCallback = (event: SyncEvent) => void;

/**
 * AuthoritativeSync - The core synchronization service
 * 
 * This service acts as the "authoritative server" by:
 * 1. Managing real-time listeners to Firestore (the source of truth)
 * 2. Broadcasting changes to all connected clients
 * 3. Throttling updates to prevent excessive writes
 * 4. Handling conflicts with last-write-wins strategy
 */
export class AuthoritativeSync {
    private canvasUnsubscribe: Unsubscribe | null = null;
    private playersUnsubscribe: Unsubscribe | null = null;
    private callbacks: Map<SyncEventType, Set<SyncCallback>> = new Map();
    private updateThrottles: Map<string, number> = new Map();
    private readonly THROTTLE_MS = 100; // Throttle updates to max 10/second

    /**
     * Start syncing a canvas - sets up real-time listeners
     */
    startCanvasSync(canvasId: string): void {
        this.stopCanvasSync();

        // Listen to canvas changes
        const canvasRef = doc(db, 'canvases', canvasId);
        this.canvasUnsubscribe = onSnapshot(canvasRef, (snapshot) => {
            if (snapshot.exists()) {
                const canvas = Canvas.fromJSON(snapshot.data());
                this.emit({
                    type: 'canvas_updated',
                    data: canvas,
                    timestamp: Date.now()
                });
            }
        });

        // Listen to player changes
        const playersQuery = query(
            collection(db, 'players'),
            where('canvasId', '==', canvasId)
        );
        
        this.playersUnsubscribe = onSnapshot(playersQuery, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                const player = Player.fromJSON(change.doc.data());
                
                if (change.type === 'added') {
                    this.emit({
                        type: 'player_joined',
                        data: player,
                        timestamp: Date.now(),
                        playerId: player.id
                    });
                } else if (change.type === 'modified') {
                    // Determine what changed
                    const oldData = change.doc.data();
                    const newData = player;
                    
                    if (JSON.stringify(oldData.cursorPosition) !== JSON.stringify(newData.cursorPosition)) {
                        this.emit({
                            type: 'player_cursor_moved',
                            data: player,
                            timestamp: Date.now(),
                            playerId: player.id
                        });
                    }
                    
                    if (JSON.stringify(oldData.selectedObjectIds) !== JSON.stringify(newData.selectedObjectIds)) {
                        this.emit({
                            type: 'player_selection_changed',
                            data: player,
                            timestamp: Date.now(),
                            playerId: player.id
                        });
                    }
                } else if (change.type === 'removed') {
                    this.emit({
                        type: 'player_left',
                        data: player,
                        timestamp: Date.now(),
                        playerId: player.id
                    });
                }
            });
        });
    }

    /**
     * Stop syncing - cleanup listeners
     */
    stopCanvasSync(): void {
        if (this.canvasUnsubscribe) {
            this.canvasUnsubscribe();
            this.canvasUnsubscribe = null;
        }
        if (this.playersUnsubscribe) {
            this.playersUnsubscribe();
            this.playersUnsubscribe = null;
        }
    }

    /**
     * Update canvas data with throttling
     */
    async updateCanvas(canvasId: string, data: Partial<CanvasData>): Promise<void> {
        const key = `canvas_${canvasId}`;
        
        if (this.shouldThrottle(key)) {
            return;
        }

        try {
            const canvasRef = doc(db, 'canvases', canvasId);
            await updateDoc(canvasRef, {
                data,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating canvas:', error);
        }
    }

    /**
     * Update viewport position with throttling
     */
    async updateViewport(
        canvasId: string,
        viewport: { x: number; y: number; zoom: number }
    ): Promise<void> {
        const key = `viewport_${canvasId}`;
        
        if (this.shouldThrottle(key)) {
            return;
        }

        try {
            const canvasRef = doc(db, 'canvases', canvasId);
            await updateDoc(canvasRef, {
                'data.viewport': viewport,
                updatedAt: new Date()
            });

            this.emit({
                type: 'viewport_updated',
                data: viewport,
                timestamp: Date.now()
            });
        } catch (error) {
            console.error('Error updating viewport:', error);
        }
    }

    /**
     * Update player cursor with throttling
     */
    async updatePlayerCursor(
        playerId: string,
        x: number,
        y: number
    ): Promise<void> {
        const key = `cursor_${playerId}`;
        
        if (this.shouldThrottle(key)) {
            return;
        }

        try {
            const playerRef = doc(db, 'players', playerId);
            await updateDoc(playerRef, {
                cursorPosition: { x, y },
                lastActiveAt: new Date()
            });
        } catch (error) {
            console.error('Error updating cursor:', error);
        }
    }

    /**
     * Add object to canvas
     */
    async addObject(canvasId: string, object: any): Promise<void> {
        try {
            const canvasRef = doc(db, 'canvases', canvasId);
            const snapshot = await getDoc(canvasRef);
            
            if (snapshot.exists()) {
                const canvas = Canvas.fromJSON(snapshot.data());
                canvas.addObject(object);
                await updateDoc(canvasRef, canvas.toJSON());

                this.emit({
                    type: 'object_added',
                    data: object,
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error adding object:', error);
        }
    }

    /**
     * Remove object from canvas
     */
    async removeObject(canvasId: string, objectId: string): Promise<void> {
        try {
            const canvasRef = doc(db, 'canvases', canvasId);
            const snapshot = await getDoc(canvasRef);
            
            if (snapshot.exists()) {
                const canvas = Canvas.fromJSON(snapshot.data());
                canvas.removeObject(objectId);
                await updateDoc(canvasRef, canvas.toJSON());

                this.emit({
                    type: 'object_removed',
                    data: { objectId },
                    timestamp: Date.now()
                });
            }
        } catch (error) {
            console.error('Error removing object:', error);
        }
    }

    /**
     * Subscribe to sync events
     */
    on(eventType: SyncEventType, callback: SyncCallback): () => void {
        if (!this.callbacks.has(eventType)) {
            this.callbacks.set(eventType, new Set());
        }
        this.callbacks.get(eventType)!.add(callback);

        // Return unsubscribe function
        return () => {
            this.callbacks.get(eventType)?.delete(callback);
        };
    }

    /**
     * Emit sync event to all listeners
     */
    private emit(event: SyncEvent): void {
        const callbacks = this.callbacks.get(event.type);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(event);
                } catch (error) {
                    console.error('Error in sync callback:', error);
                }
            });
        }
    }

    /**
     * Check if update should be throttled
     */
    private shouldThrottle(key: string): boolean {
        const now = Date.now();
        const lastUpdate = this.updateThrottles.get(key) || 0;
        
        if (now - lastUpdate < this.THROTTLE_MS) {
            return true;
        }
        
        this.updateThrottles.set(key, now);
        return false;
    }

    /**
     * Cleanup all resources
     */
    destroy(): void {
        this.stopCanvasSync();
        this.callbacks.clear();
        this.updateThrottles.clear();
    }
}

// Singleton instance
let syncInstance: AuthoritativeSync | null = null;

export function getAuthoritativeSync(): AuthoritativeSync {
    if (!syncInstance) {
        syncInstance = new AuthoritativeSync();
    }
    return syncInstance;
}

export function destroyAuthoritativeSync(): void {
    if (syncInstance) {
        syncInstance.destroy();
        syncInstance = null;
    }
}
