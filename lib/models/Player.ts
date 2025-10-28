// lib/models/Player.ts

export type PlayerRole = 'owner' | 'editor' | 'viewer';

export type PlayerStatus = 'active' | 'idle' | 'offline';

export type CursorPosition = {
    x: number;
    y: number;
}

export class Player {
    id: string;
    canvasId: string;
    userId: string;
    role: PlayerRole;
    status: PlayerStatus;
    cursorPosition?: CursorPosition;
    selectedObjectIds: string[];
    color: string;
    invitedAt: Date;
    lastActiveAt: Date;
    joinedAt?: Date;
    leftAt?: Date;

    constructor(
        canvasId: string,
        userId: string,
        role: PlayerRole,
        options?: {
            color?: string;
            status?: PlayerStatus;
        }
    ) {
        this.id = crypto.randomUUID();
        this.canvasId = canvasId;
        this.userId = userId;
        this.role = role;
        this.status = options?.status || 'offline';
        this.selectedObjectIds = [];
        this.color = options?.color || this.generateRandomColor();
        this.invitedAt = new Date();
        this.lastActiveAt = new Date();
    }

    private generateRandomColor(): string {
        const colors = [
            '#3b82f6', // blue
            '#ef4444', // red
            '#10b981', // green
            '#f59e0b', // yellow
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#f97316', // orange
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateRole(newRole: PlayerRole): void {
        this.role = newRole;
        this.lastActiveAt = new Date();
    }

    updateCursor(x: number, y: number): void {
        this.cursorPosition = { x, y };
        this.lastActiveAt = new Date();
    }

    clearCursor(): void {
        this.cursorPosition = undefined;
        this.lastActiveAt = new Date();
    }

    selectObjects(objectIds: string[]): void {
        this.selectedObjectIds = objectIds;
        this.lastActiveAt = new Date();
    }

    addToSelection(objectId: string): void {
        if (!this.selectedObjectIds.includes(objectId)) {
            this.selectedObjectIds.push(objectId);
            this.lastActiveAt = new Date();
        }
    }

    removeFromSelection(objectId: string): void {
        this.selectedObjectIds = this.selectedObjectIds.filter(id => id !== objectId);
        this.lastActiveAt = new Date();
    }

    clearSelection(): void {
        this.selectedObjectIds = [];
        this.lastActiveAt = new Date();
    }

    setStatus(status: PlayerStatus): void {
        this.status = status;
        this.lastActiveAt = new Date();
    }

    join(): void {
        this.joinedAt = new Date();
        this.status = 'active';
        this.lastActiveAt = new Date();
    }

    leave(): void {
        this.leftAt = new Date();
        this.status = 'offline';
        this.cursorPosition = undefined;
        this.selectedObjectIds = [];
        this.lastActiveAt = new Date();
    }

    updateActivity(): void {
        this.lastActiveAt = new Date();
        if (this.status !== 'active') {
            this.status = 'active';
        }
    }

    canEdit(): boolean {
        return this.role === 'owner' || this.role === 'editor';
    }

    isOwner(): boolean {
        return this.role === 'owner';
    }

    isOnline(): boolean {
        return this.status === 'active' || this.status === 'idle';
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            userId: this.userId,
            role: this.role,
            status: this.status,
            cursorPosition: this.cursorPosition,
            selectedObjectIds: this.selectedObjectIds,
            color: this.color,
            invitedAt: this.invitedAt,
            lastActiveAt: this.lastActiveAt,
            joinedAt: this.joinedAt,
            leftAt: this.leftAt,
        }
    }

    static fromJSON(json: any): Player {
        const player = new Player(json.canvasId, json.userId, json.role, {
            color: json.color,
            status: json.status,
        });
        player.id = json.id;
        player.cursorPosition = json.cursorPosition;
        player.selectedObjectIds = json.selectedObjectIds || [];
        player.invitedAt = new Date(json.invitedAt);
        player.lastActiveAt = new Date(json.lastActiveAt);
        player.joinedAt = json.joinedAt ? new Date(json.joinedAt) : undefined;
        player.leftAt = json.leftAt ? new Date(json.leftAt) : undefined;
        return player;
    }
}