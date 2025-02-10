import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';

interface Topic {
  id: number;
  title: string;
  description: string | null;
}

interface TopicSelectorProps {
  onTopicSelect?: (topicId: number) => void;
  selectedTopicId?: number;
}

export default function TopicSelector({ onTopicSelect, selectedTopicId }: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('title');
      
      if (error) throw error;
      setTopics(data || []);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {topics.map(topic => (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.topicChip,
              selectedTopicId === topic.id && styles.selectedChip
            ]}
            onPress={() => onTopicSelect?.(topic.id)}
          >
            <ThemedText 
              style={[
                styles.topicText,
                selectedTopicId === topic.id && styles.selectedText
              ]}
            >
              {topic.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  selectedChip: {
    backgroundColor: '#000',
  },
  topicText: {
    fontSize: 16,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
});
