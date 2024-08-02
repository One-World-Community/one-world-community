import React from "react";
import { Stack } from "expo-router";
import { StyleSheet, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from 'expo-linear-gradient';

export default function AuthLayout() {
  return (
    <LinearGradient
      colors={['#ffffff', '#f0f0f0']}
      style={styles.backgroundGradient}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>The One World Community</Text>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  backgroundGradient: {
    flex: 1,
    width: "100%",
  },
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});