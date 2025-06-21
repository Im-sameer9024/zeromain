"use client";
//@ts-except-ignore
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Send, Trash2, Edit3, MessageCircle, AtSign, X } from "lucide-react";
import { UserData } from "@/context/AppContext";

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
  isOptimistic?: boolean; // For instant UI updates
}

interface CommentSystemProps {
  taskId: string;
  currentUser: UserData;
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

  const baseURL =
    "https://task-management-backend-seven-tan.vercel.app/api/comments";

  // Improved positioning function
  const calculateMentionPosition = useCallback(
    (input: HTMLInputElement, atIndex: number) => {
      const inputRect = input.getBoundingClientRect();

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

  // Generate temporary ID for optimistic updates
  const generateTempId = () => `temp_${Date.now()}_${Math.random()}`;

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

      // Replace optimistic comments with real ones, keep optimistic ones that haven't been processed
      setComments((prev) => {
        const optimisticComments = prev.filter((c) => c.isOptimistic);
        return [...sortedComments, ...optimisticComments];
      });

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Create comment with optimistic update
  const createComment = async (content: string) => {
    if (!content.trim()) return;

    const tempId = generateTempId();
    const optimisticComment: Comment = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      taskId,
      isOptimistic: true,
      task: { id: taskId, title: "" },
      ...(currentUser.role === "admin"
        ? {
            createdByAdmin: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            },
          }
        : {
            createdByUser: {
              id: currentUser.id,
              name: currentUser.name,
              email: currentUser.email,
            },
          }),
    };

    // Add optimistic comment immediately
    setComments((prev) => [...prev, optimisticComment]);
    setNewComment("");
    onCommentChange?.(comments.length + 1);

    // Scroll to bottom immediately
    setTimeout(scrollToBottom, 50);

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

      const responseData = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 403) {
          // Permission denied - show specific error message
          setError(
            responseData.message ||
              "You don't have permission to comment on this task."
          );
        } else {
          setError(responseData.message || "Failed to post comment");
        }
        throw new Error(responseData.message || "Failed to create comment");
      }

      // Remove optimistic comment and refresh to get real data
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      await fetchComments();
      setError(null);
    } catch (err) {
      console.error("Error creating comment:", err);

      // Remove optimistic comment on error
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      onCommentChange?.(comments.length);

      // Error message should already be set above for 403 errors
      if (!error) {
        setError("Failed to post comment");
      }
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

  // Check if comment is from current user
  const isCurrentUserComment = (comment: Comment) => {
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
      className="bg-white  rounded-lg flex flex-col max-w-4xl mx-auto h-screen max-h-[600px]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 ">
        {/* <MessageCircle className="w-5 h-5 text-gray-600" /> */}
        <h3 className="text-xl font-bold text-gray-800">
          Comments ({comments.filter((c) => !c.isOptimistic).length})
        </h3>
      </div>

      {error && (
        <div
          className={`border px-4 py-3 mx-4 mt-4 rounded flex items-start gap-2 ${
            error.includes("permission") || error.includes("priority")
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {error.includes("permission") || error.includes("priority") ? (
            <svg
              className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <div className="flex-1">
            <p className="font-medium text-sm">
              {error.includes("permission") || error.includes("priority")
                ? "Access Restricted"
                : "Error"}
            </p>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-current hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Comments List - Full Height with Scroll */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {loading && comments.length === 0 ? (
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
            const isMyComment = isCurrentUserComment(comment);
            const canDelete = canDeleteComment(comment);

            return (
              <div
                key={comment.id}
                className={`w-full ${comment.isOptimistic ? "opacity-70" : ""}`}
              >
                {/* My Comments - Right to Left Layout */}
                {isMyComment ? (
                  /* My Comments - Right to Left Layout */
                  <div className="w-full bg-white rounded-lg p-4 group relative">
                    <div className="flex items-start gap-4 flex-row-reverse">
                      {/* Avatar */}
                      <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {author?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-row-reverse justify-start">
                          <span className="text-xs text-gray-500">You</span>
                          {comment.createdByAdmin && (
                            <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs">
                              Admin
                            </span>
                          )}
                          <span className="font-medium text-gray-900">
                            {author?.name}
                          </span>
                        </div>

                        {editingCommentId === comment.id ? (
                          <div className="space-y-3">
                            <input
                              ref={editInputRef}
                              value={editContent}
                              onChange={(e) =>
                                handleInputChange(e.target.value, true)
                              }
                              onKeyDown={(e) => handleKeyDown(e, true)}
                              onFocus={() => handleInputFocus(true)}
                              onSelect={() => handleInputFocus(true)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Edit your comment..."
                              disabled={submitting}
                            />
                            <div className="flex gap-2 flex-row-reverse">
                              <button
                                onClick={() => {
                                  setEditingCommentId(null);
                                  setEditContent("");
                                  setShowMentions(false);
                                }}
                                className="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  updateComment(comment.id, editContent)
                                }
                                disabled={submitting || !editContent.trim()}
                                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                {submitting ? "Saving..." : "Save"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap break-words text-gray-800 text-right">
                            {renderCommentContent(comment.content)}
                          </div>
                        )}
                      </div>

                      {/* Time */}
                      <div className="flex flex-col items-start text-xs text-gray-500 flex-shrink-0">
                        <span>{formatTime(comment.createdAt)}</span>
                        {comment.updatedAt !== comment.createdAt && (
                          <span className="mt-1">(edited)</span>
                        )}
                        {comment.isOptimistic && (
                          <span className="mt-1">⏳</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {canDelete &&
                      editingCommentId !== comment.id &&
                      !comment.isOptimistic && (
                        <div className="absolute top-2 left-2 bg-white border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex">
                          <button
                            onClick={() => {
                              setEditingCommentId(comment.id);
                              setEditContent(comment.content);
                            }}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600"
                            title="Edit comment"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                  </div>
                ) : (
                  /* Others' Comments - Left to Right Layout */
                  <div className="w-full bg-gray-100  p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="h-10 w-10 bg-gray-400 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium text-sm">
                          {author?.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {author?.name}
                          </span>
                          {comment.createdByAdmin && (
                            <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs">
                              Admin
                            </span>
                          )}
                        </div>

                        <div className="whitespace-pre-wrap break-words text-gray-800">
                          {renderCommentContent(comment.content)}
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex flex-col items-end text-xs text-gray-500 flex-shrink-0">
                        <span>{formatTime(comment.createdAt)}</span>
                        {comment.updatedAt !== comment.createdAt && (
                          <span className="mt-1">(edited)</span>
                        )}
                        {comment.isOptimistic && (
                          <span className="mt-1">⏳</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={commentsEndRef} />
      </div>

      {/* New Comment Form - Fixed at Bottom */}
      <div className="py-3 border-t border-gray-100">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={newComment}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e)}
              onFocus={() => handleInputFocus()}
              onSelect={() => handleInputFocus()}
              placeholder="Type your comment... Use @ to mention someone"
              className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
              disabled={submitting}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <AtSign className="w-4 h-4" />
            </div>
          </div>

          <button
            onClick={() => createComment(newComment)}
            disabled={submitting || !newComment.trim()}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
