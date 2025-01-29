import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

export interface GitHubConnectCardProps {
  onConnectComplete: () => void;
}

const GitHubConnectCard: React.FC<GitHubConnectCardProps> = ({ onConnectComplete }) => {
  const [isConnected, setIsConnected] = useState(false);
  const iconColor = useThemeColor({}, 'text');

  useEffect(() => {
    checkGitHubConnection();
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      // Check for GitHub token in identities or provider_token
      const hasGitHub = user?.identities?.some(identity => identity.provider === 'github') 
        || !!user?.app_metadata?.provider_token 
        || user?.app_metadata?.provider === 'github';
        
      setIsConnected(hasGitHub);
    } catch (error) {
      console.error("Error checking GitHub connection:", error);
    }
  };

  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          scopes: 'repo',
          redirectTo: Platform.select({
            web: process.env.NODE_ENV === 'development' 
              ? 'http://localhost:3000/auth/callback'
              : `${window.location.origin}`,
            default: 'oneworldcommunity://auth/callback'
          }),
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      
      // Wait for the session to be established
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        throw new Error("Failed to get GitHub token");
      }
      
      await checkGitHubConnection();
      onConnectComplete();
    } catch (error) {
      console.error("Error connecting to GitHub:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsConnected(false);
    } catch (error) {
      console.error("Error disconnecting from GitHub:", error);
    }
  };

  return (
    <ThemedView style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons name="logo-github" size={24} color={iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title}>GitHub Integration</ThemedText>
        <ThemedText style={styles.description}>
          {isConnected
            ? "Your GitHub account is connected. You can now use GitHub features in the app."
            : "Connect your GitHub account to enable GitHub-related features."}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.button, isConnected ? styles.revokeButton : styles.connectButton]}
        onPress={isConnected ? handleDisconnect : handleConnect}
      >
        <ThemedText style={styles.buttonText}>
          {isConnected ? "Disconnect" : "Connect"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  iconContainer: {
    marginRight: 16,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  connectButton: {
    backgroundColor: "#007AFF",
  },
  revokeButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default GitHubConnectCard;