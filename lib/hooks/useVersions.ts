// lib/hooks/useVersions.ts

'use client';

import { useState, useEffect } from 'react';
import { Version, VersionType } from '@/lib/models/Version';
import { VersionService } from '@/lib/services/VersionService';
import { Canvas } from '@/lib/models/Canvas';

export function useVersions(canvasId?: string) {
    const [versions, setVersions] = useState<Version[]>([]);
    const [manualSaves, setManualSaves] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasId) {
            setLoading(false);
            return;
        }

        loadVersions();
    }, [canvasId]);

    const loadVersions = async () => {
        if (!canvasId) return;

        try {
            setLoading(true);
            setError(null);
            const allVersions = await VersionService.getVersionsByCanvas(canvasId);
            const manual = await VersionService.getManualSaves(canvasId);
            setVersions(allVersions);
            setManualSaves(manual);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load versions');
        } finally {
            setLoading(false);
        }
    };

    const createVersion = async (
        canvas: Canvas,
        createdBy: string,
        options?: {
            type?: VersionType;
            description?: string;
            thumbnail?: string;
        }
    ) => {
        try {
            setError(null);
            const version = await VersionService.createVersion(canvas, createdBy, options);
            setVersions([version, ...versions]);
            if (options?.type === 'manual') {
                setManualSaves([version, ...manualSaves]);
            }
            return version;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create version');
            return null;
        }
    };

    const autoSave = async (canvas: Canvas, userId: string) => {
        try {
            const version = await VersionService.autoSave(canvas, userId);
            setVersions([version, ...versions]);
            return version;
        } catch (err) {
            console.error('Auto-save failed:', err);
            return null;
        }
    };

    const manualSave = async (
        canvas: Canvas,
        userId: string,
        description?: string
    ) => {
        try {
            setError(null);
            const version = await VersionService.manualSave(canvas, userId, description);
            setVersions([version, ...versions]);
            setManualSaves([version, ...manualSaves]);
            return version;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save');
            return null;
        }
    };

    const restoreVersion = async (canvas: Canvas, versionId: string) => {
        try {
            setError(null);
            const restoredCanvas = await VersionService.restoreVersion(canvas, versionId);
            await loadVersions(); // Reload to update restored flag
            return restoredCanvas;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to restore version');
            return null;
        }
    };

    const updateDescription = async (version: Version, description: string) => {
        try {
            setError(null);
            const updated = await VersionService.updateVersionDescription(version, description);
            setVersions(versions.map(v => v.id === updated.id ? updated : v));
            setManualSaves(manualSaves.map(v => v.id === updated.id ? updated : v));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update description');
            return null;
        }
    };

    const deleteVersion = async (versionId: string) => {
        try {
            setError(null);
            await VersionService.deleteVersion(versionId);
            setVersions(versions.filter(v => v.id !== versionId));
            setManualSaves(manualSaves.filter(v => v.id !== versionId));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete version');
        }
    };

    return {
        versions,
        manualSaves,
        loading,
        error,
        loadVersions,
        createVersion,
        autoSave,
        manualSave,
        restoreVersion,
        updateDescription,
        deleteVersion,
    };
}