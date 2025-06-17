"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Send, Trash2, Edit3, MessageCircle, AtSign, X } from "lucide-react";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  priority?: string;
  type: "user" | "admin";
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: string;
  createdByUser?: {
    id: string;
    name: string;
    email: string;
    priority?: string;
  };
  createdByAdmin?: {
    id: string;
    name: string;
    email: string;
    companyName?: string;
  };
  task: {
    id: string;
    title: string;
  };
}

interface CommentSystemProps {
  taskId: string;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
  onCommentChange?: (count: number) => void;
}

const CommentsBox: React.FC<CommentSystemProps> = ({
  taskId,
  currentUser,
  onCommentChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mention functionality
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionUsers, setMentionUsers] = useState<User[]>([]);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [fetchingMentions, setFetchingMentions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const mentionDropdownRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("CurrentUser", currentUser);
  const baseURL =
    "https://task-management-backend-kohl-omega.vercel.app/api/comments";

  // Improved positioning function
  const calculateMentionPosition = useCallback(
    (input: HTMLInputElement, atIndex: number) => {
      const inputRect = input.getBoundingClientRect();
      // const containerRect = containerRef.current?.getBoundingClientRect();

      // Create a temporary span to measure text width up to @ symbol
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.position = "absolute";
      tempSpan.style.whiteSpace = "pre";
      tempSpan.style.font = window.getComputedStyle(input).font;
      tempSpan.textContent = input.value.substring(0, atIndex + 1);

      document.body.appendChild(tempSpan);
      const textWidth = tempSpan.getBoundingClientRect().width;
      document.body.removeChild(tempSpan);

      // Calculate position relative to the input
      const inputPadding = 12; // px-3 = 12px padding
      let left = inputRect.left + inputPadding + textWidth - 8; // Slight offset for @ symbol
      let top = inputRect.bottom + 4; // 4px gap below input

      // Ensure dropdown doesn't go off-screen horizontally
      const dropdownWidth = 280;
      const viewportWidth = window.innerWidth;
      if (left + dropdownWidth > viewportWidth - 20) {
        left = viewportWidth - dropdownWidth - 20;
      }
      if (left < 20) {
        left = 20;
      }

      // Ensure dropdown doesn't go off-screen vertically
      const dropdownMaxHeight = 200;
      const viewportHeight = window.innerHeight;
      if (top + dropdownMaxHeight > viewportHeight - 20) {
        // Show above input instead
        top = inputRect.top - dropdownMaxHeight - 4;
      }

      // Account for page scroll
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      return {
        top: top + scrollTop,
        left: left + scrollLeft,
      };
    },
    []
  );

  // Scroll to bottom of comments
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/task/${taskId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");

      const data = await response.json();
      // Sort comments by createdAt ascending (oldest first, latest at bottom)
      const sortedComments = (data.data.comments || []).sort(
        (a: Comment, b: Comment) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setComments(sortedComments);
      onCommentChange?.(sortedComments.length);
      setError(null);

      // Scroll to bottom after comments are loaded
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [taskId, onCommentChange]);

  // Fetch mentionable users with debouncing
  const fetchMentionableUsers = useCallback(
    async (query: string) => {
      try {
        setFetchingMentions(true);
        const roleParam = currentUser.role === "admin" ? "adminId" : "userId";
        const response = await fetch(
          `${baseURL}/mentionable-users?${roleParam}=${
            currentUser.id
          }&searchTerm=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error("Failed to fetch users");

        const data = await response.json();
        console.log("DATA", data);
        setMentionUsers(data.data || []);
        setSelectedMentionIndex(0); // Reset selection
      } catch (err) {
        console.error("Error fetching mentionable users:", err);
        setMentionUsers([]);
      } finally {
        setFetchingMentions(false);
      }
    },
    [currentUser]
  );

  // Debounced mention fetch
  const debouncedFetchMentions = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fetchMentionableUsers(query), 300);
      };
    })(),
    [fetchMentionableUsers]
  );

  // Create comment
  const createComment = async (content: string) => {
    try {
      setSubmitting(true);
      const roleParam = currentUser.role === "admin" ? "adminId" : "userId";

      const response = await fetch(`${baseURL}/create-comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          taskId,
          [roleParam]: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to create comment");

      await fetchComments();
      setNewComment("");
      setError(null);
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment
  const updateComment = async (commentId: string, content: string) => {
    try {
      setSubmitting(true);
      const roleParam = currentUser.role === "admin" ? "adminId" : "userId";

      const response = await fetch(`${baseURL}/update-comment/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          [roleParam]: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to update comment");

      await fetchComments();
      setEditingCommentId(null);
      setEditContent("");
      setError(null);
    } catch (err) {
      console.error("Error updating comment:", err);
      setError("Failed to update comment");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const deleteComment = async (commentId: string) => {
    try {
      const roleParam = currentUser.role === "admin" ? "adminId" : "userId";

      const response = await fetch(`${baseURL}/delete-comment/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [roleParam]: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete comment");

      await fetchComments();
      setError(null);
    } catch (err) {
      console.error("Error deleting comment:", err);
      setError("Failed to delete comment");
    }
  };

  // Handle mention detection with improved positioning
  const handleInputChange = (value: string, isEdit = false) => {
    if (isEdit) {
      setEditContent(value);
    } else {
      setNewComment(value);
    }

    const input = isEdit ? editInputRef.current : inputRef.current;
    if (!input) return;

    // Store cursor position
    setCursorPosition(input.selectionStart || 0);

    // Check for @ mention at or before cursor position
    const textUpToCursor = value.substring(0, input.selectionStart || 0);
    const lastAtIndex = textUpToCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textUpToCursor.substring(lastAtIndex + 1);

      // Check if there's a space after @ (which would end the mention)
      if (!textAfterAt.includes(" ") && textAfterAt.length >= 0) {
        // Still typing the mention
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        debouncedFetchMentions(textAfterAt);

        // Calculate improved position
        const position = calculateMentionPosition(input, lastAtIndex);
        setMentionPosition(position);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Handle mention selection with cursor position preservation
  const selectMention = (user: User) => {
    const currentValue = editingCommentId ? editContent : newComment;
    const input = editingCommentId ? editInputRef.current : inputRef.current;

    if (!input) return;

    const cursorPos = input.selectionStart || 0;
    const textUpToCursor = currentValue.substring(0, cursorPos);
    const lastAtIndex = textUpToCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const beforeMention = currentValue.substring(0, lastAtIndex);
      const afterCursor = currentValue.substring(cursorPos);
      const newValue = `${beforeMention}@${user.name} ${afterCursor}`;
      const newCursorPos = lastAtIndex + user.name.length + 2; // +2 for @ and space

      if (editingCommentId) {
        setEditContent(newValue);
      } else {
        setNewComment(newValue);
      }

      // Restore focus and cursor position
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    }

    setShowMentions(false);
    setMentionQuery("");
  };

  // Handle keyboard navigation for mentions
  const handleKeyDown = (e: React.KeyboardEvent, isEdit = false) => {
    if (showMentions && mentionUsers.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev < mentionUsers.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) =>
          prev > 0 ? prev - 1 : mentionUsers.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (mentionUsers[selectedMentionIndex]) {
          selectMention(mentionUsers[selectedMentionIndex]);
        }
      } else if (e.key === "Escape") {
        setShowMentions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isEdit && editingCommentId) {
        if (editContent.trim()) {
          updateComment(editingCommentId, editContent);
        }
      } else if (!isEdit) {
        if (newComment.trim()) {
          createComment(newComment);
        }
      }
    }
  };

  // Handle input focus and selection changes
  const handleInputFocus = (isEdit = false) => {
    const input = isEdit ? editInputRef.current : inputRef.current;
    if (input) {
      setCursorPosition(input.selectionStart || 0);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Render comment content with mentions
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span
            key={index}
            className="text-blue-600 font-medium bg-blue-50 px-1 rounded"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Check if current user can delete comment
  const canDeleteComment = (comment: Comment) => {
    if (currentUser.role === "admin") {
      return comment.createdByAdmin?.id === currentUser.id;
    } else {
      return comment.createdByUser?.id === currentUser.id;
    }
  };

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Close mentions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionDropdownRef.current &&
        !mentionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMentions(false);
      }
    };

    if (showMentions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMentions]);

  // Handle window resize to reposition dropdown
  useEffect(() => {
    const handleResize = () => {
      if (showMentions) {
        const input = editingCommentId
          ? editInputRef.current
          : inputRef.current;
        if (input) {
          const currentValue = editingCommentId ? editContent : newComment;
          const textUpToCursor = currentValue.substring(0, cursorPosition);
          const lastAtIndex = textUpToCursor.lastIndexOf("@");
          if (lastAtIndex !== -1) {
            const position = calculateMentionPosition(input, lastAtIndex);
            setMentionPosition(position);
          }
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    showMentions,
    editingCommentId,
    editContent,
    newComment,
    cursorPosition,
    calculateMentionPosition,
  ]);

  return (
    <div
      ref={containerRef}
      className="bg-white border rounded-lg p-4 max-w-4xl mx-auto"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-800">
          Comments ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => {
            const author = comment.createdByUser || comment.createdByAdmin;
            const isCurrentUserComment = canDeleteComment(comment);

            return (
              <div key={comment.id} className="flex gap-3 group">
                <div className="h-8 w-8 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">
                    {author?.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {author?.name}
                      {comment.createdByAdmin && (
                        <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                          Admin
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTime(comment.createdAt)}
                    </span>
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-gray-400">(edited)</span>
                    )}
                  </div>

                  {editingCommentId === comment.id ? (
                    <div className="relative">
                      <input
                        ref={editInputRef}
                        value={editContent}
                        onChange={(e) =>
                          handleInputChange(e.target.value, true)
                        }
                        onKeyDown={(e) => handleKeyDown(e, true)}
                        onFocus={() => handleInputFocus(true)}
                        onSelect={() => handleInputFocus(true)}
                        className="w-full text-sm mb-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Edit your comment..."
                        disabled={submitting}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(comment.id, editContent)}
                          disabled={submitting || !editContent.trim()}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          {submitting ? "Saving..." : "Save"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditContent("");
                            setShowMentions(false);
                          }}
                          className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {renderCommentContent(comment.content)}
                    </p>
                  )}
                </div>

                {isCurrentUserComment && editingCommentId !== comment.id && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                      title="Edit comment"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600"
                      title="Delete comment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* New Comment Form */}
      <div className="relative">
        <div className="flex gap-3">
          <div className="h-8 w-8 flex-shrink-0 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-green-600">
              {currentUser.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              onFocus={() => handleInputFocus()}
              onSelect={() => handleInputFocus()}
              placeholder="Type your comment... Use @ to mention someone"
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={submitting}
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
              <AtSign className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={() => createComment(newComment)}
            disabled={submitting || !newComment.trim()}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Improved Mention Dropdown */}
      {showMentions && (
        <div
          ref={mentionDropdownRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 max-h-48 overflow-y-auto"
          style={{
            top: `${mentionPosition.top}px`,
            left: `${mentionPosition.left}px`,
            width: "280px",
          }}
        >
          {fetchingMentions ? (
            <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              Loading users...
            </div>
          ) : mentionUsers.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {mentionQuery
                ? `No users found for "${mentionQuery}"`
                : "No users found"}
            </div>
          ) : (
            mentionUsers.map((user, index) => (
              <button
                key={user.id}
                onClick={() => selectMention(user)}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors ${
                  index === selectedMentionIndex
                    ? "bg-blue-50 border-r-2 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  {user.type === "admin" && (
                    <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded flex-shrink-0">
                      Admin
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentsBox;
