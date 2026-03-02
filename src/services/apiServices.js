import axios from "axios";

class ApiServices {
  userToken = localStorage.getItem("token");

  async getPosts() {
    const { data } = await axios.get(import.meta.env.VITE_BASE_URL + "/posts", {
      headers: {
        token: this.userToken,
      },
    });
    return data.data.posts;
  }

  // Post
  async createPost({ content, file, currentUser }) {
    const formData = new FormData();
    if (content?.trim()) formData.append("body", content.trim());
    if (file) formData.append("image", file);

    const { data } = await axios.post(
      import.meta.env.VITE_BASE_URL + "/posts",
      formData,
      { headers: { token: this.userToken } },
    );

    const post = data.data.post || data.data;
    if (!post.user) {
      post.user = currentUser;
    }

    return post;
  }
  async updatePost(postId, formData) {
    const { data } = await axios.put(
      import.meta.env.VITE_BASE_URL + `/posts/${postId}`,
      formData,
      {
        headers: {
          token: this.userToken,
        },
      },
    );
    return data;
  }

  // Comment
  async createComment({ content, postId }) {
    if (!content?.trim()) {
      throw new Error("Comment cannot be empty");
    }

    const formData = new FormData();
    formData.append("content", content.trim());

    const { data } = await axios.post(
      import.meta.env.VITE_BASE_URL + `/posts/${postId}/comments`,
      formData,
      {
        headers: {
          token: this.userToken,
        },
      },
    );

    return data.data.comment;
  }
  async updateComment(postId, commentId, formData) {
    const { data } = await axios.put(
      import.meta.env.VITE_BASE_URL +
        `/posts/${postId}` +
        `/comments/${commentId}`,
      formData,
      {
        headers: {
          token: this.userToken,
        },
      },
    );
    return data;
  }
  async deleteComment(postId, commentId) {
    const { data } = await axios.delete(
      import.meta.env.VITE_BASE_URL + `/posts/${postId}/comments/${commentId}`,
      {
        headers: {
          token: this.userToken,
        },
      },
    );
    return data;
  }

  // Profile
  async getMyProfile() {
    const { data } = await axios.get(
      import.meta.env.VITE_BASE_URL + "/users/profile-data",
      {
        headers: {
          token: this.userToken,
        },
      },
    );
    return data.data.user;
  }

  // Change Password
  async changePassword(body) {
  const { data } = await axios.patch(
    import.meta.env.VITE_BASE_URL + "/users/change-password",
    body,
    {
      headers: {
        token: this.userToken,
      },
    }
  );
  return data;
}
}

export const apiServices = new ApiServices();
