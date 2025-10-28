// lib/services/PlayerService.ts

import { Player, PlayerRole, PlayerStatus } from '@/lib/models/Player';

export class PlayerService {
    // Add player to canvas
    static async addPlayer(
        canvasId: string,
        userId: string,
        role: PlayerRole
    ): Promise<Player> {
        const player = new Player(canvasId, userId, role);

        // TODO: Save to database
        // await db.player.create({ data: player.toJSON() });

        return player;
    }

    // Get player by ID
    static async getPlayerById(id: string): Promise<Player | null> {
        // TODO: Fetch from database
        // const data = await db.player.findUnique({ where: { id } });
        // if (!data) return null;
        // return Player.fromJSON(data);

        return null;
    }

    // Get all players for a canvas
    static async getPlayersByCanvas(canvasId: string): Promise<Player[]> {
        // TODO: Fetch from database
        // const data = await db.player.findMany({
        //   where: { canvasId }
        // });
        // return data.map(d => Player.fromJSON(d));

        return [];
    }

    // Get active players for a canvas
    static async getActivePlayers(canvasId: string): Promise<Player[]> {
        // TODO: Fetch from database
        // const data = await db.player.findMany({
        //   where: {
        //     canvasId,
        //     status: { in: ['active', 'idle'] }
        //   }
        // });
        // return data.map(d => Player.fromJSON(d));

        return [];
    }

    // Get player by canvas and user
    static async getPlayerByCanvasAndUser(
        canvasId: string,
        userId: string
    ): Promise<Player | null> {
        // TODO: Fetch from database
        // const data = await db.player.findFirst({
        //   where: { canvasId, userId }
        // });
        // if (!data) return null;
        // return Player.fromJSON(data);

        return null;
    }

    // Update player
    static async updatePlayer(player: Player): Promise<Player> {
        player.lastActiveAt = new Date();

        // TODO: Save to database
        // await db.player.update({
        //   where: { id: player.id },
        //   data: player.toJSON()
        // });

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
        // TODO: Delete from database
        // await db.player.delete({ where: { id: playerId } });
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
        // TODO: Fetch from database
        // const data = await db.player.findFirst({
        //   where: { canvasId, role: 'owner' }
        // });
        // if (!data) return null;
        // return Player.fromJSON(data);

        return null;
    }
}