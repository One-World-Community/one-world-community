import React from "react";
import { Alert, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { supabase } from "@/lib/supabase";
import GitHubConnectCard from "@/components/GitHubConnectCard";
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from "@/hooks/useThemeColor";

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface SettingItemProps {
  title: string;
  icon: IconName;
  onPress: () => void;
}

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.replace("/auth/sign-in");
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unknown error occurred");
      }
    }
  };

  const SettingItem: React.FC<SettingItemProps> = ({ title, icon, onPress }) => {
    const iconColor = useThemeColor({}, 'text');
    return (
      <TouchableOpacity style={styles.settingItem} onPress={onPress}>
        <Ionicons name={icon} size={24} color={iconColor} style={styles.icon} />
        <ThemedText style={styles.settingText}>{title}</ThemedText>
        <Ionicons name="chevron-forward" size={24} color={iconColor} style={styles.chevron} />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>
      <ScrollView style={styles.settingsContainer}>
        <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        <SettingItem title="Edit Profile" icon="person-outline" onPress={() => {/* Add edit profile logic */}} />
        <SettingItem title="Change Password" icon="lock-closed-outline" onPress={() => {/* Add change password logic */}} />

        <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
        <SettingItem title="Notification Settings" icon="notifications-outline" onPress={() => {/* Add notification settings logic */}} />
        <SettingItem title="Privacy Settings" icon="shield-outline" onPress={() => {/* Add privacy settings logic */}} />

        <ThemedText style={styles.sectionTitle}>Integrations</ThemedText>
        <GitHubConnectCard onConnectComplete={() => {}} />

        <ThemedText style={styles.sectionTitle}>Support</ThemedText>
        <SettingItem title="Help Center" icon="help-circle-outline" onPress={() => {/* Add help center logic */}} />
        <SettingItem title="Contact Us" icon="mail-outline" onPress={() => {/* Add contact us logic */}} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutText}>Log Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  icon: {
    marginRight: 15,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
  chevron: {
    opacity: 0.5,
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#ff6347',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});