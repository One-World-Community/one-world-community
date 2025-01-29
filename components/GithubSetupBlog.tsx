import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, Button, ActivityIndicator, TextInput, Platform, Modal, View, ScrollView } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import * as WebBrowser from "expo-web-browser";
import * as Clipboard from "expo-clipboard";
import { supabase } from "@/lib/supabase";
import GitHubConnectCard from "@/components/GitHubConnectCard";
import {
  getAuthenticatedUser,
  createRepoFromTemplate,
  enableGitHubPages,
  checkWorkflowStatus,
  getPagesUrl,
  getTemplates,
  enableActionsForRepo,
  updateUserMetadata,
} from "@/lib/github-api";

// Define interfaces for the CustomAlert props and button type
interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: { text: string; onPress: () => void }[];
  onDismiss: () => void;
}

interface Template {
  name: string;
  value: string;
}

// Custom alert component that works on both web and mobile
const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, buttons, onDismiss }) => {
  useEffect(() => {
    if (Platform.OS === "web" && visible) {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result && buttons && buttons.length > 0) {
        const lastButton = buttons[buttons.length - 1];
        if (lastButton.onPress) {
          lastButton.onPress();
        }
      }
      onDismiss();
    }
  }, [visible, title, message, buttons, onDismiss]);

  if (Platform.OS === "web") {
    return null;
  }

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onDismiss}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <ThemedText style={styles.modalTitle}>{title}</ThemedText>
          <ThemedText style={styles.modalText}>{message}</ThemedText>
          {buttons.map((button, index) => (
            <Button
              key={index}
              title={button.text}
              onPress={() => {
                button.onPress();
                onDismiss();
              }}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
};

interface GithubSetupBlogProps {
  onSetupComplete: (blogUrl: string) => void;
}

const GithubSetupBlog: React.FC<GithubSetupBlogProps> = ({ onSetupComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [blogName, setBlogName] = useState("");
  const [blogDescription, setBlogDescription] = useState("");
  const [status, setStatus] = useState("");
  const [alertConfig, setAlertConfig] = useState<CustomAlertProps>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
    onDismiss: () => {},
  });
  const [hasGitHubToken, setHasGitHubToken] = useState<boolean | null>(null);

  useEffect(() => {
    checkGitHubToken();
    loadTemplates();
  }, []);

  const checkGitHubToken = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      const githubToken = user?.user_metadata?.github_access_token;
      setHasGitHubToken(!!githubToken);
    } catch (error) {
      console.error("Error checking GitHub token:", error);
      setHasGitHubToken(false);
    }
  };

  const handleGitHubConnect = () => {
    checkGitHubToken();
  };

  const loadTemplates = async () => {
    try {
      const templateList = await getTemplates();
      setTemplates(templateList);
      if (templateList.length > 0) {
        setSelectedTemplate(templateList[0].value);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
      showAlert("Error", "Failed to load blog templates. Please try again later.", [
        { text: "OK", onPress: () => {} },
      ]);
    }
  };

  // Custom alert function
  const showAlert = useCallback(
    (title: string, message: string, buttons: { text: string; onPress: () => void }[]) => {
      setAlertConfig({ visible: true, title, message, buttons, onDismiss: () => {} });
    },
    []
  );

  const setupBlog = async () => {
    if (!blogName.trim()) {
      showAlert("Error", "Please enter a name for your blog.", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    if (!selectedTemplate) {
      showAlert("Error", "Please select a template for your blog.", [
        { text: "OK", onPress: () => {} },
      ]);
      return;
    }

    try {
      setIsLoading(true);
      setStatus("Starting blog setup...");

      const userInfo = await getAuthenticatedUser();
      setStatus("User authenticated. Creating repository...");

      const [templateOwner, templateRepo] = selectedTemplate.split("/");
      const newRepoName = blogName.trim().toLowerCase().replace(/\s+/g, "-");
      const newRepo = await createRepoFromTemplate(
        templateOwner,
        templateRepo,
        newRepoName,
        blogDescription.trim() || "My personal blog created from a template",
      );
      setStatus("Repository created. Enabling GitHub Actions...");

      try {
        await enableActionsForRepo(newRepo.owner.login, newRepo.name);
        setStatus("GitHub Actions enabled. Setting up GitHub Pages...");
      } catch (actionsError) {
        console.error("Error enabling GitHub Actions:", actionsError);
        setStatus("Warning: Failed to enable GitHub Actions. Continuing setup...");
      }

      await enableGitHubPages(newRepo.owner.login, newRepo.name);
      setStatus("GitHub Pages enabled. Waiting for deployment...");

      let workflowResult;
      do {
        workflowResult = await checkWorkflowStatus(newRepo.owner.login, newRepo.name);
        console.log("Workflow result:", workflowResult);
        setStatus(`Deployment status: ${workflowResult.status}`);
        if (workflowResult.status === "in_progress") {
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking again
        }
      } while (workflowResult.status === "in_progress");

      if (workflowResult.status === "success") {
        setStatus("Deployment successful. Retrieving blog URL...");
        const pagesUrl = await getPagesUrl(newRepo.owner.login, newRepo.name);
        console.log("Pages URL:", pagesUrl);

        if (pagesUrl) {
          setStatus("Updating user metadata...");
          await updateUserMetadata(pagesUrl);
          setStatus("Blog setup completed successfully!");
          onSetupComplete(pagesUrl);
          const openBlog = () => WebBrowser.openBrowserAsync(pagesUrl);
          showAlert("Success", "Your blog is now live!", [
            {
              text: "View Blog",
              onPress: openBlog,
            },
            {
              text: "Copy URL",
              onPress: () => {
                Clipboard.setStringAsync(pagesUrl);
                openBlog();
              },
            },
            {
              text: "OK",
              onPress: openBlog,
            },
          ]);
        } else {
          setStatus("Blog created, but URL not available yet.");
          const expectedUrl = `https://${newRepo.owner.login}.github.io/${newRepo.name}`;
          showAlert(
            "Blog Created",
            "Your blog has been set up, but the URL is not available yet. You can try accessing it later.",
            [
              {
                text: "Copy Expected URL",
                onPress: () => Clipboard.setStringAsync(expectedUrl),
              },
              { text: "OK", onPress: () => {} },
            ],
          );
        }
      } else if (workflowResult.status === "failure") {
        setStatus("Deployment failed.");
        const openActionsTab = () =>
          WebBrowser.openBrowserAsync(`https://github.com/${newRepo.owner.login}/${newRepo.name}/actions`);
        showAlert(
          "Warning",
          "Blog created, but the deployment failed. Please check the repository's Actions tab for more information.",
          [
            {
              text: "Open Actions Tab",
              onPress: openActionsTab,
            },
            {
              text: "OK",
              onPress: openActionsTab,
            },
          ],
        );
      } else {
        setStatus("Deployment status unknown.");
        const repoUrl = `https://github.com/${newRepo.owner.login}/${newRepo.name}`;
        const openRepo = () => WebBrowser.openBrowserAsync(repoUrl);
        showAlert(
          "Warning",
          "Blog created, but the deployment status is unknown. Please check the repository for more information.",
          [
            {
              text: "Open Repository",
              onPress: openRepo,
            },
            {
              text: "OK",
              onPress: openRepo,
            },
          ],
        );
      }
    } catch (error: unknown) {
      console.error("Error setting up blog:", error);
      setStatus("Error occurred during setup.");
      showAlert("Error", `Failed to set up blog: ${error instanceof Error ? error.message : "Unknown error"}`, [
        { text: "OK", onPress: () => {} },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasGitHubToken === null) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <ThemedText>Checking GitHub connection...</ThemedText>
      </ThemedView>
    );
  }

  if (!hasGitHubToken) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Connect your GitHub account to set up your blog</ThemedText>
        <GitHubConnectCard onConnectComplete={handleGitHubConnect} />
      </ThemedView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Set Up Your Blog</ThemedText>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedTemplate}
            onValueChange={(itemValue: string) => setSelectedTemplate(itemValue)}
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

        {isLoading ? (
          <>
            <ActivityIndicator size="large" color="#0000ff" />
            <ThemedText style={styles.statusText}>{status}</ThemedText>
          </>
        ) : (
          <Button title="Set up your blog" onPress={setupBlog} disabled={isLoading} />
        )}

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onDismiss={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        />
      </ThemedView>
    </ScrollView>
  );
};

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
  statusText: {
    marginTop: 10,
    textAlign: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

export default GithubSetupBlog;