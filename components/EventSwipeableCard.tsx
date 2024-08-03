import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface EventProps {
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}

const { width, height } = Dimensions.get('window');

const EventSwipeableCard: React.FC<EventProps> = ({
  title,
  date,
  location,
  imageUrl,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const translateX = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (event.translationX < -100) onSwipeLeft();
      else if (event.translationX > 100) onSwipeRight();
      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <GestureHandlerRootView>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image source={{ uri: imageUrl }} style={styles.image} />
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.date}>{date}</Text>
            <Text style={styles.location}>{location}</Text>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: height * 0.7,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 20,
  },
  image: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  infoContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
  },
  leftAction: {
    flex: 1,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
  },
  rightAction: {
    flex: 1,
    backgroundColor: '#4ecdc4',
    justifyContent: 'center',
  },
});

export default EventSwipeableCard;