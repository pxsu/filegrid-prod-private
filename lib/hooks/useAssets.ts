// lib/hooks/useAssets.ts

'use client';

import { useState, useEffect } from 'react';
import { Asset, AssetType } from '@/lib/models/Asset';
import { AssetService } from '@/lib/services/AssetService';

export function useAssets(canvasId?: string) {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [images, setImages] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!canvasId) {
            setLoading(false);
            return;
        }

        loadAssets();
    }, [canvasId]);

    const loadAssets = async () => {
        if (!canvasId) return;

        try {
            setLoading(true);
            setError(null);
            const all = await AssetService.getAssetsByCanvas(canvasId);
            const imgs = await AssetService.getImages(canvasId);
            setAssets(all);
            setImages(imgs);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load assets');
        } finally {
            setLoading(false);
        }
    };

    const uploadAsset = async (file: File, uploadedBy: string) => {
        if (!canvasId) return null;

        try {
            setUploading(true);
            setError(null);
            const asset = await AssetService.uploadAsset(canvasId, file, uploadedBy);
            setAssets([asset, ...assets]);
            if (asset.isImage()) {
                setImages([asset, ...images]);
            }
            return asset;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload asset');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const deleteAsset = async (asset: Asset) => {
        try {
            setError(null);
            await AssetService.deleteAsset(asset);
            setAssets(assets.filter(a => a.id !== asset.id));
            setImages(images.filter(a => a.id !== asset.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete asset');
        }
    };

    const incrementUsage = async (asset: Asset) => {
        try {
            const updated = await AssetService.incrementUsage(asset);
            setAssets(assets.map(a => a.id === updated.id ? updated : a));
            setImages(images.map(a => a.id === updated.id ? updated : a));
            return updated;
        } catch (err) {
            console.error('Failed to increment usage:', err);
            return null;
        }
    };

    const decrementUsage = async (asset: Asset) => {
        try {
            const updated = await AssetService.decrementUsage(asset);
            setAssets(assets.map(a => a.id === updated.id ? updated : a));
            setImages(images.map(a => a.id === updated.id ? updated : a));
            return updated;
        } catch (err) {
            console.error('Failed to decrement usage:', err);
            return null;
        }
    };

    return {
        assets,
        images,
        loading,
        uploading,
        error,
        loadAssets,
        uploadAsset,
        deleteAsset,
        incrementUsage,
        decrementUsage,
    };
}