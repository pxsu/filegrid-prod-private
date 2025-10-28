// lib/services/VersionService.ts

import { Version, VersionType } from '@/lib/models/Version';
import { Canvas } from '@/lib/models/Canvas';

export class VersionService {
    // Create a new version
    static async createVersion(
        canvas: Canvas,
        createdBy: string,
        options?: {
            type?: VersionType;
            description?: string;
            thumbnail?: string;
        }
    ): Promise<Version> {
        const version = new Version(canvas.id, canvas.data, createdBy, options);

        // TODO: Save to database
        // await db.version.create({ data: version.toJSON() });

        return version;
    }

    // Get version by ID
    static async getVersionById(id: string): Promise<Version | null> {
        // TODO: Fetch from database
        // const data = await db.version.findUnique({ where: { id } });
        // if (!data) return null;
        // return Version.fromJSON(data);

        return null;
    }

    // Get all versions for a canvas
    static async getVersionsByCanvas(canvasId: string): Promise<Version[]> {
        // TODO: Fetch from database
        // const data = await db.version.findMany({
        //   where: { canvasId },
        //   orderBy: { createdAt: 'desc' }
        // });
        // return data.map(d => Version.fromJSON(d));

        return [];
    }

    // Get manual saves only
    static async getManualSaves(canvasId: string): Promise<Version[]> {
        // TODO: Fetch from database
        // const data = await db.version.findMany({
        //   where: { canvasId, type: 'manual' },
        //   orderBy: { createdAt: 'desc' }
        // });
        // return data.map(d => Version.fromJSON(d));

        return [];
    }

    // Get latest version
    static async getLatestVersion(canvasId: string): Promise<Version | null> {
        // TODO: Fetch from database
        // const data = await db.version.findFirst({
        //   where: { canvasId },
        //   orderBy: { createdAt: 'desc' }
        // });
        // if (!data) return null;
        // return Version.fromJSON(data);

        return null;
    }

    // Restore canvas to a version
    static async restoreVersion(
        canvas: Canvas,
        versionId: string
    ): Promise<Canvas> {
        const version = await this.getVersionById(versionId);
        if (!version) {
            throw new Error('Version not found');
        }

        // Update canvas data with version data
        canvas.data = version.data;
        canvas.updatedAt = new Date();

        // Mark version as restored
        version.markAsRestored();
        await this.updateVersion(version);

        // TODO: Save canvas to database
        // await CanvasService.updateCanvas(canvas);

        return canvas;
    }

    // Update version
    static async updateVersion(version: Version): Promise<Version> {
        // TODO: Save to database
        // await db.version.update({
        //   where: { id: version.id },
        //   data: version.toJSON()
        // });

        return version;
    }

    // Update version description
    static async updateVersionDescription(
        version: Version,
        description: string
    ): Promise<Version> {
        version.updateDescription(description);
        return await this.updateVersion(version);
    }

    // Delete version
    static async deleteVersion(versionId: string): Promise<void> {
        // TODO: Delete from database
        // await db.version.delete({ where: { id: versionId } });
    }

    // Auto-save (create auto version)
    static async autoSave(canvas: Canvas, userId: string): Promise<Version> {
        return await this.createVersion(canvas, userId, {
            type: 'auto',
            description: 'Auto-save',
        });
    }

    // Manual save (create manual version)
    static async manualSave(
        canvas: Canvas,
        userId: string,
        description?: string
    ): Promise<Version> {
        return await this.createVersion(canvas, userId, {
            type: 'manual',
            description: description || 'Manual save',
        });
    }

    // Create checkpoint
    static async createCheckpoint(
        canvas: Canvas,
        userId: string,
        description: string
    ): Promise<Version> {
        return await this.createVersion(canvas, userId, {
            type: 'checkpoint',
            description,
        });
    }

    // Clean up old auto-saves (keep only recent ones)
    static async cleanupOldAutoSaves(
        canvasId: string,
        keepCount: number = 10
    ): Promise<void> {
        // TODO: Implement cleanup logic
        // const autoSaves = await db.version.findMany({
        //   where: { canvasId, type: 'auto' },
        //   orderBy: { createdAt: 'desc' },
        //   skip: keepCount
        // });
        // 
        // for (const save of autoSaves) {
        //   await this.deleteVersion(save.id);
        // }
    }
}