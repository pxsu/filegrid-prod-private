// lib/models/Canvas.ts

// Main data model
export type CanvasData = {
    objects: any[]; // Replace with CanvasObject[], once ready
    viewport: {
        x: number;
        y: number;
        zoom: number;
    }
}

export class Canvas {
    id: string;
    slug: string;
    title: string;
    data: CanvasData;
    ownerId?: string;
    createdAt: Date;
    updatedAt: Date;
    isPublic: boolean;
    thumbnail?: string;

    constructor(
        slug: string,
        data?: CanvasData,
        options?: {
            title?: string;
            ownerId?: string;
            isPublic?: boolean;
            thumbnail?: string;
        }
    ) {
        this.id = crypto.randomUUID();
        this.slug = slug;
        this.title = options?.title || "Untitled";
        this.data = data || {
            objects: [],
            viewport: { x: 0, y: 0, zoom: 1 }
        };
        this.ownerId = options?.ownerId;
        this.isPublic = options?.isPublic || false;
        this.thumbnail = options?.thumbnail;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Helper functions
    updateTitle(newTitle: string): void {
        this.title = newTitle;
        this.updatedAt = new Date();
    }

    addObject(object: any): void {
        this.data.objects.push(object)
        this.updatedAt = new Date();
    }

    removeObject(objectId: string): void {
        this.data.objects = this.data.objects.filter(obj => obj.id !== objectId);
        this.updatedAt = new Date();
    }

    updateViewport(x: number, y: number, zoom: number): void {
        this.data.viewport = { x, y, zoom };
        this.updatedAt = new Date();
    }

    setThumbnail(thumbnailUrl: string): void {
        this.thumbnail = thumbnailUrl;
        this.updatedAt = new Date();
    }

    togglePublic(): void {
        this.isPublic = !this.isPublic;
        this.updatedAt = new Date();
    }

    toJSON() {
        return {
            id: this.id,
            slug: this.slug,
            title: this.title,
            data: this.data,
            ownerId: this.ownerId || null,
            isPublic: this.isPublic,
            thumbnail: this.thumbnail || null,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }

    static fromJSON(json: any): Canvas {
        const canvas = new Canvas(json.slug, json.data, {
            title: json.title,
            ownerId: json.ownerId,
            isPublic: json.isPublic,
            thumbnail: json.thumbnail,
        });
        canvas.id = json.id;

        // Handle both Date objects and Firebase Timestamps
        canvas.createdAt = json.createdAt?.toDate ? json.createdAt.toDate() : new Date(json.createdAt);
        canvas.updatedAt = json.updatedAt?.toDate ? json.updatedAt.toDate() : new Date(json.updatedAt);

        return canvas;
    }
}