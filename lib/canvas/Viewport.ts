// lib/canvas/Viewport.ts
import * as PIXI from 'pixi.js';
import { IPointData } from './FederatedEvent';

export interface ViewportOptions {
    minZoom?: number;
    maxZoom?: number;
    wheelZoomSpeed?: number;
}

export class Viewport {
    container: PIXI.Container;
    private minZoom: number;
    private maxZoom: number;
    private wheelZoomSpeed: number;

    // Mouse drag state
    private isDragging: boolean = false;
    private dragStart: IPointData = { x: 0, y: 0 };

    // Touch state for pinch-to-zoom
    private touches: Map<number, IPointData> = new Map();
    private lastPinchDistance: number = 0;

    constructor(options: ViewportOptions = {}) {
        this.container = new PIXI.Container();
        this.minZoom = options.minZoom ?? 0.1;
        this.maxZoom = options.maxZoom ?? 10;
        this.wheelZoomSpeed = options.wheelZoomSpeed ?? 0.001;
    }

    // Transform screen coordinates to world coordinates
    screenToWorld(point: IPointData): IPointData {
        const worldPoint = this.container.toLocal(point);
        return { x: worldPoint.x, y: worldPoint.y };
    }

    // Transform world coordinates to screen coordinates
    worldToScreen(point: IPointData): IPointData {
        const screenPoint = this.container.toGlobal(point);
        return { x: screenPoint.x, y: screenPoint.y };
    }

    // Pan the viewport
    pan(dx: number, dy: number): void {
        this.container.x += dx;
        this.container.y += dy;
    }

    // Zoom at a specific point (used for wheel zoom)
    zoomAt(point: IPointData, deltaZoom: number): void {
        const currentZoom = this.container.scale.x;
        const newZoom = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, currentZoom + deltaZoom)
        );

        if (newZoom === currentZoom) return;

        // Zoom towards the point
        const worldPos = this.screenToWorld(point);

        this.container.scale.set(newZoom);

        const newScreenPos = this.worldToScreen(worldPos);
        this.pan(point.x - newScreenPos.x, point.y - newScreenPos.y);
    }

    // Zoom by factor at a specific point (used for pinch)
    zoomByFactor(point: IPointData, factor: number): void {
        const currentZoom = this.container.scale.x;
        const newZoom = Math.max(
            this.minZoom,
            Math.min(this.maxZoom, currentZoom * factor)
        );

        if (newZoom === currentZoom) return;

        // Zoom towards the point
        const worldPos = this.screenToWorld(point);

        this.container.scale.set(newZoom);

        const newScreenPos = this.worldToScreen(worldPos);
        this.pan(point.x - newScreenPos.x, point.y - newScreenPos.y);
    }

    // Handle wheel zoom (mouse only)
    handleWheel(e: WheelEvent, cursorPos: IPointData): void {
        e.preventDefault();

        // Faster zoom with Ctrl/Cmd key (like Figma)
        const multiplier = e.ctrlKey || e.metaKey ? 3 : 1;
        const delta = -e.deltaY * this.wheelZoomSpeed * this.container.scale.x * multiplier;

        this.zoomAt(cursorPos, delta);
    }

    // Handle mouse drag start
    startMouseDrag(screenPos: IPointData): void {
        this.isDragging = true;
        this.dragStart = {
            x: screenPos.x - this.container.x,
            y: screenPos.y - this.container.y,
        };
    }

    // Handle mouse dragging
    mouseDrag(screenPos: IPointData): void {
        if (!this.isDragging) return;
        this.container.x = screenPos.x - this.dragStart.x;
        this.container.y = screenPos.y - this.dragStart.y;
    }

    // Handle mouse drag end
    endMouseDrag(): void {
        this.isDragging = false;
    }

    // Handle touch start
    handleTouchStart(pointerId: number, position: IPointData): void {
        this.touches.set(pointerId, position);
    }

    // Handle touch move
    handleTouchMove(pointerId: number, position: IPointData): void {
        const touchCount = this.touches.size;

        if (touchCount === 1) {
            // Single finger pan
            const oldPos = this.touches.get(pointerId);
            if (oldPos) {
                const dx = position.x - oldPos.x;
                const dy = position.y - oldPos.y;
                this.pan(dx, dy);
            }
            this.touches.set(pointerId, position);
        } else if (touchCount === 2) {
            // Two finger pinch/pan
            this.touches.set(pointerId, position);

            const touchArray = Array.from(this.touches.values());
            if (touchArray.length === 2) {
                const [touch1, touch2] = touchArray;

                // Calculate distance between touches
                const dx = touch2.x - touch1.x;
                const dy = touch2.y - touch1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Calculate center point
                const centerX = (touch1.x + touch2.x) / 2;
                const centerY = (touch1.y + touch2.y) / 2;

                if (this.lastPinchDistance > 0) {
                    // Pinch zoom
                    const scale = distance / this.lastPinchDistance;
                    this.zoomByFactor({ x: centerX, y: centerY }, scale);
                }

                this.lastPinchDistance = distance;
            }
        }
    }

    // Handle touch end
    handleTouchEnd(pointerId: number): void {
        this.touches.delete(pointerId);

        if (this.touches.size < 2) {
            this.lastPinchDistance = 0;
        }
    }

    // Handle touch cancel
    handleTouchCancel(pointerId: number): void {
        this.touches.delete(pointerId);
        this.lastPinchDistance = 0;
    }

    get zoom(): number {
        return this.container.scale.x;
    }

    get position(): IPointData {
        return { x: this.container.x, y: this.container.y };
    }

    get isDraggingMouse(): boolean {
        return this.isDragging;
    }
}