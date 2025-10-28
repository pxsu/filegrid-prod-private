// lib/models/CanvasObjects.ts

// Main data models
export type ObjectType =
    | 'rectangle'
    | 'circle'
    | 'ellipse'
    | 'triangle'
    | 'line'
    | 'arrow'
    | 'text'
    | 'image'
    | 'sticky-note'
    | 'connector';

export type Position = {
    x: number;
    y: number;
};

export type Size = {
    width: number;
    height: number;
}

export abstract class CanvasObject {
    id: string; 
    canvasId: string;
    type: ObjectType; 
    position: Position;
    rotation: number;
    zIndex: number;
    locked: boolean;
    visible: boolean;
    opacity: number;
    createdAt: Date;
    updatedAt: Date;

    constructor(
        canvasId: string,
        type: ObjectType,
        position: Position,
        options?: {
            rotation?: number;
            zIndex?: number;
            locked?: boolean;
            visible?: boolean;
            opacity?: number;
        }
    ) {
        this.id = crypto.randomUUID();
        this.canvasId = canvasId;
        this.type = type;
        this.position = position;
        this.rotation = options?.rotation || 0;
        this.zIndex = options?.zIndex || 0;
        this.locked = options?.locked || false;
        this.visible = options?.visible || true;
        this.opacity = options?.opacity || 1;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Helper functions
    move(x: number, y: number): void {
        this.position = { x, y };
        this.updatedAt = new Date();
    }

    rotate(degrees: number): void {
        this.rotation = degrees;
        this.updatedAt = new Date();
    }

    setZIndex(index: number): void {
        this.zIndex = index;
        this.updatedAt = new Date();
    }

    toggleLock(): void {
        this.locked = !this.locked;
        this.updatedAt = new Date();
    }

    toggleVisibility(): void {
        this.visible = !this.visible;
        this.updatedAt = new Date();
    }

    setOpacity(opacity: number): void {
        this.opacity = Math.max(0, Math.min(1, opacity));
        this.updatedAt = new Date();
    }
}

export class Rectangle extends CanvasObject {
    size: Size;
    fill: string;
    stroke: string;
    strokeWidth: number;
    cornerRadius: number;

    constructor(
        canvasId: string,
        position: Position,
        size: Size,
        options?: {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            cornerRadius: number;
            rotation?: number;
            zIndex?: number;
        }
    ) {
        super(canvasId, 'rectangle', position, options);
        this.size = size;
        this.fill = options?.fill || '#ffffff';
        this.stroke = options?.stroke || '#000000';
        this.strokeWidth = options?.strokeWidth || 2;
        this.cornerRadius = options?.cornerRadius || 0;
    }

    // Helper functions
    resize(width: number, height: number): void {
        this.size = { width, height };
        this.updatedAt = new Date();
    }

    setFill(color: string): void {
        this.fill = color;
        this.updatedAt = new Date();
    }

    setStroke(color: string, width?: number): void {
        this.stroke = color;
        if (width !== undefined) {
            this.strokeWidth = width;
        }
        this.updatedAt = new Date();
    }

    setCornerRadius(radius: number): void {
        this.cornerRadius = radius;
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            type: this.type,
            position: this.position,
            rotation: this.rotation,
            zIndex: this.zIndex,
            locked: this.locked,
            visible: this.visible,
            opacity: this.opacity,
            size: this.size,
            fill: this.fill,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth,
            cornerRadius: this.cornerRadius,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export class Circle extends CanvasObject {
    radius: number;
    fill: string;
    stroke: string;
    strokeWidth: number;

    constructor(
        canvasId: string,
        position: Position,
        radius: number,
        options?: {
            fill?: string;
            stroke?: string;
            strokeWidth?: number;
            rotation?: number;
            zIndex?: number;
        } 
    ) {
        super(canvasId, 'circle', position, options);
        this.radius = radius;
        this.fill = options?.fill || '#ffffff';
        this.stroke = options?.stroke || '#000000';
        this.strokeWidth = options?.strokeWidth || 2;
    }

    // Helper functions
    setRadius(radius: number): void {
        this.radius = radius;
        this.updatedAt = new Date();
    }

    setFill(color: string): void {
        this.fill = color;
        this.updatedAt = new Date();
    }

    setStroke(color: string, width?: number): void {
        this.stroke = color;
        if (width !== undefined) {
            this.strokeWidth = width;
        }
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            type: this.type,
            position: this.position,
            rotation: this.rotation,
            zIndex: this.zIndex,
            locked: this.locked,
            visible: this.visible,
            opacity: this.opacity,
            radius: this.radius,
            fill: this.fill,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export class Text extends CanvasObject {
    content: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle: 'normal' | 'italic';
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    textDecoration: 'none' | 'underline' | 'line-through';
    lineHeight: number;
    maxWidth?: number;
    backgroundColor?: string;

    constructor(
        canvasId: string,
        position: Position,
        content: string,
        options?: {
            fontSize?: number;
            fontFamily?: string;
            fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
            fontStyle?: 'normal' | 'italic';
            color?: string;
            textAlign?: 'left' | 'center' | 'right' | 'justify';
            textDecoration?: 'none' | 'underline' | 'line-through';
            lineHeight?: number;
            maxWidth?: number;
            backgroundColor?: string;
            rotation?: number;
            zIndex?: number;
        }
    ) {
        super(canvasId, 'text', position, options);
        this.content = content;
        this.fontSize = options?.fontSize || 16;
        this.fontFamily = options?.fontFamily || 'Arial, sans-serif';
        this.fontWeight = options?.fontWeight || 'normal';
        this.fontStyle = options?.fontStyle || 'normal';
        this.color = options?.color || '#000000';
        this.textAlign = options?.textAlign || 'left';
        this.textDecoration = options?.textDecoration || 'none';
        this.lineHeight = options?.lineHeight || 1.5;
        this.maxWidth = options?.maxWidth;
        this.backgroundColor = options?.backgroundColor;
    }

    updateContent(newContent: string): void {
        this.content = newContent;
        this.updatedAt = new Date();
    }

    setFontSize(size: number): void {
        this.fontSize = size;
        this.updatedAt = new Date();
    }

    setColor(color: string): void {
        this.color = color;
        this.updatedAt = new Date();
    }

    setBold(bold: boolean): void {
        this.fontWeight = bold ? 'bold' : 'normal';
        this.updatedAt = new Date();
    }

    setItalic(italic: boolean): void {
        this.fontStyle = italic ? 'italic' : 'normal';
        this.updatedAt = new Date();
    }

    setAlignment(align: 'left' | 'center' | 'right' | 'justify'): void {
        this.textAlign = align;
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            type: this.type,
            position: this.position,
            rotation: this.rotation,
            zIndex: this.zIndex,
            locked: this.locked,
            visible: this.visible,
            opacity: this.opacity,
            content: this.content,
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            fontWeight: this.fontWeight,
            fontStyle: this.fontStyle,
            color: this.color,
            textAlign: this.textAlign,
            textDecoration: this.textDecoration,
            lineHeight: this.lineHeight,
            maxWidth: this.maxWidth,
            backgroundColor: this.backgroundColor,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
    }
}

export class Image extends CanvasObject {
    size: Size;
    src: string;
    alt?: string;
    cornerRadius: number;
    filters?: {
        brightness?: number;
        contrast?: number;
        blur?: number;
        grayscale?: boolean;
    }

    constructor(
        canvasId: string,
        position: Position,
        size: Size,
        src: string,
        options?: {
            alt?: string;
            cornerRadius?: number;
            filters?: {
                brightness?: number;
                contrast?: number;
                blur?: number;
                grayscale?: boolean;
            };
            rotation?: number;
            zIndex?: number;
        }
    ) {
        super(canvasId, 'image', position, options);
        this.size = size;
        this.src = src;
        this.alt = options?.alt;
        this.cornerRadius = options?.cornerRadius || 0;
        this.filters = options?.filters;
    }

    // Helper functions
    resize(width: number, height: number): void {
        this.size = {
            width,
            height
        };
        this.updatedAt = new Date();
    }

    updateSrc(newSrc: string): void {
        this.src = newSrc;
        this.updatedAt = new Date();
    }

    setFilters(filters: {
        brightness?: number;
        contrast?: number;
        blur?: number;
        grayscale?: boolean;
    }): void {
        this.filters = { ...this.filters, ...filters };
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            type: this.type,
            position: this.position,
            rotation: this.rotation,
            zIndex: this.zIndex,
            locked: this.locked,
            visible: this.visible,
            opacity: this.opacity,
            size: this.size,
            src: this.src,
            alt: this.alt,
            cornerRadius: this.cornerRadius,
            filters: this.filters,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }
}

