import React, { useState, useEffect } from 'react';
import { commentsService, type Comment } from '../../services/commentsService';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { format } from 'date-fns';

interface CommentsPanelProps {
  ventureId: string;
  sectionType: string;
  sectionId?: string;
}

export function CommentsPanel({ ventureId, sectionType, sectionId }: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    loadComments();
    const subscription = commentsService.subscribeToComments(ventureId, () => {
      loadComments();
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [ventureId, sectionType, sectionId]);

  const loadComments = async () => {
    try {
      const data = await commentsService.getComments(ventureId, sectionType, sectionId);
      setComments(data);
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!newComment.trim()) return;

    try {
      setPosting(true);
      await commentsService.createComment({
        ventureId,
        sectionType,
        sectionId,
        content: newComment,
        parentId: replyTo || undefined,
      });
      setNewComment('');
      setReplyTo(null);
      await loadComments();
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setPosting(false);
    }
  };

  const renderComment = (comment: Comment, depth: number = 0) => (
    <div key={comment.id} className={`${depth > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm text-gray-900 dark:text-white">
                {comment.profiles?.full_name || comment.profiles?.email || 'Unknown'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {format(new Date(comment.created_at), 'MMM d, h:mm a')}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-gray-400 dark:text-gray-500">(edited)</span>
              )}
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>
        </div>
        <button
          onClick={() => setReplyTo(comment.id)}
          className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          Reply
        </button>
      </div>
      {comment.replies?.map((reply) => renderComment(reply, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        {replyTo && (
          <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">
            Replying to comment
            <button
              onClick={() => setReplyTo(null)}
              className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <Button
          onClick={handlePost}
          disabled={posting || !newComment.trim()}
          className="mt-2"
        >
          {posting ? 'Posting...' : 'Post Comment'}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-4 text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No comments yet</div>
      ) : (
        <div>{comments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  );
}
