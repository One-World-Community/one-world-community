import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";

const TopicChip = ({ topic }) => (
  <TouchableOpacity style={styles.chip}>
    <ThemedText style={styles.chipText}>{topic}</ThemedText>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  chip: {
    backgroundColor: "#eee",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
});

export default TopicChip;
