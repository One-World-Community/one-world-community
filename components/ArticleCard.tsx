import React from "react";
import { StyleSheet, View, Image, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";

const ArticleCard = ({ article, isWeb, isSmallScreen }) => {
  return (
    <ThemedView
      style={[
        styles.card,
        isWeb && !isSmallScreen && styles.webCard,
        Platform.OS === "ios" && styles.iosShadow,
        Platform.OS === "android" && styles.androidElevation,
      ]}
    >
      {article.image && (
        <Image source={{ uri: article.image }} style={isWeb && !isSmallScreen ? styles.webImage : styles.image} />
      )}
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          {article.title}
        </ThemedText>
        <ThemedText numberOfLines={2} style={styles.description}>
          {article.description}
        </ThemedText>
        <View style={styles.meta}>
          <ThemedText style={styles.metaText}>
            {article.author} · {article.date} · {article.readTime} · {article.views} views
          </ThemedText>
          <Ionicons name="bookmark-outline" size={24} color="#000" />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  webCard: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  image: {
    width: "100%",
    height: 200,
  },
  webImage: {
    width: 200,
    height: 200,
  },
  content: {
    padding: 12,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#888",
  },
  iosShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  androidElevation: {
    elevation: 3,
  },
});

export default ArticleCard;
