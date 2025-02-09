import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { supabase } from '@/lib/supabase';

interface Topic {
  id: number;
  title: string;
  description: string | null;
}

interface TopicSelectorProps {
  onComplete?: () => void;
}

export default function TopicSelector({ onComplete }: TopicSelectorProps) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
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

  const toggleTopic = (topicId: number) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, topicId];
    });
  };

  const handleContinue = async () => {
    if (selectedTopics.length !== 3) return;

    try {
      const { error } = await supabase.from('user_topics').insert(
        selectedTopics.map(topicId => ({
          topic_id: topicId
        }))
      );

      if (error) throw error;
      onComplete?.();
    } catch (error) {
      console.error('Error saving topics:', error);
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
      <View style={styles.header}>
        <ThemedText style={styles.title}>Pick 3 interests</ThemedText>
        <ThemedText style={styles.subtitle}>
          We'll recommend publications based on your favorite topics.
        </ThemedText>
      </View>

      <View style={styles.topicsContainer}>
        {topics.map(topic => (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.topicChip,
              selectedTopics.includes(topic.id) && styles.selectedChip
            ]}
            onPress={() => toggleTopic(topic.id)}
            disabled={selectedTopics.length >= 3 && !selectedTopics.includes(topic.id)}
          >
            <ThemedText 
              style={[
                styles.topicText,
                selectedTopics.includes(topic.id) && styles.selectedText
              ]}
            >
              {topic.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedTopics.length !== 3 && styles.disabledButton
        ]}
        onPress={handleContinue}
        disabled={selectedTopics.length !== 3}
      >
        <ThemedText style={styles.continueText}>Continue</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  topicChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginBottom: 10,
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
  continueButton: {
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
