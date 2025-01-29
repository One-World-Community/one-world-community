import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const CommunityFavorite = ({ favorite }: { favorite: { title: string; author: string } }) => (
  <ThemedView style={styles.container}>
    <ThemedText style={styles.title}>{favorite.title}</ThemedText>
    <ThemedText style={styles.author}>{favorite.author}</ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: "#666",
  },
});

export default CommunityFavorite;
