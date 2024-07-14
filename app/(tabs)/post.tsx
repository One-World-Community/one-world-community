import React, { useState, useEffect } from "react";
import { StyleSheet, Button, ActivityIndicator, TextInput, Alert, ScrollView, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import {
  getAuthenticatedUser,
  createRepoFromTemplate,
  enableGitHubPages,
  checkGitHubPagesStatus,
  getTemplates,
  enableActionsForRepo,
} from "@/lib/github-api";

export default function PostsScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnablingPages, setIsEnablingPages] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [blogName, setBlogName] = useState("");
  const [blogDescription, setBlogDescription] = useState("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templateList = await getTemplates();
      setTemplates(templateList);
      if (templateList.length > 0) {
        setSelectedTemplate(templateList[0].value);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      Alert.alert("Error", "Failed to load blog templates. Please try again later.");
    }
  };

  const setupBlog = async () => {
    if (!blogName.trim()) {
      Alert.alert("Error", "Please enter a name for your blog.");
      return;
    }

    if (!selectedTemplate) {
      Alert.alert("Error", "Please select a template for your blog.");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Blog setup started");

      const userInfo = await getAuthenticatedUser();
      console.log("User info retrieved. Username:", userInfo.login);

      const [templateOwner, templateRepo] = selectedTemplate.split("/");
      const newRepoName = blogName.trim().toLowerCase().replace(/\s+/g, "-");
      const newRepo = await createRepoFromTemplate(
        templateOwner,
        templateRepo,
        newRepoName,
        blogDescription.trim() || "My personal blog created from a template",
      );
      console.log("Repository created successfully from template. New repo name:", newRepo.name);

      try {
        await enableActionsForRepo(newRepo.owner.login, newRepo.name);
        console.log("GitHub Actions enabled for the repository");
      } catch (actionsError) {
        console.error("Error enabling GitHub Actions:", actionsError);
      }

      setIsLoading(false);
      setIsEnablingPages(true);

      try {
        await enableGitHubPages(newRepo.owner.login, newRepo.name);
        console.log("GitHub Pages enabled and configured to deploy from Actions workflow");

        const isPagesBulit = await checkGitHubPagesStatus(newRepo.owner.login, newRepo.name);

        const blogUrl = `https://${newRepo.owner.login}.github.io/${newRepo.name}`;
        console.log("Blog setup completed. URL:", blogUrl);

        if (isPagesBulit) {
          Alert.alert("Success", "Your blog has been set up and deployed successfully!", [
            {
              text: "View Blog",
              onPress: () => WebBrowser.openBrowserAsync(blogUrl),
            },
            { text: "OK" },
          ]);
        } else {
          Alert.alert(
            "Blog Created",
            "Your blog has been set up and GitHub Pages has been enabled. However, it may take a few minutes for the site to be live. You can check the URL later.",
            [
              {
                text: "Copy URL",
                onPress: () => Clipboard.setStringAsync(blogUrl),
              },
              { text: "OK" },
            ],
          );
        }
      } catch (error) {
        console.error("Error with GitHub Pages:", error);
        Alert.alert(
          "Warning",
          "Blog created, but there was an issue enabling GitHub Pages. You may need to set it up manually in your repository settings.",
          [
            {
              text: "Open Repository Settings",
              onPress: () =>
                WebBrowser.openBrowserAsync(`https://github.com/${newRepo.owner.login}/${newRepo.name}/settings/pages`),
            },
            { text: "OK" },
          ],
        );
      }
    } catch (error) {
      console.error("Error setting up blog:", error);
      Alert.alert("Error", `Failed to set up blog: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsEnablingPages(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Set Up Your Blog</ThemedText>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTemplate}
            onValueChange={(itemValue) => setSelectedTemplate(itemValue)}
            style={styles.picker}
          >
            {templates.map((template, index) => (
              <Picker.Item key={index} label={template.name} value={template.value} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          onChangeText={setBlogName}
          value={blogName}
          placeholder="Enter your blog name"
          placeholderTextColor="#999"
        />

        <TextInput
          style={[styles.input, styles.multilineInput]}
          onChangeText={setBlogDescription}
          value={blogDescription}
          placeholder="Enter a brief description of your blog"
          placeholderTextColor="#999"
          multiline
        />

        {isLoading || isEnablingPages ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Set up your blog" onPress={setupBlog} disabled={isLoading || isEnablingPages} />
        )}

        {isEnablingPages && <ThemedText>Enabling GitHub Pages... This may take a moment.</ThemedText>}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    width: "80%",
    backgroundColor: "#f9f9f9",
    color: "#000",
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    width: "80%",
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  picker: {
    width: "100%",
    color: "#000",
  },
});
