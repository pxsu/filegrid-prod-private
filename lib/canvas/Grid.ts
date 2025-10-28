// lib/canvas/Grid.ts
import * as PIXI from 'pixi.js';

export type GridStyle = 'none' | 'lines' | 'dots';

export interface GridOptions {
    style?: GridStyle;
    color?: number;
    opacity?: number;
    majorGridSize?: number;
    minorGridSize?: number;
}

export class Grid {
    private container: PIXI.Container;
    private graphics: PIXI.Graphics;
    private style: GridStyle;
    private color: number;
    private opacity: number;
    private majorGridSize: number;
    private minorGridSize: number;

    constructor(options: GridOptions = {}) {
        this.container = new PIXI.Container();
        this.graphics = new PIXI.Graphics();
        this.container.addChild(this.graphics);

        this.style = options.style ?? 'lines';
        this.color = options.color ?? 0xcccccc;
        this.opacity = options.opacity ?? 0.5;
        this.majorGridSize = options.majorGridSize ?? 100;
        this.minorGridSize = options.minorGridSize ?? 20;
    }

    getContainer(): PIXI.Container {
        return this.container;
    }

    update(viewport: any, screenWidth: number, screenHeight: number): void {
        if (this.style === 'none') {
            this.graphics.clear();
            return;
        }

        this.graphics.clear();

        // Calculate visible world bounds
        const worldTopLeft = viewport.screenToWorld({ x: 0, y: 0 });
        const worldBottomRight = viewport.screenToWorld({ x: screenWidth, y: screenHeight });

        const zoom = viewport.zoom;

        // Fade out when zoomed out too far
        if (zoom < 0.2) {
            return;
        }

        const fadeOpacity = Math.min(1, (zoom - 0.2) / 0.3) * this.opacity;

        if (this.style === 'lines') {
            this.drawLineGrid(worldTopLeft, worldBottomRight, fadeOpacity);
        } else if (this.style === 'dots') {
            this.drawDotGrid(worldTopLeft, worldBottomRight, fadeOpacity);
        }
    }

    private drawLineGrid(
        topLeft: { x: number; y: number },
        bottomRight: { x: number; y: number },
        opacity: number
    ): void {
        // Draw minor grid
        this.graphics.setStrokeStyle({
            width: 1,
            color: this.color,
            alpha: opacity * 0.3,
        });

        const minorStartX = Math.floor(topLeft.x / this.minorGridSize) * this.minorGridSize;
        const minorStartY = Math.floor(topLeft.y / this.minorGridSize) * this.minorGridSize;

        // Vertical lines
        for (let x = minorStartX; x <= bottomRight.x; x += this.minorGridSize) {
            this.graphics.moveTo(x, topLeft.y);
            this.graphics.lineTo(x, bottomRight.y);
        }

        // Horizontal lines
        for (let y = minorStartY; y <= bottomRight.y; y += this.minorGridSize) {
            this.graphics.moveTo(topLeft.x, y);
            this.graphics.lineTo(bottomRight.x, y);
        }

        this.graphics.stroke();

        // Draw major grid
        this.graphics.setStrokeStyle({
            width: 2,
            color: this.color,
            alpha: opacity * 0.6,
        });

        const majorStartX = Math.floor(topLeft.x / this.majorGridSize) * this.majorGridSize;
        const majorStartY = Math.floor(topLeft.y / this.majorGridSize) * this.majorGridSize;

        // Vertical lines
        for (let x = majorStartX; x <= bottomRight.x; x += this.majorGridSize) {
            this.graphics.moveTo(x, topLeft.y);
            this.graphics.lineTo(x, bottomRight.y);
        }

        // Horizontal lines
        for (let y = majorStartY; y <= bottomRight.y; y += this.majorGridSize) {
            this.graphics.moveTo(topLeft.x, y);
            this.graphics.lineTo(bottomRight.x, y);
        }

        this.graphics.stroke();
    }

    private drawDotGrid(
        topLeft: { x: number; y: number },
        bottomRight: { x: number; y: number },
        opacity: number
    ): void {
        const dotRadius = 2;

        // Draw minor dots
        const minorStartX = Math.floor(topLeft.x / this.minorGridSize) * this.minorGridSize;
        const minorStartY = Math.floor(topLeft.y / this.minorGridSize) * this.minorGridSize;

        for (let x = minorStartX; x <= bottomRight.x; x += this.minorGridSize) {
            for (let y = minorStartY; y <= bottomRight.y; y += this.minorGridSize) {
                this.graphics.circle(x, y, dotRadius);
                this.graphics.fill({ color: this.color, alpha: opacity * 0.3 });
            }
        }

        // Draw major dots
        const majorStartX = Math.floor(topLeft.x / this.majorGridSize) * this.majorGridSize;
        const majorStartY = Math.floor(topLeft.y / this.majorGridSize) * this.majorGridSize;

        for (let x = majorStartX; x <= bottomRight.x; x += this.majorGridSize) {
            for (let y = majorStartY; y <= bottomRight.y; y += this.majorGridSize) {
                this.graphics.circle(x, y, dotRadius * 1.5);
                this.graphics.fill({ color: this.color, alpha: opacity * 0.7 });
            }
        }
    }

    setStyle(style: GridStyle): void {
        this.style = style;
    }

    setColor(color: number): void {
        this.color = color;
    }

    setOpacity(opacity: number): void {
        this.opacity = opacity;
    }

    destroy(): void {
        this.graphics.destroy();
        this.container.destroy();
    }
}