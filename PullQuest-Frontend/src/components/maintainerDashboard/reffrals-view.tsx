"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Gift, Copy, Share2, DollarSign, Users, TrendingUp, Check } from "lucide-react"

const referralStats = [
  {
    title: "Total Referrals",
    value: "12",
    icon: Users,
    change: "+3 this month",
  },
  {
    title: "Successful Conversions",
    value: "8",
    icon: TrendingUp,
    change: "66.7% conversion rate",
  },
  {
    title: "Total Earnings",
    value: "$240",
    icon: DollarSign,
    change: "+$60 this month",
  },
  {
    title: "Pending Rewards",
    value: "$90",
    icon: Gift,
    change: "3 pending approvals",
  },
]

const referralHistory = [
  {
    id: "1",
    email: "john@example.com",
    status: "Converted",
    signupDate: "2024-01-15",
    reward: "$30",
    plan: "Pro",
  },
  {
    id: "2",
    email: "jane@example.com",
    status: "Pending",
    signupDate: "2024-01-20",
    reward: "$30",
    plan: "Pro",
  },
  {
    id: "3",
    email: "bob@example.com",
    status: "Converted",
    signupDate: "2024-01-10",
    reward: "$30",
    plan: "Pro",
  },
  {
    id: "4",
    email: "alice@example.com",
    status: "Signed Up",
    signupDate: "2024-01-25",
    reward: "Pending",
    plan: "Free",
  },
]

const rewardTiers = [
  {
    referrals: "1-5",
    reward: "$30",
    description: "per successful referral",
    current: true,
  },
  {
    referrals: "6-15",
    reward: "$40",
    description: "per successful referral",
    current: false,
  },
  {
    referrals: "16+",
    reward: "$50",
    description: "per successful referral",
    current: false,
  },
]

export function ReferralsView() {
  const [referralCode] = useState("NISHANT2024")
  const [referralLink] = useState("https://coderabbit.ai/signup?ref=NISHANT2024")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Refer and Earn</h1>
              <p className="text-sm text-gray-600 mt-1">
                Invite friends and earn rewards for every successful referral.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {referralStats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className="w-5 h-5 text-gray-600" />
                        <Badge variant="secondary" className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Your Referral Link</CardTitle>
                  <CardDescription>Share this link with friends to start earning rewards.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Referral Code</label>
                    <div className="flex space-x-2">
                      <Input value={referralCode} readOnly className="border-gray-300 bg-gray-50" />
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(referralCode)}
                        className="border-gray-300"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Referral Link</label>
                    <div className="flex space-x-2">
                      <Input value={referralLink} readOnly className="border-gray-300 bg-gray-50" />
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(referralLink)}
                        className="border-gray-300"
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Referral History</CardTitle>
                  <CardDescription>Track your referrals and their status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {referralHistory.map((referral) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-medium text-gray-900">{referral.email}</span>
                            <Badge
                              variant={
                                referral.status === "Converted"
                                  ? "default"
                                  : referral.status === "Pending"
                                    ? "secondary"
                                    : "outline"
                              }
                              className={referral.status === "Converted" ? "bg-green-100 text-green-800" : ""}
                            >
                              {referral.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Signed up: {referral.signupDate}</span>
                            <span>Plan: {referral.plan}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">{referral.reward}</div>
                          <div className="text-xs text-gray-500">Reward</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reward Tiers</CardTitle>
                  <CardDescription>Earn more as you refer more friends.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewardTiers.map((tier, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${tier.current ? "border-blue-200 bg-blue-50" : "border-gray-200"}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{tier.referrals} referrals</span>
                          {tier.current && <Badge className="bg-blue-600">Current</Badge>}
                        </div>
                        <div className="text-lg font-bold text-gray-900">{tier.reward}</div>
                        <div className="text-xs text-gray-600">{tier.description}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress to next tier</span>
                      <span>8/15 referrals</span>
                    </div>
                    <Progress value={53} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>How It Works</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Share your link</p>
                        <p className="text-gray-600">Send your referral link to friends and colleagues</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">They sign up</p>
                        <p className="text-gray-600">Your friend creates an account using your link</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">You both earn</p>
                        <p className="text-gray-600">Get rewards when they upgrade to a paid plan</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 space-y-2">
                    <p>• Rewards are paid after successful conversion to paid plan</p>
                    <p>• Minimum payout threshold is $50</p>
                    <p>• Payments processed monthly</p>
                    <p>• Self-referrals are not allowed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
