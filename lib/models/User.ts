// lib/models/User.ts

export type UserRole = "free" | "pro" | "admin";

// Keeping it simple for now
export type UserPreference = {
    theme: "light" | "dark" | "system";
    defaultCanvasBackground: string;
    showRulers: boolean;
    notifications: {
        email: boolean;
        browser: boolean;
    };
}

export class User {
    id: string;
    email: string;
    name: string;
    username?: string;
    avatar?: string;
    role: UserRole;
    preferences: UserPreference;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    isVerified: boolean;
    isActive: boolean;

    constructor(
        email: string,
        name: string,
        options?: {
            username?: string;
            avatar?: string;
            role?: UserRole;
            preferences?: Partial<UserPreference>;
        }
    ) {
        this.id = crypto.randomUUID();
        this.email = email;
        this.name = name;
        this.username = options?.username;
        this.avatar = options?.avatar;
        this.role = options?.role || "free";
        this.preferences = {
            theme: options?.preferences?.theme || "system",
            defaultCanvasBackground: options?.preferences?.defaultCanvasBackground || "#ffffff",
            showRulers: options?.preferences?.showRulers ?? true,
            notifications: {
                email: options?.preferences?.notifications?.email ?? true,
                browser: options?.preferences?.notifications?.browser ?? true,
            },
        };
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isVerified = false;
        this.isActive = true;
    }

    // Helper functions
    updateProfile(data: { name?: string; username?: string; avatar?: string; }): void {
        if (data.name) this.name = data.name;
        if (data.username) this.username = data.username;
        if (data.avatar) this.avatar = data.avatar;
        this.updatedAt = new Date();
    }

    updatePreferences(preferences: Partial<UserPreference>): void {
        this.preferences = {
            ...this.preferences,
            ...preferences,
            notifications: {
                ...this.preferences.notifications,
                ...preferences.notifications,
            },
        };
        this.updatedAt = new Date();
    }

    changeRole(newRole: UserRole): void {
        this.role = newRole;
        this.updatedAt = new Date();
    }

    verify(): void {
        this.isVerified = true;
        this.updatedAt = new Date();
    }

    recordLogin(): void {
        this.lastLoginAt = new Date();
        this.updatedAt = new Date();
    }

    deactivate(): void {
        this.isActive = false;
        this.updatedAt = new Date();
    }

    reactivate(): void {
        this.isActive = true;
        this.updatedAt = new Date();
    }

    hasPro(): boolean {
        return this.role === 'pro' || this.role === 'admin';
    }

    isAdmin(): boolean {
        return this.role === 'admin';
    }

    toJSON() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            username: this.username,
            avatar: this.avatar,
            role: this.role,
            preferences: this.preferences,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            lastLoginAt: this.lastLoginAt,
            isVerified: this.isVerified,
            isActive: this.isActive,
        };
    }

    static fromJSON(json: any): User {
        const user = new User(json.email, json.name, {
            username: json.username,
            avatar: json.avatar,
            role: json.role,
            preferences: json.preferences,
        });
        user.id = json.id;
        user.createdAt = new Date(json.createdAt);
        user.updatedAt = new Date(json.updatedAt);
        user.lastLoginAt = json.lastLoginAt ? new Date(json.lastLoginAt) : undefined;
        user.isVerified = json.isVerified;
        user.isActive = json.isActive;
        return user;
    }
}