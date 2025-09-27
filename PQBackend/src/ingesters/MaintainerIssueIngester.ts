import MaintainerIssue, { IMaintainerIssue } from "../model/MaintainerIssues";

const GITHUB_API = "https://api.github.com";

interface MaintainerIssueIngesterData {
  owner: string;
  repo: string;
  issueNumber: number;
  githubToken: string;
  username?: string; // Optional username of the user who created the issue
}

interface MaintainerIssueData {
  owner: string;
  repo: string;
  issueNumber: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: string[];
  createdAt: string;
  updatedAt: string;
  author: string;
  url: string;
  apiUrl: string;
  assignees: string[];
  milestone: string | null;
}

/** Fetch a single issue from GitHub API */
const fetchGitHubIssue = async (owner: string, repo: string, issueNumber: number, token: string) => {
  console.log(`🔍 Fetching issue from GitHub API: ${owner}/${repo}#${issueNumber}`);
  
  const response = await fetch(`${GITHUB_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
  }

  const issue = await response.json();
  console.log(`✅ Successfully fetched issue from GitHub: ${owner}/${repo}#${issueNumber}`);
  
  return issue;
};

/** Main MaintainerIssueIngester function */
export const MaintainerIssueIngester = async (data: MaintainerIssueIngesterData): Promise<void> => {
  try {
    /* ───────── 1. validate required fields ───────── */
    const { owner, repo, issueNumber, githubToken, username } = data;
    
    if (!owner || !repo || !issueNumber || !githubToken) {
      throw new Error("Missing required fields: owner, repo, issueNumber, or githubToken");
    }

    console.log(`🚀 Starting MaintainerIssueIngester for ${owner}/${repo}#${issueNumber} ${username ? `by ${username}` : ''}`);

    /* ───────── 2. fetch issue from GitHub API ───────── */
    const githubIssue = await fetchGitHubIssue(owner, repo, issueNumber, githubToken);

    /* ───────── 3. transform GitHub issue to our format ───────── */
    const issueData: MaintainerIssueData = {
      owner,
      repo,
      issueNumber: githubIssue.number,
      title: githubIssue.title,
      body: githubIssue.body || '',
      state: githubIssue.state,
      labels: githubIssue.labels?.map((label: any) => 
        typeof label === 'string' ? label : label.name
      ) || [],
      createdAt: githubIssue.created_at,
      updatedAt: githubIssue.updated_at,
      author: githubIssue.user?.login || 'unknown',
      url: githubIssue.html_url,
      apiUrl: githubIssue.url,
      assignees: githubIssue.assignees?.map((assignee: any) => assignee.login) || [],
      milestone: githubIssue.milestone?.title || null,
    };

    console.log(`🔄 Transformed GitHub issue data for ${owner}/${repo}#${issueNumber}`);

    /* ───────── 4. call issue ingester to save to DB ───────── */
    await ingestMaintainerIssue(issueData, githubIssue, username);

    console.log(`🎉 MaintainerIssueIngester completed successfully for ${owner}/${repo}#${issueNumber}`);

  } catch (error: any) {
    console.error("❌ MaintainerIssueIngester error:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

/** Internal function to save issue data to database */
const ingestMaintainerIssue = async (issueData: MaintainerIssueData, fullGitHubIssue: any, username?: string): Promise<void> => {
  try {
    /* ───────── 1. validate required fields ───────── */
    const { owner, repo, issueNumber, title, author, createdAt, updatedAt } = issueData;
    
    if (!owner || !repo || !issueNumber || !title) {
      throw new Error("Missing required fields: owner, repo, issueNumber, or title");
    }

    console.log(`📊 Ingesting maintainer issue: ${owner}/${repo}#${issueNumber}${username ? ` (created by: ${username})` : ''}`);

    /* ───────── 2. transform GitHub data to schema format ───────── */
    const maintainerIssueDoc = {
      id: fullGitHubIssue.id, // Using actual GitHub issue ID
      number: issueNumber,
      title: title,
      body: issueData.body || '',
      state: issueData.state,
      htmlUrl: issueData.url,
      
      // User field (author of the issue)
      user: {
        id: fullGitHubIssue.user?.id || 0,
        login: author,
        avatarUrl: fullGitHubIssue.user?.avatar_url || '',
        htmlUrl: fullGitHubIssue.user?.html_url || `https://github.com/${author}`,
        type: fullGitHubIssue.user?.type || 'User'
      },
      
      // Assignees array
      assignees: fullGitHubIssue.assignees?.map((assignee: any) => ({
        id: assignee.id || 0,
        login: assignee.login,
        avatarUrl: assignee.avatar_url || '',
        htmlUrl: assignee.html_url || `https://github.com/${assignee.login}`,
        type: assignee.type || 'User'
      })) || [],
      
      // Labels array with full GitHub data
      labels: fullGitHubIssue.labels?.map((label: any) => ({
        id: label.id || 0,
        name: label.name,
        color: label.color || '000000',
        description: label.description || ''
      })) || [],
      
      // Repository info (fetch from GitHub if needed)
      repository: {
        id: fullGitHubIssue.repository?.id || 0,
        name: repo,
        fullName: `${owner}/${repo}`,
        htmlUrl: `https://github.com/${owner}/${repo}`,
        language: fullGitHubIssue.repository?.language || '',
        stargazersCount: fullGitHubIssue.repository?.stargazers_count || 0,
        forksCount: fullGitHubIssue.repository?.forks_count || 0,
        description: fullGitHubIssue.repository?.description || ''
      },
      
      // Milestone (if provided)
      ...(fullGitHubIssue.milestone && {
        milestone: {
          id: fullGitHubIssue.milestone.id || 0,
          title: fullGitHubIssue.milestone.title,
          description: fullGitHubIssue.milestone.description || '',
          state: fullGitHubIssue.milestone.state || 'open',
          ...(fullGitHubIssue.milestone.due_on && { dueOn: new Date(fullGitHubIssue.milestone.due_on) })
        }
      }),
      
      // Timestamps
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
      ...(fullGitHubIssue.closed_at && { closedAt: new Date(fullGitHubIssue.closed_at) }),
      
      // Additional GitHub fields
      commentsCount: fullGitHubIssue.comments || 0,
      authorAssociation: fullGitHubIssue.author_association || 'NONE',
      stakingRequired: 0, // Default value
      
      // Store the username who created this issue in our system (if provided)
      ...(username && { createdByUsername: username })
      
    } as Partial<IMaintainerIssue>;

    /* ───────── 3. upsert maintainer issue doc ──────── */
    const upserted = await MaintainerIssue.findOneAndUpdate(
      { 
        id: fullGitHubIssue.id // Use GitHub's unique ID
      },
      {
        ...maintainerIssueDoc,
        $setOnInsert: {
          createdAt: new Date(createdAt),
        }
      },
      { upsert: true, new: true }
    );

    const isNewRecord = upserted.createdAt.getTime() === new Date(createdAt).getTime();
    console.log(`✅ Successfully ${isNewRecord ? 'created' : 'updated'} issue: ${owner}/${repo}#${issueNumber}${username ? ` (by: ${username})` : ''}`);

    /* ───────── 4. update repository statistics ──────── */
    const [openCount, closedCount] = await Promise.all([
      MaintainerIssue.countDocuments({
        'repository.fullName': `${owner}/${repo}`,
        state: 'open',
      }),
      MaintainerIssue.countDocuments({
        'repository.fullName': `${owner}/${repo}`,
        state: 'closed',
      }),
    ]);

    console.log(`📈 Repository statistics for ${owner}/${repo}: ${openCount} open, ${closedCount} closed`);

  } catch (error: any) {
    console.error("❌ ingestMaintainerIssue error:", error);
    throw error;
  }
};