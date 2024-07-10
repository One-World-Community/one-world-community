import React, { useState, useEffect } from "react";
import { View, Button, Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { useAuthRequest } from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export default function GitHubConnectCard() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Always use the Expo authentication URI
  const redirectUri = "https://auth.expo.io/@one-world-community/one-world-community";

  console.log("Redirect URI:", redirectUri);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
      scopes: ["repo"],
      redirectUri,
    },
    discovery,
  );

  useEffect(() => {
    console.log("Auth response:", response);
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("Received code:", code);
      handleGitHubCode(code);
    } else if (response?.type === "error") {
      console.error("Auth error:", response.error);
    }
  }, [response]);

  const handleGitHubCode = async (code) => {
    try {
      console.log("Handling GitHub code", { code, redirectUri });
      const { data, error } = await supabase.functions.invoke("github-oauth", {
        body: JSON.stringify({ code, redirectUri }),
      });
      console.log("Supabase function response:", { data, error });
      if (error) throw error;
      const { error: updateError } = await supabase.auth.updateUser({
        data: { github_access_token: data.access_token },
      });
      if (updateError) throw updateError;
      setIsConnected(true);
      Alert.alert("Success", "GitHub account connected successfully!");
    } catch (error) {
      console.error("Error in handleGitHubCode:", error);
      Alert.alert("Error", "Failed to connect GitHub account. Please try again.");
    }
  };

  const initiateGitHubOAuth = async () => {
    setIsConnecting(true);
    try {
      const result = await promptAsync();
      if (result.type !== "success") throw new Error("GitHub OAuth flow was not successful");
    } catch (error) {
      console.error("Error in initiateGitHubOAuth:", error);
      Alert.alert("Error", "Failed to connect GitHub account. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const revokeAuthentication = async () => {
    try {
      // Clear Expo's auth session
      await AuthSession.revokeAsync({ token: "token" }, discovery);

      // Dismiss the browser to ensure it's fully closed
      await WebBrowser.dismissBrowser();

      // Remove the GitHub access token from Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: { github_access_token: null },
      });

      if (error) throw error;

      setIsConnected(false);
      Alert.alert("Success", "GitHub authentication revoked!");
    } catch (error) {
      console.error("Error in revokeAuthentication:", error);
      Alert.alert("Error", "Failed to revoke authentication. Please try again.");
    }
  };

  return (
    <View>
      <Button
        title={isConnecting ? "Connecting..." : "Connect GitHub"}
        onPress={initiateGitHubOAuth}
        disabled={isConnecting || !request}
      />
      <Button title="Revoke Authentication" onPress={revokeAuthentication} disabled={isConnecting} />
    </View>
  );
}
