import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, Platform, useWindowDimensions, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedView } from "@/components/ThemedView";
import ArticleCard from "@/components/ArticleCard";
import { TabScreenLayout } from '@/components/layouts/TabScreenLayout';
import { supabase } from '@/lib/supabase';
import TopicSelector from '@/components/TopicSelector';

// Placeholder data for articles
const articles = [
  {
    id: "1",
    title: "The Future of AI in Healthcare",
    description:
      "Artificial Intelligence is revolutionizing the healthcare industry. From diagnosis to treatment, AI is making significant strides.",
    image:
      "https://plus.unsplash.com/premium_photo-1677269465314-d5d2247a0b0c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YWl8ZW58MHx8MHx8fDA%3D",
    author: "John Doe",
    date: "May 11",
    readTime: "3 min read",
    views: "3.4K",
  },
  {
    id: "2",
    title: "SpaceX Successfully Launches Starship",
    description:
      "In a historic moment for space exploration, SpaceX has successfully launched and landed its Starship spacecraft.",
    image:
      "https://plus.unsplash.com/premium_photo-1688575552472-45b0aa670f1e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c3RhcnNoaXB8ZW58MHx8MHx8fDA%3D",
    author: "Jane Smith",
    date: "Jan 8",
    readTime: "5 min read",
    views: "3.9K",
  },
  {
    id: "3",
    title: "The Rise of Sustainable Fashion",
    description:
      "More fashion brands are embracing sustainability, using eco-friendly materials and ethical production methods.",
    author: "Alex Johnson",
    date: "Feb 9",
    readTime: "4 min read",
    views: "11.1K",
  },
  // Add more placeholder articles as needed
];

interface Article {
  id: string;
  title: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  views: string;
  image?: string;
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { width } = useWindowDimensions();
  const [hasInterests, setHasInterests] = useState<boolean | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<number | undefined>(undefined);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isWeb = Platform.OS === "web";
  const isSmallScreen = width < 768;

  const renderContent = () => (
    <>
      <ThemedView style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search articles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </ThemedView>

      <TopicSelector 
        onTopicSelect={handleTopicSelect}
        selectedTopicId={selectedTopicId}
      />

      {articles.map((item) => (
        <ArticleCard key={item.id} article={item} isWeb={isWeb} isSmallScreen={isSmallScreen} />
      ))}
    </>
  );

  useEffect(() => {
    checkUserInterests();
  }, []);

  const checkUserInterests = async () => {
    try {
      const { count, error } = await supabase
        .from('user_topics')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      setHasInterests((count ?? 0) > 0);
    } catch (error) {
      console.error('Error checking user interests:', error);
    }
  };

  const handleTopicSelect = async (topicId: number) => {
    setSelectedTopicId(topicId);
    await fetchArticlesForTopic(topicId);
  };

  const fetchArticlesForTopic = async (topicId: number) => {
    setIsLoading(true);
    try {
      // Fetch articles related to the selected topic
      const { data, error } = await supabase
        .from('feeds')
        .select('*')
        .eq('topic_id', topicId);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasInterests === null) {
    return null; // or loading state
  }

  return (
    <TabScreenLayout>
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {isWeb && !isSmallScreen ? (
            <View style={styles.webContainer}>
              <View style={styles.webMainContent}>
                {isLoading ? (
                  <ActivityIndicator style={styles.loader} />
                ) : (
                  renderContent()
                )}
              </View>
            </View>
          ) : (
            isLoading ? (
              <ActivityIndicator style={styles.loader} />
            ) : (
              renderContent()
            )
          )}
        </ScrollView>
      </ThemedView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  webContainer: {
    flexDirection: "row",
    flex: 1,
  },
  webMainContent: {
    flex: 1,
    marginRight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});