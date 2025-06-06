import { supabase } from "./supabase";

const BASE_URL = "https://api.github.com";

async function getAuthToken(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  
  if (!session?.provider_token) {
    throw new Error("GitHub token not found");
  }
  
  return session.provider_token;
}

async function githubRequest(endpoint: string, method: string = "GET", body?: any) {
  const token = await getAuthToken();
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error(`GitHub API error: ${response.status} - ${JSON.stringify(responseData)}`);
    throw new Error(`GitHub API error: ${response.status} - ${JSON.stringify(responseData)}`);
  }

  return responseData;
}

export async function getAuthenticatedUser() {
  return githubRequest("/user");
}

export async function createRepoFromTemplate(
  templateOwner: string,
  templateRepo: string,
  newRepoName: string,
  description: string,
) {
  const userInfo = await getAuthenticatedUser();
  return githubRequest(`/repos/${templateOwner}/${templateRepo}/generate`, "POST", {
    owner: userInfo.login,
    name: newRepoName,
    description: description,
    private: false,
    include_all_branches: false,
  });
}

async function checkRepoReady(owner: string, repo: string): Promise<boolean> {
  try {
    await githubRequest(`/repos/${owner}/${repo}/branches`);
    return true;
  } catch (error) {
    return false;
  }
}

async function getGitHubPagesInfo(owner: string, repo: string) {
  try {
    return await githubRequest(`/repos/${owner}/${repo}/pages`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      return null; // Pages not configured yet
    }
    throw error;
  }
}

export async function enableGitHubPages(owner: string, repo: string, maxRetries = 20, delay = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    if (await checkRepoReady(owner, repo)) {
      try {
        const response = await githubRequest(`/repos/${owner}/${repo}/pages`, "POST", {
          source: {
            branch: "main",
          },
          build_type: "workflow",
        });
        console.log("GitHub Pages enabled successfully:", response);
        return response;
      } catch (error: unknown) {
        console.error("Error enabling GitHub Pages:", error);
        if (error instanceof Error && error.message.includes("409")) {
          console.log("GitHub Pages already exists. Attempting to update...");
          try {
            const updateResponse = await githubRequest(`/repos/${owner}/${repo}/pages`, "PUT", {
              source: {
                branch: "main",
              },
              build_type: "workflow",
            });
            console.log("GitHub Pages updated successfully:", updateResponse);
            return updateResponse;
          } catch (updateError) {
            console.error("Error updating GitHub Pages:", updateError);
            throw updateError;
          }
        }
        throw error;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Timeout: Repository not ready after multiple retries");
}

export async function getLatestWorkflowRun(owner: string, repo: string) {
  const response = await githubRequest(`/repos/${owner}/${repo}/actions/runs?per_page=1`);
  return response.workflow_runs && response.workflow_runs.length > 0 ? response.workflow_runs[0] : null;
}

export async function checkWorkflowStatus(
  owner: string,
  repo: string,
  maxWaitTime = 120000, // 2 minutes
  checkInterval = 5000, // 5 seconds
): Promise<{ status: "success" | "failure" | "in_progress" | "not_found"; details: any }> {
  const startTime = Date.now();

  while (Date.now() - startTime < maxWaitTime) {
    const latestRun = await getLatestWorkflowRun(owner, repo);

    if (latestRun) {
      console.log(`Workflow status: ${latestRun.status}, conclusion: ${latestRun.conclusion}`);

      if (latestRun.status === "completed") {
        return {
          status: latestRun.conclusion === "success" ? "success" : "failure",
          details: latestRun,
        };
      } else if (latestRun.status === "in_progress") {
        return { status: "in_progress", details: latestRun };
      }
    } else {
      console.log("No workflow run found yet. Waiting...");
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval));
  }

  return { status: "not_found", details: null };
}

export async function getPagesUrl(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await githubRequest(`/repos/${owner}/${repo}/pages`);
    return response.html_url || null;
  } catch (error) {
    console.error("Error getting Pages URL:", error);
    return null;
  }
}

export async function getTemplates() {
  return [
    { name: "OWC Blog Template", value: "one-world-community/owc-blog-template" },
    // Add more templates here as needed
  ];
}

export async function enableActionsForRepo(owner: string, repo: string) {
  return githubRequest(`/repos/${owner}/${repo}/actions/permissions`, "PUT", {
    enabled: true,
    allowed_actions: "all",
  });
}

function base64Encode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function commitFile(owner: string, repo: string, path: string, content: string, message: string) {
  try {
    // First, get the current file (if it exists) to get its SHA
    let sha: string | undefined;
    try {
      const currentFile = await githubRequest(`/repos/${owner}/${repo}/contents/${path}`);
      sha = currentFile.sha;
    } catch (error) {
      // If the file doesn't exist, we don't need the SHA
      console.log("File doesn't exist yet, creating new file");
    }

    // Commit the file
    const response = await githubRequest(`/repos/${owner}/${repo}/contents/${path}`, "PUT", {
      message,
      content: base64Encode(content),
      sha,
    });

    return response;
  } catch (error) {
    console.error("Error committing file:", error);
    throw error;
  }
}

export async function updateUserMetadata(blogUrl: string) {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;

    const { data, error: updateError } = await supabase.auth.updateUser({
      data: { blog_url: blogUrl },
    });

    if (updateError) throw updateError;

    console.log("User metadata updated successfully");
    return data;
  } catch (error) {
    console.error("Error updating user metadata:", error);
    throw error;
  }
}