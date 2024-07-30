import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View } from "react-native";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import GithubSetupBlog from "@/components/GithubSetupBlog";
import AddBlogPost from "@/components/AddBlogPost";

const PostsScreen = () => {
  const [blogUrl, setBlogUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBlogSetup();
  }, []);

  const checkBlogSetup = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      const blogUrl = user?.user_metadata?.blog_url;
      setBlogUrl(blogUrl || null);
    } catch (error) {
      console.error("Error checking blog setup:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = (newBlogUrl: string) => {
    setBlogUrl(newBlogUrl);
  };

  const handlePostAdded = () => {
    console.log("Post added successfully");
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {blogUrl ? (
          <View style={styles.blogContent}>
            <ThemedText>Your blog is live at:</ThemedText>
            <ThemedText style={styles.blogUrl}>{blogUrl}</ThemedText>
            <AddBlogPost onPostAdded={handlePostAdded} />
          </View>
        ) : (
          <GithubSetupBlog onSetupComplete={handleSetupComplete} />
        )}
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  blogContent: {
    flex: 1,
    padding: 20,
  },
  blogUrl: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: "bold",
  },
});

export default PostsScreen;
