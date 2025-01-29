import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, revokeAsync, ResponseType, AuthSessionResult } from "expo-auth-session";
import * as AuthSession from "expo-auth-session";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "@/hooks/useThemeColor";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export interface GitHubConnectCardProps {
  onConnectComplete: () => void;
}

const GitHubConnectCard: React.FC<GitHubConnectCardProps> = ({ onConnectComplete }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [response, setResponse] = useState<AuthSessionResult | null>(null);

  const iconColor = useThemeColor({}, 'text');

  useEffect(() => {
    checkGitHubToken();
  }, []);

  const checkGitHubToken = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      const githubToken = user?.user_metadata?.github_access_token;
      setIsConnected(!!githubToken);
    } catch (error) {
      console.error("Error checking GitHub token:", error);
    }
  };

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'oneworldcommunity'
  });

  const [, , promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID || 'Ov23liLmQRk3xXi9PeKz',
      scopes: ["repo"],
      redirectUri,
      responseType: ResponseType.Code,
    },
    discovery
  );

  const handleGitHubToken = useCallback(async (access_token: string) => {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { github_access_token: access_token },
      });
      if (updateError) throw updateError;
      setIsConnected(true);
      Alert.alert("Success", "GitHub account connected successfully!");
      onConnectComplete();
    } catch (error) {
      console.error("Error in handleGitHubToken:", error);
      Alert.alert("Error", "Failed to connect GitHub account. Please try again.");
    }
  }, [onConnectComplete]);

  const exchangeCodeForToken = useCallback(async (code: string) => {
    try {
      const tokenResponse = await fetch(
        `https://zmvmrezwgkiksstvmlkq.supabase.co/functions/v1/github-oauth?code=${encodeURIComponent(code)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const tokenData = await tokenResponse.json();
      if (tokenData.access_token) {
        await handleGitHubToken(tokenData.access_token);
      } else {
        console.error("Error exchanging code for token:", tokenData);
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  }, [handleGitHubToken]);

  useEffect(() => {
    if (response?.type === "success") {
      const { code } = response.params;
      exchangeCodeForToken(code);
    } else if (response?.type === "error") {
      console.error("Auth error:", response.error);
    }
  }, [response, exchangeCodeForToken]);

  const initiateGitHubOAuth = async () => {
    setIsConnecting(true);
    try {
      const result = await promptAsync();
      if (result.type === "success") {
        setResponse(result);
      } else {
        throw new Error(`GitHub OAuth flow was not successful. Type: ${result.type}`);
      }
    } catch (error) {
      console.error("Detailed error in initiateGitHubOAuth:", error);
      Alert.alert("Error", "Failed to connect GitHub account. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const revokeAuthentication = async () => {
    try {
      await WebBrowser.dismissBrowser();

      const { error } = await supabase.auth.updateUser({
        data: { github_access_token: null },
      });
      if (error) throw error;

      if (response?.type === "success" && response.params?.access_token) {
        await revokeAsync(
          {
            token: response.params.access_token,
            clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
          },
          discovery,
        );
      }

      AuthSession.dismiss();

      if (Platform.OS === "ios") {
        await WebBrowser.coolDownAsync();
      }

      setIsConnected(false);
      setResponse(null);

      Alert.alert("Success", "GitHub authentication revoked and session reset!");
    } catch (error) {
      console.error("Error in revokeAuthentication:", error);
      Alert.alert("Error", "Failed to revoke authentication. Please try again.");
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
        onPress={isConnected ? revokeAuthentication : initiateGitHubOAuth}
        disabled={isConnecting}
      >
        <ThemedText style={styles.buttonText}>
          {isConnecting ? "Connecting..." : isConnected ? "Revoke" : "Connect"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

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