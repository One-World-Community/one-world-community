import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import GithubSetupBlog from "@/components/GithubSetupBlog";

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

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {blogUrl ? (
        <View>
          <ThemedText>Your blog is live at:</ThemedText>
          <ThemedText style={styles.blogUrl}>{blogUrl}</ThemedText>
          {/* Add components for managing blog posts here */}
        </View>
      ) : (
        <GithubSetupBlog onSetupComplete={handleSetupComplete} />
      )}
    </ThemedView>
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
    fontWeight: "bold",
  },
});

export default PostsScreen;
