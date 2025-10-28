// lib/services/CommentService.ts

import { Comment, CommentStatus, CommentReply } from '@/lib/models/Comment';

export class CommentService {
    // Create a new comment
    static async createComment(
        canvasId: string,
        userId: string,
        content: string,
        options?: {
            objectId?: string;
            position?: { x: number; y: number };
            mentions?: string[];
        }
    ): Promise<Comment> {
        const comment = new Comment(canvasId, userId, content, options);

        // TODO: Save to database
        // await db.comment.create({ data: comment.toJSON() });

        // TODO: Send notifications to mentioned users
        // if (options?.mentions) {
        //   await this.notifyMentionedUsers(comment, options.mentions);
        // }

        return comment;
    }

    // Get comment by ID
    static async getCommentById(id: string): Promise<Comment | null> {
        // TODO: Fetch from database
        // const data = await db.comment.findUnique({ where: { id } });
        // if (!data) return null;
        // return Comment.fromJSON(data);

        return null;
    }

    // Get all comments for a canvas
    static async getCommentsByCanvas(canvasId: string): Promise<Comment[]> {
        // TODO: Fetch from database
        // const data = await db.comment.findMany({
        //   where: { canvasId, status: { not: 'deleted' } },
        //   orderBy: { createdAt: 'desc' }
        // });
        // return data.map(d => Comment.fromJSON(d));

        return [];
    }

    // Get comments for a specific object
    static async getCommentsByObject(objectId: string): Promise<Comment[]> {
        // TODO: Fetch from database
        // const data = await db.comment.findMany({
        //   where: { objectId, status: { not: 'deleted' } },
        //   orderBy: { createdAt: 'asc' }
        // });
        // return data.map(d => Comment.fromJSON(d));

        return [];
    }

    // Get open comments for a canvas
    static async getOpenComments(canvasId: string): Promise<Comment[]> {
        // TODO: Fetch from database
        // const data = await db.comment.findMany({
        //   where: { canvasId, status: 'open' },
        //   orderBy: { createdAt: 'desc' }
        // });
        // return data.map(d => Comment.fromJSON(d));

        return [];
    }

    // Get resolved comments for a canvas
    static async getResolvedComments(canvasId: string): Promise<Comment[]> {
        // TODO: Fetch from database
        // const data = await db.comment.findMany({
        //   where: { canvasId, status: 'resolved' },
        //   orderBy: { resolvedAt: 'desc' }
        // });
        // return data.map(d => Comment.fromJSON(d));

        return [];
    }

    // Update comment
    static async updateComment(comment: Comment): Promise<Comment> {
        comment.updatedAt = new Date();

        // TODO: Save to database
        // await db.comment.update({
        //   where: { id: comment.id },
        //   data: comment.toJSON()
        // });

        return comment;
    }

    // Update comment content
    static async updateCommentContent(
        comment: Comment,
        newContent: string,
        mentions?: string[]
    ): Promise<Comment> {
        comment.updateContent(newContent, mentions);

        // TODO: Send notifications to newly mentioned users
        // if (mentions) {
        //   await this.notifyMentionedUsers(comment, mentions);
        // }

        return await this.updateComment(comment);
    }

    // Add reply to comment
    static async addReply(
        comment: Comment,
        userId: string,
        content: string
    ): Promise<Comment> {
        comment.addReply(userId, content);

        // TODO: Send notification to comment author
        // await this.notifyCommentAuthor(comment);

        return await this.updateComment(comment);
    }

    // Update reply
    static async updateReply(
        comment: Comment,
        replyId: string,
        newContent: string
    ): Promise<Comment> {
        comment.updateReply(replyId, newContent);
        return await this.updateComment(comment);
    }

    // Delete reply
    static async deleteReply(comment: Comment, replyId: string): Promise<Comment> {
        comment.deleteReply(replyId);
        return await this.updateComment(comment);
    }

    // Resolve comment
    static async resolveComment(
        comment: Comment,
        resolvedBy: string
    ): Promise<Comment> {
        comment.resolve(resolvedBy);

        // TODO: Send notification to comment author
        // await this.notifyCommentResolved(comment);

        return await this.updateComment(comment);
    }

    // Reopen comment
    static async reopenComment(comment: Comment): Promise<Comment> {
        comment.reopen();

        // TODO: Send notification to resolver
        // await this.notifyCommentReopened(comment);

        return await this.updateComment(comment);
    }

    // Delete comment (soft delete)
    static async deleteComment(comment: Comment): Promise<Comment> {
        comment.markAsDeleted();
        return await this.updateComment(comment);
    }

    // Permanently delete comment
    static async permanentlyDeleteComment(commentId: string): Promise<void> {
        // TODO: Delete from database
        // await db.comment.delete({ where: { id: commentId } });
    }

    // Update comment position
    static async updateCommentPosition(
        comment: Comment,
        x: number,
        y: number
    ): Promise<Comment> {
        comment.updatePosition(x, y);
        return await this.updateComment(comment);
    }

    // Attach comment to object
    static async attachToObject(
        comment: Comment,
        objectId: string
    ): Promise<Comment> {
        comment.attachToObject(objectId);
        return await this.updateComment(comment);
    }

    // Detach comment from object
    static async detachFromObject(
        comment: Comment,
        x: number,
        y: number
    ): Promise<Comment> {
        comment.detachFromObject(x, y);
        return await this.updateComment(comment);
    }

    // Get comments by user
    static async getCommentsByUser(
        canvasId: string,
        userId: string
    ): Promise<Comment[]> {
        // TODO: Fetch from database
        // const data = await db.comment.findMany({
        //   where: { canvasId, userId, status: { not: 'deleted' } },
        //   orderBy: { createdAt: 'desc' }
        // });
        // return data.map(d => Comment.fromJSON(d));

        return [];
    }

    // Get comments mentioning a user
    static async getCommentsMentioningUser(
        canvasId: string,
        userId: string
    ): Promise<Comment[]> {
        // TODO: Fetch from database
        // const data = await db.comment.findMany({
        //   where: {
        //     canvasId,
        //     mentions: { has: userId },
        //     status: { not: 'deleted' }
        //   },
        //   orderBy: { createdAt: 'desc' }
        // });
        // return data.map(d => Comment.fromJSON(d));

        return [];
    }

    // Get comment count for canvas
    static async getCommentCount(canvasId: string): Promise<number> {
        // TODO: Count from database
        // return await db.comment.count({
        //   where: { canvasId, status: { not: 'deleted' } }
        // });

        return 0;
    }

    // Get unresolved comment count
    static async getUnresolvedCount(canvasId: string): Promise<number> {
        // TODO: Count from database
        // return await db.comment.count({
        //   where: { canvasId, status: 'open' }
        // });

        return 0;
    }

    // Private helper methods (to be implemented)
    private static async notifyMentionedUsers(
        comment: Comment,
        mentions: string[]
    ): Promise<void> {
        // TODO: Implement notification logic
        // Send email/push notifications to mentioned users
    }

    private static async notifyCommentAuthor(comment: Comment): Promise<void> {
        // TODO: Implement notification logic
        // Notify original comment author of new reply
    }

    private static async notifyCommentResolved(comment: Comment): Promise<void> {
        // TODO: Implement notification logic
        // Notify comment author that their comment was resolved
    }

    private static async notifyCommentReopened(comment: Comment): Promise<void> {
        // TODO: Implement notification logic
        // Notify resolver that comment was reopened
    }
}