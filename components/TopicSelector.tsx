import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Topic {
  id: string;
  name: string;
}

const topics: Topic[] = [
  { id: '1', name: 'Technology' },
  { id: '2', name: 'Science' },
  { id: '3', name: 'Art' },
  { id: '4', name: 'Music' },
  { id: '5', name: 'Sports' },
  // Add more topics as needed
];

export function TopicSelector() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const toggleTopic = (topicId: string) => {
    setSelectedTopics(prevSelected =>
      prevSelected.includes(topicId)
        ? prevSelected.filter(id => id !== topicId)
        : [...prevSelected, topicId]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select topics you're interested in:</Text>
      <View style={styles.topicContainer}>
        {topics.map(topic => (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.topicButton,
              selectedTopics.includes(topic.id) && styles.selectedTopic
            ]}
            onPress={() => toggleTopic(topic.id)}
          >
            <Text style={styles.topicText}>{topic.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  topicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  topicButton: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    margin: 4,
    borderRadius: 16,
  },
  selectedTopic: {
    backgroundColor: '#007AFF',
  },
  topicText: {
    color: 'black',
  },
});
