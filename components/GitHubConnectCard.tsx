import React, { useState, useEffect } from "react";
import { View, Button, Alert, Platform } from "react-native";
import { supabase } from "@/lib/supabase";
import * as WebBrowser from "expo-web-browser";
import { useAuthRequest, revokeAsync, ResponseType } from "expo-auth-session";
import * as AuthSession from "expo-auth-session";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://github.com/login/oauth/authorize",
  tokenEndpoint: "https://github.com/login/oauth/access_token",
  revocationEndpoint: `https://github.com/settings/connections/applications/${process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID}`,
};

export default function GitHubConnectCard() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [response, setResponse] = useState(null);

  const redirectUri = "https://auth.expo.io/@one-world-community/one-world-community";

  console.log("Using Redirect URI:", redirectUri);

  const [request, _, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
      scopes: ["repo"],
      redirectUri,
      responseType: ResponseType.Code,
    },
    discovery,
    {
      useProxy: true,
      projectNameForProxy: "@one-world-community/one-world-community",
    },
  );

  console.log("Auth request object:", JSON.stringify(request, null, 2));

  useEffect(() => {
    console.log("Auth response:", JSON.stringify(response, null, 2));
    if (response?.type === "success") {
      const { code } = response.params;
      console.log("Received authorization code:", code);
      exchangeCodeForToken(code);
    } else if (response?.type === "error") {
      console.error("Auth error:", response.error);
      console.error("Full response:", JSON.stringify(response, null, 2));
    }
  }, [response]);

  const exchangeCodeForToken = async (code) => {
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
        console.log("Received access token:", tokenData.access_token);
        handleGitHubToken(tokenData.access_token);
      } else {
        console.error("Error exchanging code for token:", tokenData);
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
    }
  };

  const handleGitHubToken = async (access_token) => {
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { github_access_token: access_token },
      });
      if (updateError) throw updateError;
      setIsConnected(true);
      Alert.alert("Success", "GitHub account connected successfully!");
    } catch (error) {
      console.error("Error in handleGitHubToken:", error);
      Alert.alert("Error", "Failed to connect GitHub account. Please try again.");
    }
  };

  const initiateGitHubOAuth = async () => {
    setIsConnecting(true);
    try {
      console.log("Starting OAuth flow with options:", {
        clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID,
        redirectUri,
        scopes: ["repo"],
      });

      const result = await promptAsync();
      console.log("OAuth result:", JSON.stringify(result, null, 2));
      if (result.type === "success") {
        setResponse(result);
        console.log("OAuth flow successful");
      } else {
        console.log("OAuth flow unsuccessful. Full result:", JSON.stringify(result, null, 2));
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

      if (response?.params?.access_token) {
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
