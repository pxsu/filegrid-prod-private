// lib/services/PlayerService.ts

import { Player, PlayerRole, PlayerStatus } from '@/lib/models/Player';
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

export class PlayerService {
    private static COLLECTION = 'players';

    // Add player to canvas
    static async addPlayer(
        canvasId: string,
        userId: string,
        role: PlayerRole
    ): Promise<Player> {
        const player = new Player(canvasId, userId, role);
        await setDoc(doc(db, this.COLLECTION, player.id), player.toJSON());
        return player;
    }

    // Get player by ID
    static async getPlayerById(id: string): Promise<Player | null> {
        try {
            const docRef = doc(db, this.COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                return null;
            }

            return Player.fromJSON(docSnap.data());
        } catch (error) {
            console.error('Error fetching player by id:', error);
            return null;
        }
    }

    // Get all players for a canvas
    static async getPlayersByCanvas(canvasId: string): Promise<Player[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('canvasId', '==', canvasId),
                orderBy('lastActiveAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => Player.fromJSON(doc.data()));
        } catch (error) {
            console.error('Error fetching players by canvas:', error);
            return [];
        }
    }

    // Get active players for a canvas
    static async getActivePlayers(canvasId: string): Promise<Player[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('canvasId', '==', canvasId),
                where('status', 'in', ['active', 'idle'])
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => Player.fromJSON(doc.data()));
        } catch (error) {
            console.error('Error fetching active players:', error);
            return [];
        }
    }

    // Get player by canvas and user
    static async getPlayerByCanvasAndUser(
        canvasId: string,
        userId: string
    ): Promise<Player | null> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('canvasId', '==', canvasId),
                where('userId', '==', userId),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            return Player.fromJSON(querySnapshot.docs[0].data());
        } catch (error) {
            console.error('Error fetching player by canvas and user:', error);
            return null;
        }
    }

    // Update player
    static async updatePlayer(player: Player): Promise<Player> {
        player.lastActiveAt = new Date();
        await updateDoc(doc(db, this.COLLECTION, player.id), player.toJSON());
        return player;
    }

    // Update player role
    static async updatePlayerRole(
        player: Player,
        newRole: PlayerRole
    ): Promise<Player> {
        player.updateRole(newRole);
        return await this.updatePlayer(player);
    }

    // Update player cursor
    static async updatePlayerCursor(
        player: Player,
        x: number,
        y: number
    ): Promise<Player> {
        player.updateCursor(x, y);
        return await this.updatePlayer(player);
    }

    // Update player status
    static async updatePlayerStatus(
        player: Player,
        status: PlayerStatus
    ): Promise<Player> {
        player.setStatus(status);
        return await this.updatePlayer(player);
    }

    // Player joins canvas
    static async playerJoin(player: Player): Promise<Player> {
        player.join();
        return await this.updatePlayer(player);
    }

    // Player leaves canvas
    static async playerLeave(player: Player): Promise<Player> {
        player.leave();
        return await this.updatePlayer(player);
    }

    // Remove player from canvas
    static async removePlayer(playerId: string): Promise<void> {
        await deleteDoc(doc(db, this.COLLECTION, playerId));
    }

    // Update player selection
    static async updatePlayerSelection(
        player: Player,
        objectIds: string[]
    ): Promise<Player> {
        player.selectObjects(objectIds);
        return await this.updatePlayer(player);
    }

    // Check if user has access to canvas
    static async hasAccess(canvasId: string, userId: string): Promise<boolean> {
        const player = await this.getPlayerByCanvasAndUser(canvasId, userId);
        return player !== null;
    }

    // Check if user can edit canvas
    static async canEdit(canvasId: string, userId: string): Promise<boolean> {
        const player = await this.getPlayerByCanvasAndUser(canvasId, userId);
        return player !== null && player.canEdit();
    }

    // Get canvas owner
    static async getCanvasOwner(canvasId: string): Promise<Player | null> {
        try {
            const q = query(
                collection(db, this.COLLECTION),
                where('canvasId', '==', canvasId),
                where('role', '==', 'owner'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                return null;
            }

            return Player.fromJSON(querySnapshot.docs[0].data());
        } catch (error) {
            console.error('Error fetching canvas owner:', error);
            return null;
        }
    }
}