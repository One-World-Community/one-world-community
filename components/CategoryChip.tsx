import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const CategoryChip = ({ category, isSelected, onToggle }) => (
  <TouchableOpacity onPress={onToggle} style={styles.touchable}>
    <ThemedView style={[styles.chip, isSelected && styles.selectedChip]}>
      <ThemedText style={[styles.chipText, isSelected && styles.selectedChipText]}>{category}</ThemedText>
    </ThemedView>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  touchable: {
    marginRight: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectedChip: {
    backgroundColor: "#007AFF",
  },
  chipText: {
    fontSize: 14,
    color: "#333",
  },
  selectedChipText: {
    color: "#fff",
  },
});

export default CategoryChip;
