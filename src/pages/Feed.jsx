import React, { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { authContext } from "../contexts/authContext";
import LoadingScreen from "../components/LoadingScreen";
import { Button, image, Toast } from "@heroui/react";
import { Input } from "@heroui/react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { addToast } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { apiServices } from "../services/apiServices";

export default function Feed() {
  const { userToken, user } = useContext(authContext);
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState(null);
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({});
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const navigate = useNavigate();
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editingPostId, setEditingPostId] = useState(null);
  const [editContent, setEditContent] = useState("");

  async function getPosts() {
    const data = await apiServices.getPosts();
    setPosts(data);
  }

  useEffect(() => {
    getPosts();
  }, []);

  // Post
  async function handleCreatePost() {
    setLoading(true);

    try {
      const { _id } = await apiServices.createPost({ content, file });

      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `https://route-posts.routemisr.com/posts/${_id}`,
        { headers: { token } },
      );

      const fullPost = data.data.post;
      setPosts((prev) => [fullPost, ...prev]);

      setContent("");
      cancelFile();

      addToast({
        title: "Success",
        description: "Post created Successfully",
        color: "success",
      });
    } catch (error) {
      console.log(error.response || error.message);

      addToast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create post",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }
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
        description: "Post edited successfully",
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
    const content = comments[postId];

    if (!content?.trim()) return;

    try {
      const newComment = await apiServices.createComment({ content, postId });

      setPosts((prev) =>
        prev.map((post) =>
          post._id === postId
            ? {
                ...post,
                commentsCount: post.commentsCount + 1,
                topComment: newComment,
              }
            : post,
        ),
      );

      setComments((prev) => ({ ...prev, [postId]: "" }));
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

      setEditingCommentId(null);
      setEditValue("");

      getPosts();
      setLoading(false);

      addToast({
        title: "Success",
        description: "Comment edited successfully",
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

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    const url = URL.createObjectURL(selectedFile);
    setPreviewURL(url);
    console.log(selectedFile);
  }
  function openFilePicker() {
    fileInputRef.current.click();
  }
  function cancel() {
    setFile(null);
    setContent("");
    fileInputRef.current.value = null;
  }
  function cancelFile() {
    setFile(null);
    setPreviewURL(null);
    fileInputRef.current.value = null;
  }

  return (
    <div className="bg-gray-500 py-5">
      <div className="w-[65%] flex justify-evenly mx-auto">
        <div className="w-[55%] overflow-hidden">
          {/* Create Post */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            {/* Input */}
            <div className="flex items-center gap-2 border-b pb-3 mb-3">
              <i className="fa-solid fa-pen text-gray-400"></i>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something..."
                className="w-full bg-transparent outline-none text-gray-600 placeholder-gray-400"
              />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*"
            />

            {/* Actions */}
            <div className="flex justify-around text-gray-600 text-sm">
              <button
                onClick={openFilePicker}
                value={image}
                className="flex items-center gap-1 hover:text-blue-500 transition"
              >
                <i className="fa-regular fa-image"></i>
                Photo
              </button>

              <button
                onClick={openFilePicker}
                className="flex items-center gap-1 hover:text-blue-500 transition"
              >
                <i className="fa-solid fa-video"></i>
                Video
              </button>

              <button
                onClick={openFilePicker}
                className="flex items-center gap-1 hover:text-blue-500 transition"
              >
                <i className="fa-regular fa-calendar"></i>
                Event
              </button>

              <button
                onClick={openFilePicker}
                className="flex items-center gap-1 hover:text-blue-500 transition"
              >
                <i className="fa-solid fa-location-dot"></i>
                Location
              </button>
            </div>

            {/* Preview */}
            {file && (
              <div className="realtive mt-3 p-2 rounded-lg">
                <div className="absolute right-123 p-1 mb-2 bg-red-100 w-fit rounded-lg">
                  <button onClick={cancelFile} className="text-red-500 text-sm">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </div>

                {/* Image preview */}
                {file.type.startsWith("image/") && (
                  <img src={previewURL} alt="preview" className="rounded-lg" />
                )}

                {/* Video preview */}
                {file.type.startsWith("video/") && (
                  <video src={previewURL} controls className="rounded-lg" />
                )}
              </div>
            )}

            {/* Post and Cancel Buttons */}
            {(content?.trim() || file) && (
              <div className="flex gap-2">
                <Button
                  className="bg-red-600 text-white font-medium mt-3"
                  onPress={handleCreatePost}
                  isLoading={loading}
                >
                  Post
                </Button>
                <Button
                  className="bg-gray-600 text-white font-medium mt-3"
                  onPress={cancel}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Post */}
          {!posts ? (
            <LoadingScreen />
          ) : (
            posts?.map((post, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md mb-6"
              >
                {/* User Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {post.user?.photo ? (
                      <img
                        src={post.user.photo}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
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
                    String(post.user._id).trim() ===
                      String(user._id).trim() && (
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
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4"
                              >
                                Save
                              </Button>

                              <Button
                                onPress={() => setEditingPostId(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Post Message */}
                <div className="mb-4">
                  <p className="text-gray-800">{post.body}</p>
                </div>

                {/* Post Image */}
                {post.image && (
                  <div className="mb-4">
                    <img src={post.image} alt="Post" className="rounded-md" />
                  </div>
                )}

                {/* Likes, Comments and Shares Count */}
                <div className="flex gap-3 text-gray-500 mb-2">
                  <div className="flex items-center gap-1 hover:bg-gray-50 rounded-full">
                    {post.likesCount}
                    <i class="fa-solid fa-thumbs-up"></i>
                  </div>
                  <div className="flex items-center gap-1 hover:bg-gray-50 rounded-full">
                    {post.commentsCount}
                    <i class="fa-solid fa-comment"></i>
                  </div>
                  <div className="flex items-center gap-1 hover:bg-gray-50 rounded-full">
                    {post.sharesCount}
                    <i class="fa-solid fa-share"></i>
                  </div>
                </div>

                {/* Likes, Comments and Shares Button */}
                <hr className="mt-2 mb-1" />
                <div className="flex justify-around text-gray-500">
                  <button className="flex items-center gap-1 hover:bg-gray-200 py-2 rounded hover:text-blue-500">
                    <i class="fa-solid fa-thumbs-up"></i>Like
                  </button>
                  <button
                    className="flex items-center gap-1 hover:bg-gray-200 py-2 rounded hover:text-blue-500"
                    onClick={() =>
                      setActiveCommentPostId((prev) =>
                        prev === post._id ? null : post._id,
                      )
                    }
                  >
                    <i class="fa-solid fa-comment"></i>
                    Comment
                  </button>
                  <button className="flex items-center gap-1 hover:bg-gray-200 py-2 rounded hover:text-blue-500">
                    <i class="fa-solid fa-share"></i>Share
                  </button>
                </div>
                <hr className="mt-1 mb-2" />

                {/* Comment Input */}
                {activeCommentPostId === post._id && (
                  <Input
                    placeholder="Comment"
                    type="text"
                    value={comments[post._id] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
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

                {/* Top Comment Section */}
                {post.topComment == null ? (
                  ""
                ) : (
                  <div>
                    <p className="text-gray-500 font-semibold mt-3 text-center rounded">
                      Top Comment
                    </p>
                    <div className="flex items-baseline justify-between mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <img
                          src={
                            post.topComment.commentCreator?.photo || (
                              <i class="fa-solid fa-user"></i>
                            )
                          }
                          alt="User Avatar"
                          className="w-6 h-6 rounded-full"
                        />
                        <div>
                          <p className="text-gray-800 font-semibold">
                            {post.topComment.commentCreator?.name ||
                              "Anonymous"}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {post.topComment.content}
                          </p>
                        </div>
                      </div>
                      {user &&
                        post.user &&
                        String(post.user._id).trim() ===
                          String(user._id).trim() && (
                          <div className="relative">
                            {!editingCommentId ||
                            editingCommentId !== post.topComment._id ? (
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
                                      setEditingCommentId(post.topComment._id);
                                      setEditValue(post.topComment.content);
                                    }}
                                  >
                                    Edit Comment
                                  </DropdownItem>
                                  <DropdownItem
                                    key="delete"
                                    className="text-danger"
                                    color="danger"
                                    onPress={() =>
                                      handleDeleteComment(
                                        post._id,
                                        post.topComment._id,
                                      )
                                    }
                                  >
                                    Delete Comment
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            ) : (
                              <div className="flex flex-col gap-2 mt-2">
                                <Input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                />

                                <div className="flex gap-2">
                                  <Button
                                    isLoading={loading}
                                    onPress={() =>
                                      handleUpdateComment(
                                        post._id,
                                        post.topComment._id,
                                      )
                                    }
                                  >
                                    Edit
                                  </Button>

                                  <Button
                                    className="bg-red-500"
                                    onPress={() => setEditingCommentId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {/* Show All Comments Button */}
                {post.commentsCount !== 0 ? (
                  <Button
                    className="w-full mt-1 font-semibold"
                    color="default"
                    onPress={() => navigate(`/postDetails/${post._id}`)}
                  >
                    Show All Comments
                  </Button>
                ) : (
                  ""
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
