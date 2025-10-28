// lib/hooks/useComments.ts

'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/lib/models/Comment';
import { CommentService } from '@/lib/services/CommentService';

export function useComments(canvasId?: string) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [openComments, setOpenComments] = useState<Comment[]>([]);
    const [resolvedComments, setResolvedComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!canvasId) {
            setLoading(false);
            return;
        }

        loadComments();
    }, [canvasId]);

    const loadComments = async () => {
        if (!canvasId) return;

        try {
            setLoading(true);
            setError(null);
            const all = await CommentService.getCommentsByCanvas(canvasId);
            const open = await CommentService.getOpenComments(canvasId);
            const resolved = await CommentService.getResolvedComments(canvasId);
            setComments(all);
            setOpenComments(open);
            setResolvedComments(resolved);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const createComment = async (
        userId: string,
        content: string,
        options?: {
            objectId?: string;
            position?: { x: number; y: number };
            mentions?: string[];
        }
    ) => {
        if (!canvasId) return null;

        try {
            setError(null);
            const comment = await CommentService.createComment(
                canvasId,
                userId,
                content,
                options
            );
            setComments([comment, ...comments]);
            setOpenComments([comment, ...openComments]);
            return comment;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create comment');
            return null;
        }
    };

    const updateContent = async (
        comment: Comment,
        newContent: string,
        mentions?: string[]
    ) => {
        try {
            setError(null);
            const updated = await CommentService.updateCommentContent(
                comment,
                newContent,
                mentions
            );
            setComments(comments.map(c => c.id === updated.id ? updated : c));
            setOpenComments(openComments.map(c => c.id === updated.id ? updated : c));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update comment');
            return null;
        }
    };

    const addReply = async (comment: Comment, userId: string, content: string) => {
        try {
            setError(null);
            const updated = await CommentService.addReply(comment, userId, content);
            setComments(comments.map(c => c.id === updated.id ? updated : c));
            setOpenComments(openComments.map(c => c.id === updated.id ? updated : c));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add reply');
            return null;
        }
    };

    const resolveComment = async (comment: Comment, resolvedBy: string) => {
        try {
            setError(null);
            const updated = await CommentService.resolveComment(comment, resolvedBy);
            setComments(comments.map(c => c.id === updated.id ? updated : c));
            setOpenComments(openComments.filter(c => c.id !== updated.id));
            setResolvedComments([updated, ...resolvedComments]);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resolve comment');
            return null;
        }
    };

    const reopenComment = async (comment: Comment) => {
        try {
            setError(null);
            const updated = await CommentService.reopenComment(comment);
            setComments(comments.map(c => c.id === updated.id ? updated : c));
            setResolvedComments(resolvedComments.filter(c => c.id !== updated.id));
            setOpenComments([updated, ...openComments]);
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reopen comment');
            return null;
        }
    };

    const deleteComment = async (comment: Comment) => {
        try {
            setError(null);
            await CommentService.deleteComment(comment);
            setComments(comments.filter(c => c.id !== comment.id));
            setOpenComments(openComments.filter(c => c.id !== comment.id));
            setResolvedComments(resolvedComments.filter(c => c.id !== comment.id));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete comment');
        }
    };

    return {
        comments,
        openComments,
        resolvedComments,
        loading,
        error,
        loadComments,
        createComment,
        updateContent,
        addReply,
        resolveComment,
        reopenComment,
        deleteComment,
    };
}