import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventProps {
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  onAccept: () => void;
  onReject: () => void;
}

const { width, height } = Dimensions.get('window');

const EventCard: React.FC<EventProps> = ({
  title,
  date,
  location,
  imageUrl,
  onAccept,
  onReject,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: imageUrl }} style={styles.image} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.iconTextContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" style={styles.icon} />
            <Text style={styles.date}>{date}</Text>
          </View>
          <View style={styles.iconTextContainer}>
            <Ionicons name="location-outline" size={16} color="#666" style={styles.icon} />
            <Text style={styles.location}>{location}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={onReject}>
            <Ionicons name="close-circle" size={40} color="#ff6b6b" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onAccept}>
            <Ionicons name="checkmark-circle" size={40} color="#4ecdc4" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width - 40,
    height: height * 0.6,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '50%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  icon: {
    marginRight: 5,
  },
  date: {
    fontSize: 16,
    color: '#666',
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    padding: 10,
  },
});

export default EventCard;