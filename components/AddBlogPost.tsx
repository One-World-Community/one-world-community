import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { commitFile, getAuthenticatedUser } from "@/lib/github-api";
import { supabase } from "@/lib/supabase";

interface AddBlogPostProps {
  onPostAdded: () => void;
}

const AddBlogPost: React.FC<AddBlogPostProps> = ({ onPostAdded }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Please enter both title and content for your post.");
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      const blogUrl = user?.user_metadata?.blog_url;
      if (!blogUrl) throw new Error("Blog URL not found in user metadata");

      const githubUser = await getAuthenticatedUser();
      const repoName = blogUrl.split(".github.io/")[1].split("/")[0]; // Get the repo name without trailing slash

      const date = new Date().toISOString().split("T")[0];
      const fileName = `${date}-${title.toLowerCase().replace(/\s+/g, "-")}.md`;
      const filePath = `_posts/${fileName}`;

      const fileContent = `---
layout: post
title: "${title}"
date: ${date}
---

${content}`;

      await commitFile(githubUser.login, repoName, filePath, fileContent, `Add new post: ${title}`);

      setTitle("");
      setContent("");
      Alert.alert("Success", "Your post has been added successfully!");
      onPostAdded();
    } catch (error) {
      console.error("Error adding post:", error);
      Alert.alert("Error", `Failed to add post: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Add New Blog Post</ThemedText>
      <TextInput
        style={styles.input}
        onChangeText={setTitle}
        value={title}
        placeholder="Enter post title"
        placeholderTextColor="#999"
      />
      <TextInput
        style={[styles.input, styles.contentInput]}
        onChangeText={setContent}
        value={content}
        placeholder="Enter post content"
        placeholderTextColor="#999"
        multiline
      />
      <Button title="Add Post" onPress={handleAddPost} disabled={isLoading} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  contentInput: {
    height: 200,
    textAlignVertical: "top",
  },
});

export default AddBlogPost;
