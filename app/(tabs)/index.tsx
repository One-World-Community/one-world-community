import React, { useState, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import EventCard from '@/components/EventCard';

export default function HomeScreen() {
  const [events, setEvents] = useState([
    { id: '1', title: 'Tech Meetup', date: '2023-06-15', location: 'San Francisco', imageUrl: 'https://plus.unsplash.com/premium_photo-1681426687411-21986b0626a8?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dGVjaHxlbnwwfHwwfHx8MA%3D%3D' },
    { id: '2', title: 'Photography Meetup', date: '2023-07-01', location: 'New York', imageUrl: 'https://images.unsplash.com/photo-1719937206498-b31844530a96?q=80&w=3348&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '3', title: 'AI Workshop', date: '2023-07-10', location: 'London', imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWl8ZW58MHx8MHx8fDA%3D' },
  ]);

  const handleEventAction = useCallback(() => {
    setEvents(prevEvents => {
      if (prevEvents.length > 1) {
        const [firstEvent, ...restEvents] = prevEvents;
        return [...restEvents, firstEvent];
      }
      return prevEvents;
    });
  }, []);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.eventsContainer}>
        <ThemedText type="subtitle">Upcoming Events</ThemedText>
        <View style={styles.cardContainer}>
          {events.length > 0 ? (
            <EventCard
              key={events[0].id}
              title={events[0].title}
              date={events[0].date}
              location={events[0].location}
              imageUrl={events[0].imageUrl}
              onAccept={handleEventAction}
              onReject={handleEventAction}
            />
          ) : (
            <ThemedText>No events available</ThemedText>
          )}
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  eventsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});