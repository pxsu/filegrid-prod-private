// lib/hooks/useUser.ts

'use client';

import { useState, useEffect } from 'react';
import { User, UserPreference } from '@/lib/models/User';
import { UserService } from '@/lib/services/UserService';

export function useUser(userId?: string) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        loadUser();
    }, [userId]);

    const loadUser = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await UserService.getUserById(userId);
            setUser(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data: {
        name?: string;
        username?: string;
        avatar?: string;
    }) => {
        if (!user) return null;

        try {
            setError(null);
            const updated = await UserService.updateUserProfile(user, data);
            setUser(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
            return null;
        }
    };

    const updatePreferences = async (preferences: Partial<UserPreference>) => {
        if (!user) return null;

        try {
            setError(null);
            const updated = await UserService.updateUserPreferences(user, preferences);
            setUser(updated);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update preferences');
            return null;
        }
    };

    const recordLogin = async () => {
        if (!user) return null;

        try {
            const updated = await UserService.recordLogin(user);
            setUser(updated);
            return updated;
        } catch (err) {
            console.error('Failed to record login:', err);
            return null;
        }
    };

    return {
        user,
        loading,
        error,
        loadUser,
        updateProfile,
        updatePreferences,
        recordLogin,
    };
}