"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fullReview = exports.handlePRSummary = exports.handleCodeReview = void 0;
const openai_1 = require("../utils/openai");
const openai_2 = __importDefault(require("openai"));
const handleCodeReview = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: "Code is required" });
            return;
        }
        const result = await (0, openai_1.reviewCodeWithAI)({ code });
        res.json(result);
    }
    catch (error) {
        console.error("Error reviewing code:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.handleCodeReview = handleCodeReview;
const handlePRSummary = async (req, res) => {
    const { owner, repo, prNumber, title, description, author, metadata, diff } = req.body;
    if (!owner || !repo || !prNumber) {
        res.status(400).json({ error: "owner, repo, and prNumber are required" });
        return;
    }
    try {
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.log("❌ OPENAI_API_KEY environment variable is not set");
            throw new Error("OPENAI_API_KEY environment variable is not set in backend");
        }
        const openai = new openai_2.default({ apiKey: openaiApiKey });
        /* 2️⃣ Use provided diff or fetch from GitHub */
        let finalDiff = diff;
        if (!finalDiff) {
            finalDiff = await fetchPRDiff(owner, repo, prNumber);
        }
        else {
            console.log("📄 Using provided diff from request");
        }
        /* 3️⃣ Fetch repository context */
        const repoContext = await fetchRepositoryContext(owner, repo);
        console.log("🏗️ Repository context:");
        const summaryResult = await generateAISummary(openai, {
            title,
            description: description || 'No description provided',
            diff: finalDiff,
            repoContext,
            prNumber,
            author: author || 'Unknown',
            metadata
        });
        await postSummaryComment(owner, repo, prNumber, summaryResult);
        /* 6️⃣ Return results */
        const response = {
            success: true,
            prNumber,
            author,
            summary: summaryResult,
            message: `Successfully generated and posted summary for PR #${prNumber}`
        };
        res.status(200).json(response);
    }
    catch (err) {
        res.status(500).json({
            error: "PR summary generation failed: " + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.handlePRSummary = handlePRSummary;
/* 🔍 FULL REVIEW FUNCTION - Main new feature */
const fullReview = async (req, res) => {
    const { owner, repo, prNumber, requester } = req.body;
    if (!owner || !repo || !prNumber) {
        res.status(400).json({ error: "Missing required fields: owner, repo, prNumber" });
        return;
    }
    try {
        /* 1️⃣ Initialize OpenAI client */
        const openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            throw new Error("OPENAI_API_KEY environment variable is not set");
        }
        const openai = new openai_2.default({ apiKey: openaiApiKey });
        console.log("✅ OpenAI client initialized for full review");
        /* 2️⃣ Fetch PR details from GitHub */
        console.log("📡 Fetching comprehensive PR details...");
        const prDetails = await fetchPRDetails(owner, repo, prNumber);
        console.log(`📡 PR Details: "${prDetails.title}" by ${prDetails.author}`);
        /* 3️⃣ Fetch PR diff */
        console.log("📡 Fetching PR diff for analysis...");
        const prDiff = await fetchPRDiff(owner, repo, prNumber);
        console.log(`📡 Diff fetched: ${prDiff.length} characters`);
        /* 4️⃣ Fetch repository context */
        console.log("🏗️ Fetching repository context for review...");
        const repoContext = await fetchRepositoryContext(owner, repo);
        /* 5️⃣ Generate comprehensive AI review */
        console.log("🤖 Generating comprehensive AI review...");
        const fullReviewResult = await generateFullAIReview(openai, {
            title: prDetails.title,
            description: prDetails.description,
            author: prDetails.author,
            diff: prDiff,
            repoContext,
            prNumber,
            createdAt: prDetails.createdAt,
            files: prDetails.files
        });
        console.log("🤖 Full Review Generated:");
        console.log(JSON.stringify(fullReviewResult, null, 2));
        /* 6️⃣ Post comprehensive review comment */
        console.log("💬 Posting comprehensive review comment...");
        await postFullReviewComment(owner, repo, prNumber, fullReviewResult, requester || 'maintainer');
        /* 7️⃣ Return comprehensive results */
        const response = {
            success: true,
            prNumber,
            author: prDetails.author,
            qualityRating: fullReviewResult.qualityRating,
            bonusPoints: fullReviewResult.bonusPoints,
            recommendedXP: fullReviewResult.recommendedXP,
            fullReview: fullReviewResult,
            message: `Full review completed for PR #${prNumber}`,
            comment_posted: true
        };
        console.log("✅ === FULL REVIEW COMPLETE ===");
        console.log(`🎯 Recommended XP: ${fullReviewResult.recommendedXP}`);
        console.log(`⭐ Overall Rating: ${fullReviewResult.qualityRating.overallRating}/10`);
        console.log(`📊 Quality Score: ${fullReviewResult.qualityRating.totalScore}/25`);
        res.status(200).json(response);
    }
    catch (err) {
        console.error("❌ Full review failed:", err);
        res.status(500).json({
            error: "Full review generation failed: " + err.message,
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.fullReview = fullReview;
/* 🤖 Generate comprehensive AI review with quality ratings */
async function generateFullAIReview(openai, prData) {
    console.log("🤖 === GENERATING COMPREHENSIVE AI REVIEW ===");
    const reviewPrompt = `# Comprehensive Pull Request Review & Quality Assessment

## PR Information
- **Title**: ${prData.title}
- **Description**: ${prData.description}
- **PR Number**: #${prData.prNumber}
- **Author**: ${prData.author}
- **Created**: ${prData.createdAt}
- **Files Changed**: ${prData.files?.length || 0}

## Repository Context
- **Primary Language**: ${prData.repoContext?.primaryLanguage || 'Unknown'}
- **Architecture**: ${prData.repoContext?.architectureStyle || 'Unknown'}
- **Frameworks**: ${prData.repoContext?.frameworks?.join(', ') || 'None detected'}

## Code Changes (Diff Analysis)
\`\`\`diff
${prData.diff.substring(0, 8000)} // Truncated for analysis
\`\`\`

## Review Task

You are a senior technical lead conducting a comprehensive code review. Analyze this Pull Request across multiple quality dimensions and provide detailed scoring.

### Quality Assessment Criteria (Rate 1-5 for each):

1. **Code Quality & Standards** (1-5):
   - Code readability and maintainability
   - Follows coding standards and conventions
   - Proper variable naming and structure
   - Code organization and modularity

2. **Documentation & Comments** (1-5):
   - Code is well-documented
   - Comments explain complex logic
   - Function/method documentation
   - README or docs updated if needed

3. **Testing Coverage** (1-5):
   - Adequate test coverage
   - Tests cover edge cases
   - Test quality and structure
   - Integration/unit tests included

4. **Performance Impact** (1-5):
   - Code is performant
   - No obvious bottlenecks
   - Efficient algorithms and data structures
   - Resource usage considerations

5. **Security Considerations** (1-5):
   - No security vulnerabilities
   - Input validation and sanitization
   - Authentication/authorization handled
   - Secure coding practices followed

### Bonus Points Assessment:
- **Is Bounty-Backed**: Does this appear to be a significant feature/fix?
- **Merged Within 48hrs**: Is this a quick, high-quality contribution?
- **Contributor Reviews Others**: Check if this is an active contributor
- **Added Meaningful Tests**: Are comprehensive tests included?

### XP Calculation Logic:
- Base XP = (Total Quality Score / 25) × 100
- Bonus XP = Sum of applicable bonus points (+10, +5, +5, +10)
- Final XP = Base XP + Bonus XP
- Minimum: 10 XP, Maximum: 150 XP

## Required JSON Output Format:

{
  "qualityRating": {
    "codeQuality": <1-5>,
    "documentation": <1-5>,
    "testing": <1-5>,
    "performance": <1-5>,
    "security": <1-5>,
    "totalScore": <sum of above, 0-25>,
    "overallRating": <total score converted to 0-10 scale>
  },
  "bonusPoints": {
    "isBountyBacked": <boolean>,
    "mergedWithin48hrs": <boolean>,
    "contributorReviewedOthers": <boolean>,
    "addedMeaningfulTests": <boolean>,
    "totalBonus": <sum of bonus points>
  },
  "recommendedXP": <calculated XP based on quality + bonus>,
  "summary": "<2-3 sentence high-level summary>",
  "keyChanges": ["<change1>", "<change2>", "<change3>"],
  "technicalImpact": "<technical implications>",
  "riskAssessment": "<potential risks>",
  "recommendations": ["<recommendation1>", "<recommendation2>"],
  "reviewComments": [
    "<specific code feedback 1>",
    "<specific code feedback 2>",
    "<specific code feedback 3>"
  ]
}

## Guidelines:
- Be thorough but fair in assessment
- Consider the scope and complexity of changes
- Highlight both strengths and areas for improvement
- Provide actionable feedback
- Consider the repository's context and standards
- Be constructive and encouraging
- Use technical precision in your analysis`;
    console.log("🤖 Full review prompt prepared, length:", reviewPrompt.length);
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a senior software engineer and technical lead with expertise in code review, quality assessment, and mentoring developers. Provide comprehensive, fair, and constructive reviews that help improve code quality and developer skills. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: reviewPrompt
                }
            ],
            temperature: 0.1, // Low temperature for consistent scoring
            max_tokens: 2000,
        });
        const response = completion.choices[0]?.message?.content?.trim() || '{}';
        console.log(`🤖 Raw AI review response (${response.length} chars):`);
        console.log(response);
        // Clean response
        let cleanedResponse = response;
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }
        const parsed = JSON.parse(cleanedResponse);
        // Validate and structure result
        const result = {
            qualityRating: {
                codeQuality: Math.max(1, Math.min(5, parsed.qualityRating?.codeQuality || 3)),
                documentation: Math.max(1, Math.min(5, parsed.qualityRating?.documentation || 3)),
                testing: Math.max(1, Math.min(5, parsed.qualityRating?.testing || 3)),
                performance: Math.max(1, Math.min(5, parsed.qualityRating?.performance || 3)),
                security: Math.max(1, Math.min(5, parsed.qualityRating?.security || 3)),
                totalScore: 0,
                overallRating: 0
            },
            bonusPoints: {
                isBountyBacked: parsed.bonusPoints?.isBountyBacked || false,
                mergedWithin48hrs: parsed.bonusPoints?.mergedWithin48hrs || false,
                contributorReviewedOthers: parsed.bonusPoints?.contributorReviewedOthers || false,
                addedMeaningfulTests: parsed.bonusPoints?.addedMeaningfulTests || false,
                totalBonus: 0
            },
            recommendedXP: 0,
            summary: parsed.summary || 'Comprehensive review completed',
            keyChanges: parsed.keyChanges || ['Changes analyzed'],
            technicalImpact: parsed.technicalImpact || 'Technical impact assessed',
            riskAssessment: parsed.riskAssessment || 'Risk assessment completed',
            recommendations: parsed.recommendations || ['Review recommendations provided'],
            reviewComments: parsed.reviewComments || ['Detailed review feedback provided']
        };
        // Calculate totals
        result.qualityRating.totalScore =
            result.qualityRating.codeQuality +
                result.qualityRating.documentation +
                result.qualityRating.testing +
                result.qualityRating.performance +
                result.qualityRating.security;
        result.qualityRating.overallRating = Math.round((result.qualityRating.totalScore / 25) * 10 * 10) / 10;
        // Calculate bonus points
        let bonusTotal = 0;
        if (result.bonusPoints.isBountyBacked)
            bonusTotal += 10;
        if (result.bonusPoints.mergedWithin48hrs)
            bonusTotal += 5;
        if (result.bonusPoints.contributorReviewedOthers)
            bonusTotal += 5;
        if (result.bonusPoints.addedMeaningfulTests)
            bonusTotal += 10;
        result.bonusPoints.totalBonus = bonusTotal;
        // Calculate recommended XP
        const baseXP = Math.round((result.qualityRating.totalScore / 25) * 100);
        result.recommendedXP = Math.max(10, Math.min(150, baseXP + result.bonusPoints.totalBonus));
        console.log("✅ Final review result:", JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error("❌ AI review generation failed:", error);
        // Return fallback review
        return {
            qualityRating: {
                codeQuality: 3,
                documentation: 3,
                testing: 3,
                performance: 3,
                security: 3,
                totalScore: 15,
                overallRating: 6.0
            },
            bonusPoints: {
                isBountyBacked: false,
                mergedWithin48hrs: false,
                contributorReviewedOthers: false,
                addedMeaningfulTests: false,
                totalBonus: 0
            },
            recommendedXP: 60,
            summary: `Pull Request #${prData.prNumber}: ${prData.title} - Manual review required`,
            keyChanges: ['Automated analysis failed - manual review needed'],
            technicalImpact: 'Manual technical assessment required',
            riskAssessment: 'Manual risk assessment needed',
            recommendations: ['Conduct manual code review', 'Verify all changes manually'],
            reviewComments: ['Automated review failed - please conduct manual review']
        };
    }
}
/* 💬 Post comprehensive review comment */
async function postFullReviewComment(owner, repo, prNumber, review, requester) {
    console.log("💬 === POSTING COMPREHENSIVE REVIEW COMMENT ===");
    const token = process.env.GITHUB_COMMENT_TOKEN;
    if (!token) {
        throw new Error("GITHUB_COMMENT_TOKEN environment variable is not set");
    }
    // Create quality rating display
    const ratingDisplay = (rating) => '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    // Create progress bar for overall score
    const progressBar = (score, max) => {
        const filled = Math.round((score / max) * 10);
        return '🟢'.repeat(filled) + '⬜'.repeat(10 - filled);
    };
    const commentBody = `# 🟢 Merge Feedback

Rate this pull request before merging to help improve code quality.

## 🎯 Current Score

**${review.qualityRating.totalScore} / 25 points (${Math.round((review.qualityRating.totalScore / 25) * 100)}%)**

${progressBar(review.qualityRating.totalScore, 25)}

## ⭐ Quality Assessment

| Category | Rating | Score /5 |
|----------|--------|----------|
| Code Quality & Standards | ${ratingDisplay(review.qualityRating.codeQuality)} | ${review.qualityRating.codeQuality} |
| Documentation & Comments | ${ratingDisplay(review.qualityRating.documentation)} | ${review.qualityRating.documentation} |
| Testing Coverage | ${ratingDisplay(review.qualityRating.testing)} | ${review.qualityRating.testing} |
| Performance Impact | ${ratingDisplay(review.qualityRating.performance)} | ${review.qualityRating.performance} |
| Security Considerations | ${ratingDisplay(review.qualityRating.security)} | ${review.qualityRating.security} |

**Overall Rating: ${review.qualityRating.overallRating}/10** ⭐

## 🎁 Bonus Points

| Bonus | Status | XP |
|-------|--------|----|
| Issue was bounty-backed | ${review.bonusPoints.isBountyBacked ? '✅' : '☐'} | ${review.bonusPoints.isBountyBacked ? '+10' : '0'} |
| PR merged within 24-48 hrs | ${review.bonusPoints.mergedWithin48hrs ? '✅' : '☐'} | ${review.bonusPoints.mergedWithin48hrs ? '+5' : '0'} |
| Contributor also reviewed other PRs | ${review.bonusPoints.contributorReviewedOthers ? '✅' : '☐'} | ${review.bonusPoints.contributorReviewedOthers ? '+5' : '0'} |
| Contributor added meaningful tests | ${review.bonusPoints.addedMeaningfulTests ? '✅' : '☐'} | ${review.bonusPoints.addedMeaningfulTests ? '+10' : '0'} |

**Total Bonus XP: +${review.bonusPoints.totalBonus}**

## 🎯 Recommended XP Award

**${review.recommendedXP} XP** (Base: ${review.recommendedXP - review.bonusPoints.totalBonus} + Bonus: ${review.bonusPoints.totalBonus})

## 📋 Review Summary

${review.summary}

### 🔧 Key Changes
${review.keyChanges.map(change => `- ${change}`).join('\n')}

### ⚡ Technical Impact
${review.technicalImpact}

### ⚠️ Risk Assessment
${review.riskAssessment}

### 💡 Recommendations
${review.recommendations.map(rec => `- ${rec}`).join('\n')}

### 🔍 Detailed Review Comments
${review.reviewComments.map(comment => `- ${comment}`).join('\n')}

---

**Maintainers**: to award the recommended XP, create a new comment like:
\`@pullquestai add ${review.recommendedXP} xp to @[username]\`

*This review was automatically generated by AI and reviewed by ${requester}. Keep up the awesome work! 🚀*`;
    console.log(`💬 Full review comment prepared (${commentBody.length} characters)`);
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ body: commentBody }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to post full review comment: ${response.status} - ${errorText}`);
    }
    const result = await response.json();
    console.log(`✅ Full review comment posted: ${result.html_url}`);
}
/* 📡 Fetch comprehensive PR details */
async function fetchPRDetails(owner, repo, prNumber) {
    console.log("📡 === FETCHING PR DETAILS ===");
    const token = process.env.GITHUB_COMMENT_TOKEN;
    if (!token) {
        throw new Error("GITHUB_COMMENT_TOKEN environment variable is not set");
    }
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
        },
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch PR details: ${response.status} - ${errorText}`);
    }
    const prData = await response.json();
    // Also fetch files changed
    const filesUrl = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/files`;
    const filesResponse = await fetch(filesUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
        },
    });
    let files = [];
    if (filesResponse.ok) {
        files = await filesResponse.json();
    }
    return {
        title: prData.title,
        description: prData.body || 'No description provided',
        author: prData.user.login,
        createdAt: prData.created_at,
        updatedAt: prData.updated_at,
        files: files,
        additions: prData.additions,
        deletions: prData.deletions,
        changedFiles: prData.changed_files
    };
}
/* 🤖 Generate AI-powered PR summary */
async function generateAISummary(openai, prData) {
    console.log("🤖 === AI SUMMARY GENERATION ===");
    console.log("🤖 Input validation:");
    console.log(`   Title length: ${prData.title.length}`);
    console.log(`   Description length: ${prData.description.length}`);
    console.log(`   Diff length: ${prData.diff.length}`);
    console.log(`   Author: ${prData.author}`);
    console.log(`   PR Number: ${prData.prNumber}`);
    const summaryPrompt = `# Pull Request Summary Generation

## PR Information
- **Title**: ${prData.title}
- **Description**: ${prData.description}
- **PR Number**: #${prData.prNumber}
- **Author**: ${prData.author}
${prData.metadata ? `- **Branch**: ${prData.metadata.headBranch} → ${prData.metadata.baseBranch}
- **Created**: ${prData.metadata.createdAt}` : ''}

## Repository Context
- **Primary Language**: ${prData.repoContext?.primaryLanguage || 'Unknown'}
- **Architecture**: ${prData.repoContext?.architectureStyle || 'Unknown'}
- **Frameworks**: ${prData.repoContext?.frameworks?.join(', ') || 'None detected'}

## Code Changes
\`\`\`diff
${prData.diff.substring(0, 6000)} // Truncated for analysis
\`\`\`

## Task

Generate a comprehensive yet concise summary of this Pull Request. Focus on:

1. **What was changed** (high-level overview)
2. **Why it was changed** (purpose/motivation)
3. **Key technical changes** (specific modifications)
4. **Potential impact** (how it affects the system)
5. **Risk assessment** (potential issues or concerns)
6. **Recommendations** (next steps or suggestions)

## Output Format

Respond with ONLY a valid JSON object in this exact format:

{
  "summary": "<2-3 sentence high-level summary of what this PR accomplishes>",
  "keyChanges": [
    "<specific change 1>",
    "<specific change 2>",
    "<specific change 3>"
  ],
  "technicalImpact": "<1-2 sentences about technical implications>",
  "riskAssessment": "<1-2 sentences about potential risks or concerns>",
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>"
  ]
}

## Guidelines
- Keep summary concise but informative
- Focus on business value and technical impact
- Highlight any potential breaking changes
- Suggest testing approaches if relevant
- Be objective and constructive
- Use clear, non-technical language for summary
- Use technical details for keyChanges and impact`;
    console.log("🤖 Prompt prepared, length:", summaryPrompt.length);
    console.log("🤖 Calling OpenAI API...");
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "You are a senior technical lead reviewing pull requests. Generate clear, concise summaries that help team members understand the changes and their impact. Always respond with valid JSON only."
                },
                {
                    role: "user",
                    content: summaryPrompt
                }
            ],
            temperature: 0.2, // Slightly higher for more natural language
            max_tokens: 1200,
        });
        console.log("🤖 OpenAI API response received");
        console.log("🤖 Usage:", completion.usage);
        console.log("🤖 Model:", completion.model);
        const response = completion.choices[0]?.message?.content?.trim() || '{}';
        console.log(`🤖 Raw OpenAI response (${response.length} chars):`);
        console.log(response);
        // Clean response if needed (remove markdown)
        let cleanedResponse = response;
        if (cleanedResponse.startsWith('```json')) {
            console.log("🧹 Cleaning markdown from response...");
            cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }
        console.log("🧹 Cleaned response:");
        console.log(cleanedResponse);
        console.log("📝 Parsing JSON response...");
        const parsed = JSON.parse(cleanedResponse);
        console.log("📝 Parsed JSON:");
        console.log(JSON.stringify(parsed, null, 2));
        // Validate and structure the result
        const result = {
            summary: parsed.summary || 'Summary generation failed',
            keyChanges: Array.isArray(parsed.keyChanges) ? parsed.keyChanges : ['Changes could not be analyzed'],
            technicalImpact: parsed.technicalImpact || 'Technical impact could not be assessed',
            riskAssessment: parsed.riskAssessment || 'Risk assessment unavailable',
            recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ['Manual review recommended']
        };
        console.log("✅ Final structured result:");
        console.log(JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error(`❌ OpenAI analysis failed:`, error.name, error.message);
        console.error(`❌ OpenAI error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        // Return fallback summary
        const fallback = {
            summary: `Pull Request #${prData.prNumber}: ${prData.title}`,
            keyChanges: ['Automated analysis failed - manual review required'],
            technicalImpact: 'Technical impact could not be automatically assessed',
            riskAssessment: 'Manual risk assessment required',
            recommendations: ['Please review changes manually', 'Ensure adequate testing']
        };
        console.log("🔄 Returning fallback summary:");
        console.log(JSON.stringify(fallback, null, 2));
        return fallback;
    }
}
/* 💬 Post summary as comment on PR */
async function postSummaryComment(owner, repo, prNumber, summary) {
    console.log("💬 === POSTING COMMENT ===");
    const token = process.env.GITHUB_COMMENT_TOKEN;
    console.log(`🔑 GitHub token present: ${!!token}`);
    console.log(`🔑 GitHub token length: ${token ? token.length : 0}`);
    if (!token) {
        console.log("❌ GITHUB_COMMENT_TOKEN environment variable is not set");
        throw new Error("GITHUB_COMMENT_TOKEN environment variable is not set");
    }
    const commentBody = `## 🤖 AI-Generated PR Summary

### 📋 Overview
${summary.summary}

### 🔧 Key Changes
${summary.keyChanges.map(change => `- ${change}`).join('\n')}

### ⚡ Technical Impact
${summary.technicalImpact}

### ⚠️ Risk Assessment
${summary.riskAssessment}

### 💡 Recommendations
${summary.recommendations.map(rec => `- ${rec}`).join('\n')}

---
*This summary was automatically generated by AI. Please review the changes carefully and validate the analysis.*`;
    console.log(`💬 Comment body prepared (${commentBody.length} characters)`);
    console.log(`💬 Posting to PR #${prNumber} in ${owner}/${repo}`);
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;
    console.log(`💬 GitHub API URL: ${url}`);
    const requestBody = JSON.stringify({ body: commentBody });
    console.log(`💬 Request body length: ${requestBody.length}`);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        },
        body: requestBody,
    });
    console.log(`💬 GitHub API response status: ${response.status} ${response.statusText}`);
    const headersObj = {};
    response.headers.forEach((value, key) => {
        headersObj[key] = value;
    });
    console.log(`💬 Response headers:`, headersObj);
    if (!response.ok) {
        const errorText = await response.text();
        console.log(`💬 GitHub API error response:`, errorText);
        throw new Error(`Failed to post summary comment: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const result = await response.json();
    console.log(`✅ Comment posted successfully:`, result.html_url);
    console.log(`✅ Comment ID:`, result.id);
}
/* 📡 Fetch PR diff */
async function fetchPRDiff(owner, repo, prNumber) {
    console.log("📡 === FETCHING PR DIFF ===");
    const token = process.env.GITHUB_COMMENT_TOKEN;
    console.log(`🔑 GitHub token present: ${!!token}`);
    if (!token) {
        console.log("❌ GITHUB_COMMENT_TOKEN environment variable is not set");
        throw new Error("GITHUB_COMMENT_TOKEN environment variable is not set");
    }
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`;
    console.log(`📡 Fetching diff from: ${url}`);
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3.diff",
        },
    });
    console.log(`📡 GitHub API response: ${response.status} ${response.statusText}`);
    if (!response.ok) {
        const errorText = await response.text();
        console.log(`📡 GitHub API error:`, errorText);
        throw new Error(`Failed to fetch PR diff: ${response.status} - ${errorText}`);
    }
    const diff = await response.text();
    console.log(`📡 Diff fetched successfully (${diff.length} characters)`);
    return diff;
}
async function fetchRepositoryContext(owner, repo) {
    console.log("📋 === FETCHING REPOSITORY CONTEXT ===");
    const token = process.env.GITHUB_COMMENT_TOKEN;
    console.log(`🔑 GitHub token present: ${!!token}`);
    if (!token) {
        console.log("⚠️ No GitHub token, using minimal context");
        return {
            primaryLanguage: 'Unknown',
            architectureStyle: 'Unknown',
            frameworks: []
        };
    }
    try {
        const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        console.log(`📋 Fetching repo data from: ${repoUrl}`);
        const response = await fetch(repoUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        console.log(`📋 Repository API response: ${response.status} ${response.statusText}`);
        if (response.ok) {
            const repoData = await response.json();
            console.log(`📋 Repository language: ${repoData.language}`);
            console.log(`📋 Repository description: ${repoData.description}`);
            const context = {
                primaryLanguage: repoData.language || 'Unknown',
                architectureStyle: 'Web Application',
                frameworks: []
            };
            console.log("📋 Repository context created:", JSON.stringify(context, null, 2));
            return context;
        }
    }
    catch (error) {
        console.log("📦 Error fetching repo context:", error.message);
    }
    const fallbackContext = {
        primaryLanguage: 'Unknown',
        architectureStyle: 'Unknown',
        frameworks: []
    };
    console.log("📋 Using fallback context:", JSON.stringify(fallbackContext, null, 2));
    return fallbackContext;
}
//# sourceMappingURL=GptController.js.map