import React from "react";
import { View, StyleSheet, Button, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase"; // Make sure this path is correct

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/auth/sign-in");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>
      <View style={styles.settingsContainer}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <Button
          title="Edit Profile"
          onPress={() => {
            /* Add edit profile logic */
          }}
        />
        <Button
          title="Change Password"
          onPress={() => {
            /* Add change password logic */
          }}
        />

        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
        <Button
          title="Notification Settings"
          onPress={() => {
            /* Add notification settings logic */
          }}
        />
        <Button
          title="Privacy Settings"
          onPress={() => {
            /* Add privacy settings logic */
          }}
        />

        <ThemedText style={styles.sectionTitle}>Support</ThemedText>
        <Button
          title="Help Center"
          onPress={() => {
            /* Add help center logic */
          }}
        />
        <Button
          title="Contact Us"
          onPress={() => {
            /* Add contact us logic */
          }}
        />

        <View style={styles.logoutButtonContainer}>
          <Button title="Log Out" onPress={handleLogout} color="#ff6347" />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  settingsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  logoutButtonContainer: {
    marginTop: 30,
  },
});
