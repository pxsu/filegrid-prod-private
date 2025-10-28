// lib/hooks/usePlayers.ts

'use client';

import { useState, useEffect, useRef } from 'react';
import { Player, PlayerRole } from '@/lib/models/Player';
import { PlayerService } from '@/lib/services/PlayerService';
import { getAuthoritativeSync } from '@/lib/services/AuthoritativeSync';

export function usePlayers(canvasId?: string, enableRealtime: boolean = true) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [activePlayers, setActivePlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const syncRef = useRef(getAuthoritativeSync());

    useEffect(() => {
        if (!canvasId) {
            setLoading(false);
            return;
        }

        loadPlayers();
    }, [canvasId]);

    // Setup real-time sync for players
    useEffect(() => {
        if (!canvasId || !enableRealtime) return;

        const sync = syncRef.current;

        // Listen to player join events
        const unsubJoin = sync.on('player_joined', (event) => {
            const player = event.data as Player;
            setPlayers(prev => {
                if (prev.find(p => p.id === player.id)) return prev;
                return [...prev, player];
            });
            if (player.isOnline()) {
                setActivePlayers(prev => {
                    if (prev.find(p => p.id === player.id)) return prev;
                    return [...prev, player];
                });
            }
        });

        // Listen to player leave events
        const unsubLeave = sync.on('player_left', (event) => {
            const player = event.data as Player;
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            setActivePlayers(prev => prev.filter(p => p.id !== player.id));
        });

        // Listen to cursor movement
        const unsubCursor = sync.on('player_cursor_moved', (event) => {
            const player = event.data as Player;
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            setActivePlayers(prev => prev.map(p => p.id === player.id ? player : p));
        });

        // Listen to selection changes
        const unsubSelection = sync.on('player_selection_changed', (event) => {
            const player = event.data as Player;
            setPlayers(prev => prev.map(p => p.id === player.id ? player : p));
            setActivePlayers(prev => prev.map(p => p.id === player.id ? player : p));
        });

        return () => {
            unsubJoin();
            unsubLeave();
            unsubCursor();
            unsubSelection();
        };
    }, [canvasId, enableRealtime]);

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
            if (enableRealtime) {
                // Use sync service for real-time updates
                await syncRef.current.updatePlayerCursor(player.id, x, y);
                return player; // Will be updated via real-time listener
            } else {
                const updated = await PlayerService.updatePlayerCursor(player, x, y);
                setPlayers(players.map(p => p.id === updated.id ? updated : p));
                setActivePlayers(activePlayers.map(p => p.id === updated.id ? updated : p));
                return updated;
            }
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