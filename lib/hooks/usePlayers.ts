// lib/hooks/usePlayers.ts

'use client';

import { useState, useEffect } from 'react';
import { Player, PlayerRole } from '@/lib/models/Player';
import { PlayerService } from '@/lib/services/PlayerService';

export function usePlayers(canvasId?: string) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [activePlayers, setActivePlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasId) {
            setLoading(false);
            return;
        }

        loadPlayers();
    }, [canvasId]);

    const loadPlayers = async () => {
        if (!canvasId) return;

        try {
            setLoading(true);
            setError(null);
            const allPlayers = await PlayerService.getPlayersByCanvas(canvasId);
            const active = await PlayerService.getActivePlayers(canvasId);
            setPlayers(allPlayers);
            setActivePlayers(active);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load players');
        } finally {
            setLoading(false);
        }
    };

    const addPlayer = async (userId: string, role: PlayerRole) => {
        if (!canvasId) return null;

        try {
            setError(null);
            const player = await PlayerService.addPlayer(canvasId, userId, role);
            setPlayers([...players, player]);
            return player;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add player');
            return null;
        }
    };

    const updatePlayerRole = async (player: Player, newRole: PlayerRole) => {
        try {
            setError(null);
            const updated = await PlayerService.updatePlayerRole(player, newRole);
            setPlayers(players.map(p => p.id === updated.id ? updated : p));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update role');
            return null;
        }
    };

    const updateCursor = async (player: Player, x: number, y: number) => {
        try {
            const updated = await PlayerService.updatePlayerCursor(player, x, y);
            setPlayers(players.map(p => p.id === updated.id ? updated : p));
            setActivePlayers(activePlayers.map(p => p.id === updated.id ? updated : p));
            return updated;
        } catch (err) {
            console.error('Failed to update cursor:', err);
            return null;
        }
    };

    const joinCanvas = async (player: Player) => {
        try {
            const updated = await PlayerService.playerJoin(player);
            setPlayers(players.map(p => p.id === updated.id ? updated : p));
            setActivePlayers([...activePlayers, updated]);
            return updated;
        } catch (err) {
            console.error('Failed to join canvas:', err);
            return null;
        }
    };

    const leaveCanvas = async (player: Player) => {
        try {
            const updated = await PlayerService.playerLeave(player);
            setPlayers(players.map(p => p.id === updated.id ? updated : p));
            setActivePlayers(activePlayers.filter(p => p.id !== updated.id));
            return updated;
        } catch (err) {
            console.error('Failed to leave canvas:', err);
            return null;
        }
    };

    const removePlayer = async (playerId: string) => {
        try {
            setError(null);
            await PlayerService.removePlayer(playerId);
            setPlayers(players.filter(p => p.id !== playerId));
            setActivePlayers(activePlayers.filter(p => p.id !== playerId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove player');
        }
    };

    return {
        players,
        activePlayers,
        loading,
        error,
        loadPlayers,
        addPlayer,
        updatePlayerRole,
        updateCursor,
        joinCanvas,
        leaveCanvas,
        removePlayer,
    };
}