import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
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
    // Optionally refresh the blog or update state here
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
    <ScrollView>
      <ThemedView style={styles.container}>
        {blogUrl ? (
          <View>
            <ThemedText>Your blog is live at:</ThemedText>
            <ThemedText style={styles.blogUrl}>{blogUrl}</ThemedText>
            <AddBlogPost onPostAdded={handlePostAdded} />
          </View>
        ) : (
          <GithubSetupBlog onSetupComplete={handleSetupComplete} />
        )}
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  blogUrl: {
    marginTop: 10,
    marginBottom: 20,
    fontWeight: "bold",
  },
});

export default PostsScreen;
