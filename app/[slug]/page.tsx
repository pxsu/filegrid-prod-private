// app/[slug]/page.tsx
'use client';

import { useCanvas } from '@/lib/hooks/useCanvas';
import { useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import PixiCanvas from '@/app/components/Canvas';

export default function CanvasPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = use(params);
    const { canvas, loading, error, loadCanvas } = useCanvas(slug);

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
            <PixiCanvas canvas={canvas} />
        </div>
    );
}