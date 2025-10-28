// lib/models/Comments.ts

export type CommentStatus = 'open' | 'resolved' | 'deleted';

export type CommentReply = {
    id: string;
    userId: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    isEdited: boolean;
};

export class Comment {
    id: string;
    canvasId: string;
    objectId?: string;
    userId: string;
    content: string;
    position?: { x: number; y: number };
    status: CommentStatus;
    replies: CommentReply[];
    mentions: string[];
    createdAt: Date;
    updatedAt: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
    isEdited: boolean;

    constructor(
        canvasId: string,
        userId: string,
        content: string,
        options?: {
            objectId?: string;
            position?: { x: number; y: number };
            mentions?: string[];
        }
    ) {
        this.id = crypto.randomUUID();
        this.canvasId = canvasId;
        this.objectId = options?.objectId;
        this.userId = userId;
        this.content = content;
        this.position = options?.position;
        this.status = 'open';
        this.replies = [];
        this.mentions = options?.mentions || [];
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.isEdited = false;
    }

    // Helper functions
    updateContent(newContent: string, mentions?: string[]): void {
        this.content = newContent;
        if (mentions) {
            this.mentions = mentions;
        }
        this.isEdited = true;
        this.updatedAt = new Date();
    }

    addReply(userId: string, content: string): CommentReply {
        const reply: CommentReply = {
            id: crypto.randomUUID(),
            userId,
            content,
            createdAt: new Date(),
            updatedAt: new Date(),
            isEdited: false,
        };
        this.replies.push(reply);
        this.updatedAt = new Date();
        return reply;
    }

    updateReply(replyId: string, newContent: string): void {
        const reply = this.replies.find(r => r.id === replyId);
        if (reply) {
            reply.content = newContent;
            reply.isEdited = true;
            reply.updatedAt = new Date();
            this.updatedAt = new Date();
        }
    }

    deleteReply(replyId: string): void {
        this.replies = this.replies.filter(r => r.id !== replyId);
        this.updatedAt = new Date();
    }

    resolve(resolvedBy: string): void {
        this.status = 'resolved';
        this.resolvedAt = new Date();
        this.resolvedBy = resolvedBy;
        this.updatedAt = new Date();
    }

    reopen(): void {
        this.status = 'open';
        this.resolvedAt = undefined;
        this.resolvedBy = undefined;
        this.updatedAt = new Date();
    }

    markAsDeleted(): void {
        this.status = 'deleted';
        this.updatedAt = new Date();
    }

    updatePosition(x: number, y: number): void {
        this.position = { x, y };
        this.updatedAt = new Date();
    }

    attachToObject(objectId: string): void {
        this.objectId = objectId;
        this.position = undefined;
        this.updatedAt = new Date();
    }

    detachFromObject(x: number, y: number): void {
        this.objectId = undefined;
        this.position = { x, y };
        this.updatedAt = new Date();
    }

    isResolved(): boolean {
        return this.status === 'resolved';
    }

    isOpen(): boolean {
        return this.status === 'open';
    }

    isDeleted(): boolean {
        return this.status === 'deleted';
    }

    isAttachedToObject(): boolean {
        return this.objectId !== undefined;
    }

    getReplyCount(): number {
        return this.replies.length;
    }

    getAgeString(): string {
        const ageMs = Date.now() - this.createdAt.getTime();
        const seconds = Math.floor(ageMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        return 'just now';
    }

    toJSON() {
        return {
            id: this.id,
            canvasId: this.canvasId,
            objectId: this.objectId,
            userId: this.userId,
            content: this.content,
            position: this.position,
            status: this.status,
            replies: this.replies,
            mentions: this.mentions,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            resolvedAt: this.resolvedAt,
            resolvedBy: this.resolvedBy,
            isEdited: this.isEdited,
        };
    }

    static fromJSON(json: any): Comment {
        const comment = new Comment(json.canvasId, json.userId, json.content, {
            objectId: json.objectId,
            position: json.position,
            mentions: json.mentions,
        });
        comment.id = json.id;
        comment.status = json.status;
        comment.replies = json.replies || [];
        comment.createdAt = new Date(json.createdAt);
        comment.updatedAt = new Date(json.updatedAt);
        comment.resolvedAt = json.resolvedAt ? new Date(json.resolvedAt) : undefined;
        comment.resolvedBy = json.resolvedBy;
        comment.isEdited = json.isEdited;
        return comment;
    }
}
