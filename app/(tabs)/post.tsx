import React, { useState, useEffect } from "react";
import { StyleSheet, ScrollView, View, Linking, TouchableOpacity } from "react-native";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import GithubSetupBlog from "@/components/GithubSetupBlog";
import AddBlogPost from "@/components/AddBlogPost";
import { TabScreenLayout } from '@/components/layouts/TabScreenLayout';

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

  const handleUrlPress = () => {
    if (blogUrl) {
      Linking.openURL(blogUrl).catch((err) => console.error("Error opening URL:", err));
    }
  };

  if (isLoading) {
    return (
      <TabScreenLayout>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </ThemedView>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {blogUrl ? (
            <View style={styles.blogContent}>
              <ThemedText style={styles.headerText}>Your blog is live at:</ThemedText>
              <TouchableOpacity onPress={handleUrlPress}>
                <ThemedText style={styles.blogUrl}>{blogUrl}</ThemedText>
              </TouchableOpacity>
              <AddBlogPost onPostAdded={handlePostAdded} />
            </View>
          ) : (
            <GithubSetupBlog onSetupComplete={handleSetupComplete} />
          )}
        </ScrollView>
      </ThemedView>
    </TabScreenLayout>
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
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
  },
  headerText: {
    fontSize: 20,
    marginBottom: 10,
  },
});

export default PostsScreen;
