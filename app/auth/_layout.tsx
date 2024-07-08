import React from "react";
import { Stack } from "expo-router";
import { ImageBackground, StyleSheet, View, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function AuthLayout() {
  return (
    <ImageBackground
      source={require("@/assets/images/auth-background.jpg")} // Make sure to add this image to your assets
      style={styles.backgroundImage}
    >
      <StatusBar style="light" />
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/icon.png")} // Make sure to add your logo image
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.contentContainer}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.stackContent,
            }}
          >
            <Stack.Screen name="sign-in" />
            <Stack.Screen name="sign-up" />
            <Stack.Screen name="forgot-password" />
          </Stack>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: "100%",
    backgroundColor: "#1e1e1e", // Fallback color if image fails to load
  },
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // Adds a dark overlay to make content more readable
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stackContent: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
    padding: 20,
  },
});
