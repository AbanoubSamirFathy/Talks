import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { authContext } from "../contexts/authContext";
import LoadingScreen from "../components/LoadingScreen";
import { Input, Button } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { addToast } from "@heroui/react";
import { useParams } from "react-router-dom";
import { apiServices } from "../services/apiServices";

export default function Feed() {
  const { userToken, user } = useContext(authContext);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loadingComments, setLoadingComments] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");

  async function getPosts() {
    const data = await apiServices.getPosts();
    setPosts(data);
  }

  useEffect(() => {
    getPosts();
  }, []);

  async function getPostDetails() {
    try {
      const { data } = await axios.get(
        `https://route-posts.routemisr.com/posts/${id}`,
        { headers: { token: userToken } },
      );
      setPost(data.data.post);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }

  async function getComments() {
    try {
      setLoadingComments(true);
      const { data } = await axios.get(
        `https://route-posts.routemisr.com/posts/${id}/comments?limit=10`,
        { headers: { token: userToken } },
      );
      setComments(data.data.comments);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoadingComments(false);
    }
  }

  useEffect(() => {
    if (!id) return;
    getPostDetails();
    getComments();
  }, [id]);

  //Post
  async function handleUpdatePost(postId) {
    try {
      const formData = {
        body: editContent,
      };

      setLoading(true);

      const response = await apiServices.updatePost(postId, formData);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, body: editContent } : post,
        ),
      );

      setEditingPostId(null);
      setLoading(false);

      addToast({
        title: "Success",
        description: "Post updated successfully",
        color: "success",
      });
    } catch (error) {
      console.log(error);

      addToast({
        title: "Error",
        description: "Failed to update post",
        color: "danger",
      });
    }
  }
  function handleEditClick(post) {
    setEditingPostId(post._id);
    setEditContent(post.body);
  }
  async function deletePost(postId) {
    const { data } = await axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}`,
      {
        headers: {
          token: userToken,
        },
      },
    );

    return data;
  }
  async function handleDelete(postId) {
    const oldPosts = posts;

    setPosts((prev) => prev.filter((post) => post._id !== postId));

    try {
      await deletePost(postId);

      addToast({
        title: "Success",
        description: "Post deleted Successfully",
        color: "success",
      });
    } catch (error) {
      console.log(error.response?.data || error.message);

      setPosts(oldPosts);
    }
  }

  // Comment
  async function handleCreateComment(postId) {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    const formData = new FormData();
    formData.append("content", content.trim());

    try {
      const { data } = await axios.post(
        `https://route-posts.routemisr.com/posts/${postId}/comments`,
        formData,
        { headers: { token: userToken } },
      );

      const newComment = data.data.comment;
      setComments((prev) => [newComment, ...prev]);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      setActiveCommentPostId(null);

      addToast({
        title: "Success",
        description: "Comment created Successfully",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        color: "danger",
      });
    }
  }
  async function handleUpdateComment(postId, commentId) {
    if (!editValue.trim()) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("content", editValue.trim());

    try {
      await apiServices.updateComment(postId, commentId, formData);

      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId ? { ...c, content: editValue.trim() } : c,
        ),
      );

      setEditingCommentId(null);
      setEditValue("");
      setLoading(false);

      addToast({
        title: "Success",
        description: "Comment updated successfully",
        color: "success",
      });
    } catch (error) {
      setLoading(false);
      addToast({
        title: "Error",
        description: error.response?.data?.message || error.message,
        color: "danger",
      });
    }
  }
  async function handleDeleteComment(postId, commentId) {
    try {
      await apiServices.deleteComment(postId, commentId);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post._id !== postId) return post;

          const isTopComment = post.topComment?._id === commentId;

          return {
            ...post,
            topComment: isTopComment ? null : post.topComment,
            comments: post.comments?.filter((c) => c._id !== commentId) || [],
          };
        }),
      );

      addToast({
        title: "Success",
        description: "Comment deleted Successfully",
        color: "success",
      });
    } catch (err) {
      console.error(err);

      addToast({
        title: "Error",
        description: "Failed to delete comment",
        color: "danger",
      });
    }
  }

  if (!post) return <LoadingScreen />;

  return (
    <div className="bg-gray-500 py-5 min-h-screen">
      <div className="w-2/5 mx-auto overflow-hidden">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          {/* User Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              {post.user?.photo ? (
                <img
                  src={post.user.photo}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <i className="fa-solid fa-user w-8 h-8 text-gray-400"></i>
              )}
              <div>
                <p className="text-gray-800 font-semibold">
                  {post.user?.name || "Anonymous"}
                </p>
                <p className="text-gray-500 text-sm">
                  Posted {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            {user &&
              post.user &&
              String(post.user._id).trim() === String(user._id).trim() && (
                <div className="relative">
                  {editingPostId !== post._id ? (
                    <Dropdown>
                      <DropdownTrigger className="text-gray-500">
                        <button className="hover:bg-gray-100 transition rounded-full p-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={20}
                            height={20}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx={12} cy={7} r={1} />
                            <circle cx={12} cy={12} r={1} />
                            <circle cx={12} cy={17} r={1} />
                          </svg>
                        </button>
                      </DropdownTrigger>

                      <DropdownMenu aria-label="Post Actions">
                        <DropdownItem
                          key="edit"
                          onPress={() => handleEditClick(post)}
                        >
                          Edit Post
                        </DropdownItem>

                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          onPress={() => handleDelete(post._id)}
                        >
                          Delete Post
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  ) : (
                    <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col gap-3 shadow-sm animate-in fade-in">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        placeholder="Edit your post..."
                        className="bg-white"
                      />

                      <div className="flex gap-2 justify-end">
                        <Button
                          isLoading={loading}
                          onPress={() => handleUpdatePost(post._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Save
                        </Button>

                        <Button
                          onPress={() => setEditingPostId(null)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Post Body */}
          <div className="mb-4">
            <p className="text-gray-800">{post.body}</p>
          </div>
          {post.image && (
            <div className="mb-4">
              <img src={post.image} alt="Post" className="rounded-md" />
            </div>
          )}

          {/* Likes, Comments and Shares Count */}
          <div className="flex gap-3 text-gray-500 mb-2">
            <div className="flex items-center gap-1 hover:bg-gray-50 rounded-full">
              {post.likesCount} <i className="fa-solid fa-thumbs-up"></i>
            </div>
            <div className="flex items-center gap-1 hover:bg-gray-50 rounded-full">
              {post.commentsCount} <i className="fa-solid fa-comment"></i>
            </div>
            <div className="flex items-center gap-1 hover:bg-gray-50 rounded-full">
              {post.sharesCount} <i className="fa-solid fa-share"></i>
            </div>
          </div>

          {/* Like, Comment, Share Buttons */}
          <hr className="mt-2 mb-1" />
          <div className="flex justify-around text-gray-500">
            <button className="flex items-center gap-1 hover:bg-gray-200 px-10 py-2 rounded hover:text-blue-500">
              <i className="fa-solid fa-thumbs-up"></i>Like
            </button>
            <button
              className="flex items-center gap-1 hover:bg-gray-200 px-10 py-2 rounded hover:text-blue-500"
              onClick={() =>
                setActiveCommentPostId((prev) =>
                  prev === post._id ? null : post._id,
                )
              }
            >
              <i className="fa-solid fa-comment"></i>Comment
            </button>
            <button className="flex items-center gap-1 hover:bg-gray-200 px-10 py-2 rounded hover:text-blue-500">
              <i className="fa-solid fa-share"></i>Share
            </button>
          </div>
          <hr className="mt-1 mb-2" />

          {/* Comment Input */}
          {activeCommentPostId === post._id && (
            <Input
              placeholder="Comment"
              type="text"
              value={commentInputs[post._id] || ""}
              onChange={(e) =>
                setCommentInputs((prev) => ({
                  ...prev,
                  [post._id]: e.target.value,
                }))
              }
              endContent={
                <button onClick={() => handleCreateComment(post._id)}>
                  <i className="fa-solid fa-paper-plane text-blue-500 shrink-0" />
                </button>
              }
            />
          )}

          {/* Comments */}
          <h3 className="text-gray-500 font-semibold mt-3 rounded">
            All Comments
          </h3>
          {loadingComments ? (
            <p className="text-gray-400">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400">No comments yet</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="flex justify-between gap-2 mb-4 bg-gray-50 p-2 rounded"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <img
                    src={comment.commentCreator?.photo || ""}
                    alt="User Avatar"
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <p className="text-gray-800 font-semibold">
                      {comment.commentCreator?.name || "Anonymous"}
                    </p>
                    <p className="text-gray-500 text-sm">{comment.content}</p>
                  </div>
                </div>

                {/* Edit/Delete for comment owner */}
                <div className="relative">
                  {!editingCommentId || editingCommentId !== comment._id ? (
                    <Dropdown>
                      <DropdownTrigger className="text-gray-500">
                        <button className="hover:bg-gray-50 rounded p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={24}
                            height={24}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <circle cx={12} cy={7} r={1} />
                            <circle cx={12} cy={12} r={1} />
                            <circle cx={12} cy={17} r={1} />
                          </svg>
                        </button>
                      </DropdownTrigger>

                      <DropdownMenu aria-label="Static Actions">
                        <DropdownItem
                          key="edit"
                          onPress={() => {
                            setEditingCommentId(comment._id);
                            setEditValue(comment.content);
                          }}
                        >
                          Edit Comment
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          onPress={() =>
                            handleDeleteComment(post._id, comment._id)
                          }
                        >
                          Delete Comment
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  ) : null}

                  {editingCommentId === comment._id && (
                    <div className="mt-2 p-3 bg-gray-100 rounded-md border border-gray-300 flex flex-col gap-2 shadow-sm">
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-white"
                        placeholder="Edit your comment"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          isLoading={loading}
                          onPress={() =>
                            handleUpdateComment(post._id, comment._id)
                          }
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          Save
                        </Button>
                        <Button
                          onPress={() => setEditingCommentId(null)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
