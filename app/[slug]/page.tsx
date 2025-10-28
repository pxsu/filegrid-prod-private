// app/[slug]/page.tsx
'use client';

import { useCanvas } from '@/lib/hooks/useCanvas';
import { usePlayers } from '@/lib/hooks/usePlayers';
import { useEffect, use, useState } from 'react';
import { notFound } from 'next/navigation';
import PixiCanvas from '@/app/components/Canvas';

export default function CanvasPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params);
    
    // Canvas hook with real-time sync enabled (default)
    const { canvas, loading, error, loadCanvas } = useCanvas(slug);
    
    // Players hook with real-time sync for multiplayer features
    const { players, activePlayers } = usePlayers(canvas?.id);
    
    const [showPlayers, setShowPlayers] = useState(false);

    useEffect(() => {
        loadCanvas();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading canvas...</div>
            </div>
        );
    }

    if (error || !canvas) {
        notFound();
    }

    return (
        <div className="w-screen h-screen overflow-hidden bg-gray-50">
            {/* Main Canvas with Real-Time Sync */}
            <PixiCanvas canvas={canvas} enableSync={true} />
            
            {/* Active Players Indicator */}
            {activePlayers.length > 0 && (
                <div className="absolute top-20 right-4">
                    <button
                        onClick={() => setShowPlayers(!showPlayers)}
                        className="bg-white/90 px-3 py-2 rounded shadow text-sm hover:bg-white transition-colors"
                    >
                        👥 {activePlayers.length} Active {activePlayers.length === 1 ? 'User' : 'Users'}
                    </button>
                    
                    {showPlayers && (
                        <div className="absolute top-full right-0 mt-2 bg-white rounded shadow-lg p-3 min-w-[200px]">
                            <p className="text-xs font-semibold mb-2 text-gray-600">Active Users:</p>
                            {activePlayers.map((player) => (
                                <div key={player.id} className="flex items-center gap-2 py-1">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: player.color }}
                                    />
                                    <span className="text-sm">{player.userId}</span>
                                    <span className="text-xs text-gray-500 ml-auto">
                                        {player.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
            
            {/* Real-time Sync Status */}
            <div className="absolute bottom-4 right-4 bg-green-500/90 px-3 py-1 rounded-full shadow text-xs text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span>Real-time Sync Active</span>
            </div>
        </div>
    );
}