// lib/services/UserService.ts

import { User, UserRole, UserPreference } from '@/lib/models/User';

export class UserService {
    // Create a new user
    static async createUser(
        email: string,
        name: string,
        options?: {
            username?: string;
            avatar?: string;
            role?: UserRole;
        }
    ): Promise<User> {
        const user = new User(email, name, options);

        // TODO: Save to database
        // await db.user.create({ data: user.toJSON() });

        return user;
    }

    // Get user by ID
    static async getUserById(id: string): Promise<User | null> {
        // TODO: Fetch from database
        // const data = await db.user.findUnique({ where: { id } });
        // if (!data) return null;
        // return User.fromJSON(data);

        return null;
    }

    // Get user by email
    static async getUserByEmail(email: string): Promise<User | null> {
        // TODO: Fetch from database
        // const data = await db.user.findUnique({ where: { email } });
        // if (!data) return null;
        // return User.fromJSON(data);

        return null;
    }

    // Get user by username
    static async getUserByUsername(username: string): Promise<User | null> {
        // TODO: Fetch from database
        // const data = await db.user.findUnique({ where: { username } });
        // if (!data) return null;
        // return User.fromJSON(data);

        return null;
    }

    // Update user
    static async updateUser(user: User): Promise<User> {
        user.updatedAt = new Date();

        // TODO: Save to database
        // await db.user.update({
        //   where: { id: user.id },
        //   data: user.toJSON()
        // });

        return user;
    }

    // Update user profile
    static async updateUserProfile(
        user: User,
        data: {
            name?: string;
            username?: string;
            avatar?: string;
        }
    ): Promise<User> {
        user.updateProfile(data);
        return await this.updateUser(user);
    }

    // Update user preferences
    static async updateUserPreferences(
        user: User,
        preferences: Partial<UserPreference>
    ): Promise<User> {
        user.updatePreferences(preferences);
        return await this.updateUser(user);
    }

    // Verify user email
    static async verifyUser(user: User): Promise<User> {
        user.verify();
        return await this.updateUser(user);
    }

    // Record user login
    static async recordLogin(user: User): Promise<User> {
        user.recordLogin();
        return await this.updateUser(user);
    }

    // Change user role
    static async changeUserRole(user: User, newRole: UserRole): Promise<User> {
        user.changeRole(newRole);
        return await this.updateUser(user);
    }

    // Deactivate user
    static async deactivateUser(user: User): Promise<User> {
        user.deactivate();
        return await this.updateUser(user);
    }

    // Reactivate user
    static async reactivateUser(user: User): Promise<User> {
        user.reactivate();
        return await this.updateUser(user);
    }

    // Delete user
    static async deleteUser(userId: string): Promise<void> {
        // TODO: Delete from database
        // await db.user.delete({ where: { id: userId } });
    }

    // Check if email exists
    static async emailExists(email: string): Promise<boolean> {
        const user = await this.getUserByEmail(email);
        return user !== null;
    }

    // Check if username exists
    static async usernameExists(username: string): Promise<boolean> {
        const user = await this.getUserByUsername(username);
        return user !== null;
    }
}