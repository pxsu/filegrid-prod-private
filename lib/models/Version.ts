// lib/models/Version.ts

export type VersionType = 'manual' | 'auto' | 'checkpoint';

export class Version {
    id: string;
    canvasId: string;
    data: any;
    type: VersionType;
    description?: string;
    createdBy: string;
    createdAt: Date;
    thumbnail?: string;
    objectCount: number;
    isRestored: boolean;

    constructor(
        canvasId: string,
        data: any,
        createdBy: string,
        options?: {
            type?: VersionType;
            description?: string;
            thumbnail?: string;
        }
    ) {
        this.id = crypto.randomUUID();
        this.canvasId = canvasId;
        this.data = data;
        this.type = options?.type || 'auto';
        this.description = options?.description;
        this.createdBy = createdBy;
        this.createdAt = new Date();
        this.thumbnail = options?.thumbnail;
        this.objectCount = data?.objects?.length || 0;
        this.isRestored = false;
    }

    updateDescription(newDescription: string): void {
        this.description = newDescription;
    }

    setThumbnail(thumbnailUrl: string): void {
        this.thumbnail = thumbnailUrl;
    }

    markAsRestored(): void {
        this.isRestored = true;
    }

    getAge(): number {
        return Date.now() - this.createdAt.getTime();
    }

    getAgeString(): string {
        const ageMs = this.getAge();
        const seconds = Math.floor(ageMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;

        return 'just now';
    }

    isManualSave(): boolean {
        return this.type === 'manual';
    }

    isAutoSave(): boolean {
        return this.type === 'auto';
    }

    isCheckpoint(): boolean {
        return this.type === 'checkpoint';
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            data: this.data,
            type: this.type,
            description: this.description,
            createdBy: this.createdBy,
            createdAt: this.thumbnail,
            objectCount: this.objectCount,
            isRestored: this.isRestored,
        };
    }

    static fromJSON(json: any): Version {
        const version = new Version(json.canvasId, json.data, json.createdBy, {
            type: json.type,
            description: json.description,
            thumbnail: json.thumbnail,
        });
        version.id = json.id;
        version.createdAt = new Date(json.createdAt);
        version.objectCount = json.objectCount;
        version.isRestored = json.isRestored;
        return version;
    }
}