// lib/models/Assets.ts

export type AssetType = 'image' | 'video' | 'audio' | 'document' | 'other';

export type AssetStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';

export class Asset {
    id: string;
    canvasId: string;
    url: string;
    filename: string;
    originalFilename: string;
    filesize: number;
    mimeType: string;
    type: AssetType;
    status: AssetStatus;
    uploadedBy: string;
    width?: number;
    height?: number;
    duration?: number;
    thumbnail?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    usageCount: number;
    storageProvider: string;
    storagePath: string;

    constructor(
        canvasId: string,
        url: string,
        filename: string,
        originalFilename: string,
        filesize: number,
        mimeType: string,
        uploadedBy: string,
        storageProvider: string,
        storagePath: string,
        options?: {
            width?: number;
            height?: number;
            duration?: number;
            thumbnail?: string;
            metadata?: Record<string, any>;
        }
    ) {
        this.id = crypto.randomUUID();
        this.canvasId = canvasId;
        this.url = url;
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.filesize = filesize;
        this.mimeType = mimeType;
        this.type = this.determineAssetType(mimeType);
        this.status = 'uploading';
        this.uploadedBy = uploadedBy;
        this.width = options?.width;
        this.height = options?.height;
        this.duration = options?.duration;
        this.thumbnail = options?.thumbnail;
        this.metadata = options?.metadata;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.usageCount = 0;
        this.storageProvider = storageProvider;
        this.storagePath = storagePath;
    }

    private determineAssetType(mimeType: string): AssetType {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('video/')) return 'video';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (
            mimeType.includes('pdf') ||
            mimeType.includes('document') ||
            mimeType.includes('text')
        ) {
            return 'document';
        }
        return 'other';
    }

    setStatus(status: AssetStatus): void {
        this.status = status;
        this.updatedAt = new Date();
    }

    markAsReady(): void {
        this.status = 'ready';
        this.updatedAt = new Date();
    }

    markAsFailed(): void {
        this.status = 'failed';
        this.updatedAt = new Date();
    }

    markAsDeleted(): void {
        this.status = 'deleted';
        this.updatedAt = new Date();
    }

    updateUrl(newUrl: string): void {
        this.url = newUrl;
        this.updatedAt = new Date();
    }

    setDimensions(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.updatedAt = new Date();
    }

    setDuration(duration: number): void {
        this.duration = duration;
        this.updatedAt = new Date();
    }

    setThumbnail(thumbnailUrl: string): void {
        this.thumbnail = thumbnailUrl;
        this.updatedAt = new Date();
    }

    updateMetadata(metadata: Record<string, any>): void {
        this.metadata = { ...this.metadata, ...metadata };
        this.updatedAt = new Date();
    }

    incrementUsage(): void {
        this.usageCount++;
        this.updatedAt = new Date();
    }

    decrementUsage(): void {
        if (this.usageCount > 0) {
            this.usageCount--;
            this.updatedAt = new Date();
        }
    }

    getFilesizeString(): string {
        const kb = this.filesize / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;

        if (gb >= 1) return `${gb.toFixed(2)} GB`;
        if (mb >= 1) return `${mb.toFixed(2)} MB`;
        if (kb >= 1) return `${kb.toFixed(2)} KB`;
        return `${this.filesize} bytes`;
    }

    getExtension(): string {
        const parts = this.originalFilename.split('.');
        return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
    }

    isImage(): boolean {
        return this.type === 'image';
    }

    isVideo(): boolean {
        return this.type === 'video';
    }

    isAudio(): boolean {
        return this.type === 'audio';
    }

    isDocument(): boolean {
        return this.type === 'document';
    }

    isReady(): boolean {
        return this.status === 'ready';
    }

    isUploading(): boolean {
        return this.status === 'uploading';
    }

    isProcessing(): boolean {
        return this.status === 'processing';
    }

    hasFailed(): boolean {
        return this.status === 'failed';
    }

    isDeleted(): boolean {
        return this.status === 'deleted';
    }

    isInUse(): boolean {
        return this.usageCount > 0;
    }

    getAspectRatio(): number | null {
        if (this.width && this.height) {
            return this.width / this.height;
        }
        return null;
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            url: this.url,
            filename: this.filename,
            originalFilename: this.originalFilename,
            filesize: this.filesize,
            mimeType: this.mimeType,
            type: this.type,
            status: this.status,
            uploadedBy: this.uploadedBy,
            width: this.width,
            height: this.height,
            duration: this.duration,
            thumbnail: this.thumbnail,
            metadata: this.metadata,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            usageCount: this.usageCount,
            storageProvider: this.storageProvider,
            storagePath: this.storagePath,
        };
    }

    // Create from JSON (when loading from database)
    static fromJSON(json: any): Asset {
        const asset = new Asset(
            json.canvasId,
            json.url,
            json.filename,
            json.originalFilename,
            json.filesize,
            json.mimeType,
            json.uploadedBy,
            json.storageProvider,
            json.storagePath,
            {
                width: json.width,
                height: json.height,
                duration: json.duration,
                thumbnail: json.thumbnail,
                metadata: json.metadata,
            }
        );
        asset.id = json.id;
        asset.status = json.status;
        asset.createdAt = new Date(json.createdAt);
        asset.updatedAt = new Date(json.updatedAt);
        asset.usageCount = json.usageCount;
        return asset;
    }
}