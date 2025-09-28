import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Copy, Check } from 'lucide-react';

const AIAgents = () => {
  const { isDark } = useTheme();
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeSnippets = [
    {
      id: 'route',
      code: `app.use('/api/my-custom-agent', MyCustomAgentRouter);`
    },
    {
      id: 'env',
      code: `HEDERA_ACCOUNT_ID=...
HEDERA_PRIVATE_KEY=...
OPENAI_API_KEY=...
GITHUB_COMMENT_TOKEN=...`
    },
    {
      id: 'curl',
      code: `curl -X POST https://your-deployment-url.com/api/my-custom-agent \\
  -H "Content-Type: application/json" \\
  -d '{
    "owner": "your-github-username",
    "repo": "your-repo-name",
    "issueNumber": 42
  }'`
    },
    {
      id: 'workflow',
      code: `name: Trigger PullQuest Agent

on:
  issue_comment:
    types: [created]

jobs:
  run-agent:
    if: >
      github.event.issue.pull_request &&
      contains(github.event.comment.body, '/analyze') &&
      contains(fromJSON('["OWNER", "MEMBER"]'), github.event.comment.author_association)
    runs-on: ubuntu-latest
    steps:
      - name: Call Custom Agent API
        run: |
          curl -X POST https://your-deployment-url.com/api/my-custom-agent \\
            -H "Content-Type: application/json" \\
            -d '{
              "owner": "\${{ github.repository_owner }}",
              "repo": "\${{ github.event.repository.name }}",
              "issueNumber": \${{ github.event.issue.number }}
            }'`
    }
  ];

  return (
    <div>
      <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        AI Agents
      </h1>
      <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Automate repository management and streamline your workflow with intelligent, autonomous AI agents designed to reduce maintainer workload.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-indigo-600' 
            : 'bg-gray-50 border-gray-200 hover:border-indigo-400'
        }`}>
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🧐 Reviewer Agent
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Automatically reviews pull requests for code style, adherence to contribution guidelines, and common programming errors, providing instant feedback to contributors.
          </p>
        </div>

        <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-red-600' 
            : 'bg-gray-50 border-gray-200 hover:border-red-400'
        }`}>
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🛡️ Security Agent
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Scans incoming code for potential security vulnerabilities and dependency issues, flagging them before they can be merged into the main branch.
          </p>
        </div>

        <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-yellow-600' 
            : 'bg-gray-50 border-gray-200 hover:border-yellow-400'
        }`}>
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📋 Taskmaster Agent
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Helps manage repository issues by labeling them, identifying duplicates, closing stale issues, and suggesting "good first issues" for new contributors.
          </p>
        </div>

        <div className={`p-6 rounded-lg border transition-all hover:shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 hover:border-green-600' 
            : 'bg-gray-50 border-gray-200 hover:border-green-400'
        }`}>
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            👋 Onboarding Agent
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Guides new contributors through the setup process, points them to relevant documentation, and helps them find their first task to contribute to the project.
          </p>
        </div>
      </div>

      {/* --- How to Create Your Own Agent --- */}
      <div className="mt-16">
        <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Create Your Own Hedera Agent
        </h2>
        <p className={`text-base leading-relaxed mb-8 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          PullQuest is extensible, allowing you to build custom AI agents that record their actions on the Hedera network for full transparency. All agent logic resides in the <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>PullQuestGithubBackend</code> repository. Follow these steps to create your own agent.
        </p>

        <div className="space-y-6">
          {/* Step 1 */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Step 1: Add a New Route
            </h4>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Open the main router file in <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>PullQuestGithubBackend</code> and add a new route to link an API path to your controller logic.
            </p>
            <div className="relative">
              <pre className={`p-4 rounded-md text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                <code>{codeSnippets[0].code}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeSnippets[0].code, 0)}
                className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
                title="Copy to clipboard"
              >
                {copiedIndex === 0 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Step 2 */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Step 2: Create a Controller File
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              In the <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>controllers/</code> directory, create a new file (e.g., <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>MyCustomAgentController.ts</code>) to house your agent's logic.
            </p>
          </div>

          {/* Step 3 */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Step 3: Configure Environment Variables
            </h4>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Add your Hedera, OpenAI, and GitHub credentials to your <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>.env.development</code> file.
            </p>
            <div className="relative">
              <pre className={`p-4 rounded-md text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                <code>{codeSnippets[1].code}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeSnippets[1].code, 1)}
                className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
                title="Copy to clipboard"
              >
                {copiedIndex === 1 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Step 4 */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Step 4: Implement Agent Logic
            </h4>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Write the core functionality in your controller, using our reference implementation to see how to interact with the Hedera SDK, OpenAI, and the GitHub API.
            </p>
          </div>

          {/* Step 5 */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Step 5: Deploy the Backend
            </h4>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Once your agent is complete, deploy the <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>PullQuestGithubBackend</code> to a public-facing server. Platforms like Vercel, Heroku, or any cloud provider (AWS, GCP, Azure) are excellent choices. Ensure all your environment variables from Step 3 are configured in your deployment environment.
            </p>
          </div>

          {/* Step 6 */}
          <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Step 6: Trigger Your Agent
            </h4>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              With your backend deployed, you can trigger your agent's endpoint in several ways.
            </p>

            <h5 className={`font-semibold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Method A: Using a cURL Command
            </h5>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              For manual testing or simple scripts, you can call the API endpoint directly from your terminal using cURL.
            </p>
            <div className="relative">
              <pre className={`p-4 rounded-md text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                <code>{codeSnippets[2].code}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeSnippets[2].code, 2)}
                className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
                title="Copy to clipboard"
              >
                {copiedIndex === 2 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <h5 className={`font-semibold mt-6 mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Method B: Using a GitHub Workflow
            </h5>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              For full automation, create a GitHub Actions workflow in your repository at <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>.github/workflows/trigger-agent.yml</code>. This example runs the agent whenever a maintainer adds the comment <code className={`px-2 py-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>/analyze</code> to an issue.
            </p>
            <div className="relative">
              <pre className={`p-4 rounded-md text-sm overflow-x-auto ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                <code>{codeSnippets[3].code}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeSnippets[3].code, 3)}
                className={`absolute top-2 right-2 p-2 rounded-md transition-all ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
                title="Copy to clipboard"
              >
                {copiedIndex === 3 ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pro Tip Section */}
        <div className={`mt-8 p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-lg font-semibold mb-3 flex items-center ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
            💡 Pro Tip
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Test your agent locally first by running the backend on localhost and using tools like ngrok to expose it temporarily. This allows you to debug and iterate quickly before deploying to production.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAgents;