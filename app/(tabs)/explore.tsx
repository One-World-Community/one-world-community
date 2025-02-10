import React, { useState, useEffect } from "react";
import { StyleSheet, TextInput, View, Platform, useWindowDimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import CategoryChip from "@/components/CategoryChip";
import ArticleCard from "@/components/ArticleCard";
import CommunityFavorite from "@/components/CommunityFavorite";
import TopicChip from "@/components/TopicChip";
import { TabScreenLayout } from '@/components/layouts/TabScreenLayout';
import { supabase } from '@/lib/supabase';
import TopicSelector from '@/components/TopicSelector';

// Placeholder data for categories and articles
const categories = ["Technology", "Science", "Health", "Business", "Entertainment"];
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

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { width } = useWindowDimensions();
  const [hasInterests, setHasInterests] = useState<boolean | null>(null);

  const isWeb = Platform.OS === "web";
  const isSmallScreen = width < 768;

  const toggleCategory = (category: string) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(category) ? prevSelected.filter((c) => c !== category) : [...prevSelected, category],
    );
  };

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      {categories.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={selectedCategories.includes(category)}
          onToggle={() => toggleCategory(category)}
        />
      ))}
    </View>
  );

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

      {renderCategories()}

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

  const handleTopicSelectComplete = () => {
    setHasInterests(true);
    // Additional logic after topics are selected
  };

  if (hasInterests === null) {
    return null; // or loading state
  }

  return (
    <TabScreenLayout>
      {!hasInterests ? (
        <TopicSelector onComplete={handleTopicSelectComplete} />
      ) : (
        <ThemedView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            {isWeb && !isSmallScreen ? (
              <View style={styles.webContainer}>
                <View style={styles.webMainContent}>{renderContent()}</View>
              </View>
            ) : (
              renderContent()
            )}
          </ScrollView>
        </ThemedView>
      )}
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
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    paddingHorizontal: 16,
  },
});