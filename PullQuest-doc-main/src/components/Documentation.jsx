import React from 'react';
import { useTheme } from '../context/ThemeContext';
import AI_Agetnts from './AI_Agents';
import Repo_setup from './Repo_setup';
const Documentation = () => {
  const { isDark } = useTheme();

  return (
    <div className={`flex-1 ml-64 mr-64 p-8 transition-colors ${
      isDark ? 'bg-gray-900' : 'bg-white'
    }`}>
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <a href="#" className={`transition-colors ${
          isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
        }`}>
          Docs
        </a>
        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
        <a href="#" className={`transition-colors ${
          isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
        }`}>
          How to use PullQuest
        </a>
        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>/</span>
        <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>Recruiter</span>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl">
        {/* What is PullQuest Section */}
        <section id="what-is-pullquest" className="mb-16">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            What is PullQuest?
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            A revolutionary platform that transforms how open-source contributions are managed through tokenized stakeholder participation.
          </p>
          
          <div className="mb-12">
            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              The Problem We Solve
            </h2>
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Open-source maintainers face significant challenges with spam pull requests and fake GitHub profiles. 
              A single Python script can easily manipulate contribution graphs, making it difficult to identify genuine contributors. 
              This leads to wasted time reviewing low-quality submissions and difficulty in recognizing valuable contributions.
            </p>
          </div>

          <div className="mb-12">
            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Our Solution: Tokenized Contributions
            </h2>
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong className={isDark ? 'text-white' : 'text-gray-900'}>PullQuest</strong> introduces a stake-based system using virtual tokens. 
              Contributors must stake tokens to submit pull requests, creating a natural barrier against spam while incentivizing quality contributions.
            </p>
            
            <div className={`p-6 rounded-lg border mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Key Features:
              </h3>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• <strong>Virtual Token System:</strong> Contributors stake tokens to submit PRs</li>
                <li>• <strong>Maintainer Control:</strong> Repository owners set token requirements and rewards</li>
                <li>• <strong>AI-Powered Prioritization:</strong> Automatic PR classification (Priority 1, 2, 3)</li>
                <li>• <strong>Hedera Integration:</strong> All transactions secured on Hedera network</li>
                <li>• <strong>Quality Assurance:</strong> Reduces spam while promoting genuine contributions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* About Repo Structure Section */}
        <section id="about-repo-structure" className="mb-16">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Repository Structure
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            PullQuest follows a modular architecture with four distinct components working together seamlessly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🎨 Frontend
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                React-based user interface for contributors, maintainers, and recruiters. 
                Provides intuitive dashboards for managing tokens, PRs, and project analytics.
              </p>
            </div>

            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                ⚡ Smart Contracts
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Hedera-based smart contracts managing token distribution, staking mechanisms, 
                and reward systems with transparent, immutable transaction records.
              </p>
            </div>

            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🔧 Backend
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Core API services handling user authentication, repository management, 
                token transactions, and database operations with robust security measures.
              </p>
            </div>

            <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
              <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🤖 Workflows Backend
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                AI-powered analysis engine that evaluates PR quality, assigns priority levels, 
                and manages automated workflows integrated with GitHub Actions.
              </p>
            </div>
          </div>

        </section>

        {/* How to use PullQuest Sections */}
        
        {/* Basic Section */}
        <section id="basic" className="mb-16">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Basic Usage Guide
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Get started with PullQuest - understand the fundamentals of our tokenized contribution system.
          </p>

          <div className="space-y-6">
            <div className={`p-4 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-gray-800' : 'bg-green-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-green-400' : 'text-green-800'}`}>
                1. Token Acquisition
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Users earn tokens through successful contributions, community engagement, 
                or by purchasing them. Maintainers distribute initial tokens based on repository needs.
              </p>
            </div>

            <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-gray-800' : 'bg-blue-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
                2. Stake to Contribute
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Before submitting a PR, contributors must stake a predetermined number of tokens. 
                This stake acts as collateral, ensuring serious intent and quality submissions.
              </p>
            </div>

            <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${isDark ? 'bg-gray-800' : 'bg-purple-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-purple-400' : 'text-purple-800'}`}>
                3. AI Evaluation
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Our AI system analyzes code quality, documentation, test coverage, and adherence 
                to project standards, automatically assigning priority levels to help maintainers.
              </p>
            </div>

            <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${isDark ? 'bg-gray-800' : 'bg-orange-50'}`}>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-orange-400' : 'text-orange-800'}`}>
                4. Review & Rewards
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Maintainers review prioritized PRs. Accepted contributions return staked tokens plus rewards. 
                Rejected PRs forfeit a portion of staked tokens to discourage low-quality submissions.
              </p>
            </div>
          </div>
        </section>

        {/* Maintainer Section */}
        <section id="maintainer" className="mb-16">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Maintainer Guide
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive guide for repository maintainers to leverage PullQuest's tokenized system.
          </p>

          <div className="mb-12">
            <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI-Powered PR Management
            </h2>
            <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Our AI system automatically categorizes incoming PRs, helping you focus on high-impact contributions first.
            </p>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-100 border border-green-300'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-800'}`}>
                  🥇 Priority 1: Critical & High-Quality
                </h4>
                <p className={`text-sm mt-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  Bug fixes, security patches, well-documented features with comprehensive tests
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-100 border border-yellow-300'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-800'}`}>
                  🥈 Priority 2: Standard Contributions
                </h4>
                <p className={`text-sm mt-1 ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  Feature enhancements, performance improvements, good code quality
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/30 border border-orange-700' : 'bg-orange-100 border border-orange-300'}`}>
                <h4 className={`font-semibold ${isDark ? 'text-orange-400' : 'text-orange-800'}`}>
                  🥉 Priority 3: Minor & Improvements
                </h4>
                <p className={`text-sm mt-1 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                  Documentation updates, minor refactoring, style improvements
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contributor Section */}
        <section id="contributor" className="mb-16">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Contributor Guide
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Learn how to participate effectively in the PullQuest ecosystem and maximize your contributions.
          </p>

          <div className={`p-6 rounded-lg border mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Token Acquisition Strategies:
            </h3>
            <ul className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>• <strong>Welcome Bonus:</strong> Receive initial tokens when joining verified repositories</li>
              <li>• <strong>Successful PRs:</strong> Earn tokens back plus rewards for accepted contributions</li>
              <li>• <strong>Community Engagement:</strong> Participate in code reviews and discussions</li>
              <li>• <strong>Mentorship:</strong> Help new contributors and earn mentorship rewards</li>
            </ul>
          </div>
        </section>

        {/* Recruiter Section */}
        <section id="recruiter" className="mb-16">
          <h1 className={`text-4xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recruiter Guide
          </h1>
          <p className={`text-lg mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Leverage PullQuest's transparent contribution system to identify and evaluate top developer talent.
          </p>

          <div className={`p-6 rounded-lg border mb-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Authentic Metrics You Can Trust:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  ✅ Verified Contributions
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  All contributions are stake-backed and AI-verified for quality
                </p>
              </div>
              <div>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  📊 Quality Scores
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Objective assessment of code quality and technical skills
                </p>
              </div>
            </div>
          </div>
        </section>

       {/* AI Agents Section - NEWLY ADDED */}
        <section id="AI_AGENTS" className="mb-16">
         <AI_Agetnts/>
        </section>

        <section id="REPO_SETUP" className="mb-16">
            <Repo_setup/>
        </section>
            
      </div>
    </div>
  );
};

export default Documentation;
