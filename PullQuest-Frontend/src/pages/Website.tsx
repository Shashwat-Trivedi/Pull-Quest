"use client"

import logo from "@/assets/Logo.png";

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import {
  ArrowRight,
  Github,
  Users,
  Building2,
  Star,
  Coins,
  Shield,
  ChevronDown,
  ChevronUp,
  Twitter,
  Linkedin,
  Clock,
  CheckCircle,
  TrendingUp,
  Award,
  Target,
  Zap,
  BarChart3,
  Filter,

} from "lucide-react"

export default function PullQuestLanding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const navigate = useNavigate();
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 relative">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      <div className="flex items-center">
<div className="mx-auto mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900">
  <img src={logo} alt="Pull Quest Logo" className="h-10 w-10 object-cover rounded-full" />
</div>
        <span className="text-xl font-semibold text-gray-900">Pull Quest</span>
      </div>
      <div className="hidden md:flex items-center space-x-8">
        {/* Solutions Dropdown */}
        <div className="relative group">
          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center">
            Solutions
            <ChevronDown className="inline w-4 h-4 ml-1" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">For Contributors</div>
                <div className="text-xs text-gray-500">Build your open source portfolio</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">For Maintainers</div>
                <div className="text-xs text-gray-500">Manage PRs and bounties efficiently</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">For Organizations</div>
                <div className="text-xs text-gray-500">Post bounties and find talent</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">For Recruiters</div>
                <div className="text-xs text-gray-500">Access top developer profiles</div>
              </a>
            </div>
          </div>
        </div>

        <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Enterprise
        </a>
        <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Templates
        </a>

        {/* Developer Dropdown */}
        <div className="relative group">
          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center">
            Developer
            <ChevronDown className="inline w-4 h-4 ml-1" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">API Documentation</div>
                <div className="text-xs text-gray-500">Integrate with Pull Quest</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">GitHub Integration</div>
                <div className="text-xs text-gray-500">Connect your repositories</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Webhooks</div>
                <div className="text-xs text-gray-500">Automate PR tracking</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">SDKs & Tools</div>
                <div className="text-xs text-gray-500">Developer resources</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Status Page</div>
                <div className="text-xs text-gray-500">Service status & uptime</div>
              </a>
            </div>
          </div>
        </div>

        {/* Resources Dropdown */}
        <div className="relative group">
          <button className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center">
            Resources
            <ChevronDown className="inline w-4 h-4 ml-1" />
          </button>
          <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Blog</div>
                <div className="text-xs text-gray-500">Latest updates and insights</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Help Center</div>
                <div className="text-xs text-gray-500">Get support and answers</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Community Forum</div>
                <div className="text-xs text-gray-500">Connect with other users</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Best Practices</div>
                <div className="text-xs text-gray-500">Open source contribution guides</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Case Studies</div>
                <div className="text-xs text-gray-500">Success stories and examples</div>
              </a>
              <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <div className="font-medium">Webinars</div>
                <div className="text-xs text-gray-500">Educational content and events</div>
              </a>
            </div>
          </div>
        </div>

        <a href="#" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          Pricing
        </a>
      </div>
    </div>
  </div>
</nav>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-sm text-gray-600">Pull Quest launches v1.0</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                The better way to stake your way to quality open source contributions
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Contributors stake virtual coins to submit quality PRs, building ranked profiles that showcase their expertise. Maintainers receive better contributions from developers with skin in the game, while recruiters access a curated talent pool of verified contributors with proven track records.
              </p>

              <div className="space-y-4">
                {/* <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md flex items-center justify-center"  onClick={() => navigate("/login")}>
                  <Github className="w-5 h-5 mr-2" />
                  Sign up with GitHub
                </Button> */}

                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 py-3 rounded-md flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">No credit card required. Start with 100 free virtual coins.</p>
            </div>

            {/* Right side - Virtual Currency Dashboard mockup */}
            <div className="relative">
              <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">JD</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">John Developer</p>
                      <p className="text-xs text-gray-500">Merge Master • 2,450 XP</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>

                {/* Virtual Currency Balance */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Virtual Coins</span>
                    <Coins className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">1,250</div>
                  <div className="text-xs text-gray-500">+50 earned this week</div>
                </div>

                {/* XP Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">XP Progress</span>
                    <span className="text-xs text-gray-500">750 XP to next rank</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                {/* Recent Stakes */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Recent Stakes</h4>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Fix authentication bug</p>
                        <p className="text-xs text-gray-500">Merged • +100 coins</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-green-600">+150</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Add dark mode support</p>
                        <p className="text-xs text-gray-500">Under review • 75 coins staked</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">-75</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Optimize database queries</p>
                        <p className="text-xs text-gray-500">Ready to stake • 100 coins</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-1">
                      Stake
                    </Button>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center space-x-4 mt-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-green-500 text-green-500" />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">Trustpilot</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                  <span className="text-xs text-gray-500 ml-2">ProductHunt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by section */}
     

      {/* User Profile System & XP-Based Ranking */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">User Profile System & XP-Based Ranking</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Build your open-source reputation with our comprehensive profile system and gamified ranking structure
              that showcases your expertise to the world.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Gamified Professional Growth</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Progressive Ranking System</h4>
                    <p className="text-gray-600">
                      Advance through ranks from Code Novice to Open Source Legend. Each rank unlocks new benefits and
                      recognition in the community.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">XP-Based Metrics</h4>
                    <p className="text-gray-600">
                      Earn XP based on merged PRs, maintainer feedback, issue complexity, and community endorsements.
                      Clear metrics for skill development.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Career Opportunities</h4>
                    <p className="text-gray-600">
                      Your rank serves as credible proof of expertise for job applications and helps recruiters find top
                      talent.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-6">Ranking Progression</h4>
              <div className="space-y-4">
                {[
                  { rank: "Rookie ", xp: "0-100 XP", color: "bg-gray-200" },
                  { rank: "Builder", xp: "100-500 XP", color: "bg-blue-200" },
                  { rank: "Contributor", xp: "500-1,500 XP", color: "bg-green-200" },
                  { rank: "Merge Master", xp: "1,500-3,000 XP", color: "bg-yellow-200" },
                  { rank: "Code Expert", xp: "3,000-5,000 XP", color: "bg-orange-200" },
                  { rank: "Open Source Legend", xp: "5,000+ XP", color: "bg-purple-200" },
                ].map((level, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-4 h-4 rounded-full ${level.color}`}></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{level.rank}</span>
                        <span className="text-sm text-gray-500">{level.xp}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases - Subscription Cards */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Every Stakeholder</h2>
            <p className="text-xl text-gray-600">
              Three revenue streams that create value for contributors, maintainers, organizations, and recruiters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contributor */}
            <Card className="border border-gray-200 rounded-lg relative">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Contributors</CardTitle>
                <CardDescription className="text-gray-600">
                  Showcase contributions and participate in bounty issues
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">Free</span>
                  <div className="text-sm text-gray-500">100 coins/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Create and manage profile</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Track merged PRs automatically</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Stake virtual currency for PRs</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">XP-based ranking system</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Public portfolio building</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">
                    Revenue Stream: Purchase additional virtual coins when exhausted
                  </p>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Get started</Button>
              </CardContent>
            </Card>

            {/* Maintainer & Organization */}
            <Card className="border-2 border-gray-900 rounded-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gray-900 text-white">Most popular</Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Maintainers & Organizations</CardTitle>
                <CardDescription className="text-gray-600">
                  Manage projects, review and receive genuine PRs, and post bounty issues
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">$29</span>
                  <div className="text-sm text-gray-500">after 1 month of free usage</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Prioritized PR dashboard</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Post bounty issues for top talent</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Reduce spam and low-quality PRs</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Bounty management system</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Advanced analytics</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">
                    Revenue Stream: Monthly subscription + 5% bounty fees + premium promotions
                  </p>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Get started</Button>
              </CardContent>
            </Card>

            {/* Recruiter */}
            <Card className="border border-gray-200 rounded-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg text-gray-900">Recruiters</CardTitle>
                <CardDescription className="text-gray-600">
                  Access top open source talent and contributor profiles
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-gray-900">$59</span>
                  <div className="text-sm text-gray-500">per month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Access to contributor profiles</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Advanced search and filtering</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Skills and expertise analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Direct contact capabilities</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Priority job posting access</span>
                  </li>
                </ul>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-3">
                    Revenue Stream: Monthly subscription for profile access + hiring cost per recruit
                  </p>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Get started</Button>
              </CardContent>
            </Card>
          </div>
        </div>  
      </section>

      {/* Solving Real Market Problems */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Show-Stoppers</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Solving Real Market Problems</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Addressing critical pain points in the open-source ecosystem with our innovative virtual currency and
              ranking system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminates PR Spam</h3>
              <p className="text-gray-600 text-sm">
                Virtual currency staking discourages low-quality submissions and reduces maintainer workload by
                filtering serious contributors.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Motivates Maintainers</h3>
              <p className="text-gray-600 text-sm">
                Provides clear incentives and reduces workload for maintaining open-source projects through
                quality-focused submissions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Clear Metrics</h3>
              <p className="text-gray-600 text-sm">
                Creates tangible metrics for evaluating developer contributions and expertise through XP-based ranking
                system.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bridges the Gap</h3>
              <p className="text-gray-600 text-sm">
                Connects casual contributors with professional open-source opportunities through gamified career
                progression.
              </p>
            </div>
          </div>

          {/* Fair Risk-Reward Structure */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Fair Risk-Reward Structure</h3>
              <p className="text-gray-600">Ensuring fairness while promoting quality contributions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Merged PR</h4>
                <p className="text-gray-600 text-sm mb-2">Earns bounty (if applicable) + bonus virtual coins</p>
                <Badge className="bg-green-100 text-green-700">Full reward + bonus</Badge>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Reviewed but Not Merged</h4>
                <p className="text-gray-600 text-sm mb-2">Small deduction (up to maintainer limit), rest refunded</p>
                <Badge className="bg-yellow-100 text-yellow-700">Partial deduction</Badge>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <ArrowRight className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Not Reviewed</h4>
                <p className="text-gray-600 text-sm mb-2">Complete refund of staked virtual currency</p>
                <Badge className="bg-blue-100 text-blue-700">Full refund</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about Pull Quest's virtual currency and ranking system
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: "How does the virtual currency staking system work?",
                answer:
                  "Contributors stake virtual coins when submitting PRs to bounty issues. The amount is set by maintainers. If your PR is merged, you earn the bounty plus bonus coins. If reviewed but not merged, only a small amount is deducted (up to a limit set by maintainers). If not reviewed at all, you get a complete refund. This ensures fairness while encouraging quality submissions.",
              },
              {
                question: "What happens if my PR isn't reviewed by maintainers?",
                answer:
                  "You receive a complete refund of your staked virtual currency. We believe in fairness - you shouldn't lose coins for something outside your control like review delays or maintainer availability. This policy ensures contributors are only penalized for quality issues, not external factors.",
              },
              {
                question: "How is XP calculated and what are the different ranks?",
                answer:
                  "XP is calculated based on multiple factors: number of merged PRs, maintainer feedback scores, complexity tags of issues, community endorsements, and bounty values. You progress through six ranks: Code Novice (0-100 XP) → Code Apprentice (100-500 XP) → Code Contributor (500-1,500 XP) → Code Master (1,500-3,000 XP) → Code Expert (3,000-5,000 XP) → Open Source Legend (5,000+ XP).",
              },
              {
                question: "Is there a limit to how much virtual currency I can lose?",
                answer:
                  "Yes! Maintainers can only deduct up to a certain limit (typically 10-20% of the stake) for rejected PRs. The rest is automatically refunded. This prevents abuse while still discouraging spam submissions. The exact limits are set per repository by maintainers and are clearly displayed before you stake.",
              },
              {
                question: "How do the three revenue streams work?",
                answer:
                  "Pull Quest has three revenue streams: 1) Contributors can purchase additional virtual coins when exhausted, 2) Maintainers pay a small percentage (capped) from bounties plus optional premium promotions, 3) Tech recruiters pay for access to our curated pool of top contributors, filtered by expertise and project impact.",
              },
              {
                question: "Can recruiters really find me through my Pull Quest profile?",
                answer:
                  "Yes! Recruiters pay for access to our platform and can search contributors by programming languages, project types, XP levels, contribution history, and skill tags. Your verified metrics like merged PRs, maintainer endorsements, and ranking provide credible proof of expertise that recruiters value for technical hiring.",
              },
              {
                question: "What makes this different from existing bounty platforms?",
                answer:
                  "Unlike traditional bounty platforms, Pull Quest focuses on quality through virtual currency staking, provides comprehensive career progression through XP ranking, ensures fairness with our refund policy, and creates a unified profile system that showcases all your open-source work across repositories. It's designed for long-term career building, not just one-off bounties.",
              },
              {
                question: "How do I get started and earn my first virtual coins?",
                answer:
                  "Sign up with your GitHub account and you'll receive 100 free virtual coins to start. Create your profile, and the system will automatically track your existing merged PRs to calculate your initial XP. You can then browse bounty issues, stake coins on PRs you want to submit, and start building your open-source reputation.",
              },
            ].map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg bg-white">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <span className="text-lg font-semibold text-gray-900">Pull Quest</span>
              <p className="text-gray-600 mt-2 text-sm">
                The better way to stake your way to quality open source contributions.
              </p>
              <div className="flex space-x-4 mt-4">
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-gray-600">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Virtual Currency
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    XP Ranking
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Bounty System
                  </a>
                </li>
                
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">For</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Contributors
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Maintainers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Organizations
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Recruiters
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex justify-between items-center">
            <p className="text-sm text-gray-600">© 2025 Pull Quest. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
