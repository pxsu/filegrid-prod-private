// components/Canvas/PixiCanvas.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import { Canvas } from '@/lib/models/Canvas';
import { Viewport } from '@/lib/canvas/Viewport';

interface PixiCanvasProps {
    canvas: Canvas;
    onCanvasUpdate?: (canvas: Canvas) => void;
}

export default function PixiCanvas({ canvas, onCanvasUpdate }: PixiCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const viewportRef = useRef<Viewport | null>(null);
    const [zoom, setZoom] = useState(1);
    const [isSpacePressed, setIsSpacePressed] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;

        let isDestroyed = false;

        const initPixi = async () => {
            const app = new PIXI.Application();

            await app.init({
                width: containerRef.current!.clientWidth,
                height: containerRef.current!.clientHeight,
                background: '#ffffff',
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (isDestroyed) {
                app.destroy(true);
                return;
            }

            containerRef.current!.appendChild(app.canvas);
            appRef.current = app;

            // Create viewport
            const viewport = new Viewport({
                minZoom: 0.1,
                maxZoom: 10,
                wheelZoomSpeed: 0.001,
            });
            viewportRef.current = viewport;

            // Apply stored viewport settings from canvas data
            viewport.container.position.set(
                canvas.data.viewport.x,
                canvas.data.viewport.y
            );
            viewport.container.scale.set(canvas.data.viewport.zoom);
            setZoom(canvas.data.viewport.zoom);

            app.stage.addChild(viewport.container);

            // Setup event handlers
            setupEventHandlers(app, viewport);

            // Render objects from canvas.data
            renderObjects(viewport, canvas);

            // Update zoom indicator on every frame
            app.ticker.add(() => {
                setZoom(viewport.zoom);
            });
        };

        initPixi();

        return () => {
            isDestroyed = true;
            if (appRef.current) {
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [canvas]);

    const setupEventHandlers = (app: PIXI.Application, viewport: Viewport) => {
        const canvas = app.canvas;
        let currentCursor = 'default';

        const updateCursor = () => {
            if (isSpacePressed || viewport.isDraggingMouse) {
                canvas.style.cursor = 'grabbing';
            } else {
                canvas.style.cursor = currentCursor;
            }
        };

        // Keyboard - Space bar for pan mode
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !isSpacePressed) {
                setIsSpacePressed(true);
                canvas.style.cursor = 'grab';
                e.preventDefault();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsSpacePressed(false);
                canvas.style.cursor = 'default';
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Wheel zoom (mouse/trackpad)
        canvas.addEventListener('wheel', (e: WheelEvent) => {
            viewport.handleWheel(e, { x: e.clientX, y: e.clientY });
        }, { passive: false });

        // Mouse events for panning
        canvas.addEventListener('pointerdown', (e: PointerEvent) => {
            if (e.pointerType === 'mouse') {
                // Left click OR space+click = pan
                if (e.button === 0) {
                    viewport.startMouseDrag({ x: e.clientX, y: e.clientY });
                    canvas.style.cursor = 'grabbing';
                    e.preventDefault();
                }
            } else if (e.pointerType === 'touch') {
                // Touch events
                viewport.handleTouchStart(e.pointerId, { x: e.clientX, y: e.clientY });
            }
        });

        canvas.addEventListener('pointermove', (e: PointerEvent) => {
            if (e.pointerType === 'mouse') {
                viewport.mouseDrag({ x: e.clientX, y: e.clientY });
            } else if (e.pointerType === 'touch') {
                viewport.handleTouchMove(e.pointerId, { x: e.clientX, y: e.clientY });
            }
        });

        const endPointer = (e: PointerEvent) => {
            if (e.pointerType === 'mouse') {
                viewport.endMouseDrag();
                canvas.style.cursor = isSpacePressed ? 'grab' : 'default';
            } else if (e.pointerType === 'touch') {
                viewport.handleTouchEnd(e.pointerId);
            }
        };

        canvas.addEventListener('pointerup', endPointer);
        canvas.addEventListener('pointerleave', endPointer);
        canvas.addEventListener('pointercancel', (e: PointerEvent) => {
            if (e.pointerType === 'touch') {
                viewport.handleTouchCancel(e.pointerId);
            }
        });

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    };

    const renderObjects = (viewport: Viewport, canvas: Canvas) => {
        // Render a test circle
        const graphics = new PIXI.Graphics();
        graphics.circle(200, 200, 100);
        graphics.fill(0xff0000);

        // Add a smaller circle
        const graphics2 = new PIXI.Graphics();
        graphics2.circle(400, 300, 50);
        graphics2.fill(0x0000ff);

        viewport.container.addChild(graphics);
        viewport.container.addChild(graphics2);
    };

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (appRef.current && containerRef.current) {
                appRef.current.renderer.resize(
                    containerRef.current.clientWidth,
                    containerRef.current.clientHeight
                );
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative w-full h-full">
            <div
                ref={containerRef}
                className="w-full h-full"
                style={{ cursor: 'default', touchAction: 'none' }}
            />

            {/* Zoom indicator */}
            <div className="absolute top-4 left-4 bg-white/90 px-3 py-2 rounded shadow text-sm pointer-events-none select-none">
                <p className="font-semibold">{canvas.title}</p>
                <p className="text-xs text-gray-600">
                    Zoom: {(zoom * 100).toFixed(0)}%
                </p>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded shadow text-xs text-gray-600 pointer-events-none select-none">
                <p className="font-semibold mb-1">Mouse Controls:</p>
                <p>🖱️ Drag = Pan</p>
                <p>🖱️ Scroll = Zoom</p>
                <p>⌘/Ctrl + Scroll = Fast zoom</p>
                <p>Space + Drag = Pan (alt)</p>
                <p className="font-semibold mt-2 mb-1">Touch Controls:</p>
                <p>👆 One finger = Pan</p>
                <p>🤏 Two fingers = Pinch zoom</p>
            </div>
        </div>
    );
}