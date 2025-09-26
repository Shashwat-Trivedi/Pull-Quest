"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Github, Plus, Tag, Users, AlertCircle, FileText, GitBranch, Coins, CheckCircle, X, DollarSign, Shield } from "lucide-react"
import { BlockchainAPI, CreateIssueRequest } from "../../utils/blockchainApi"
import { MapAddressButton } from "../MapAddressButton"

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

const Toast = ({ message, type, onClose }: ToastProps) => (
  <div className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-50 border-green-200 text-green-800' 
      : 'bg-red-50 border-red-200 text-red-800'
  }`}>
    {type === 'success' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    )}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
      <X className="w-4 h-4" />
    </button>
  </div>
)

const PRESET_LABELS = [
  { name: "bug", color: "bg-red-100 text-red-800 border-red-200" },
  { name: "enhancement", color: "bg-blue-100 text-blue-800 border-blue-200" },
  { name: "question", color: "bg-purple-100 text-purple-800 border-purple-200" },
  { name: "documentation", color: "bg-green-100 text-green-800 border-green-200" },
  { name: "good first issue", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
]

const PRESET_STAKES = [5, 10, 25, 50]
const PRESET_BOUNTIES = [50, 100, 250, 500, 1000]

// Helper functions for cookies
const cookieSet = (key: string, value: string | string[], days: number = 7) => {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    const valueStr = typeof value === "string" ? value : JSON.stringify(value);
    document.cookie = `${key}=${encodeURIComponent(valueStr)};expires=${expires.toUTCString()};path=/`;
  } catch (e) {
    console.warn("Could not save to cookies:", e);
  }
}

const cookieGet = (key: string): string => {
  try {
    const name = key + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
  } catch (e) {
    console.warn("Could not read from cookies:", e);
  }
  return "";
}

const cookieGetArr = (key: string): string[] => {
  try {
    const val = cookieGet(key);
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  } catch (e) {
    console.warn("Could not read array from cookies:", e);
  }
  return [];
}

const cookieDelete = (key: string) => {
  try {
    document.cookie = `${key}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  } catch (e) {
    console.warn("Could not delete cookie:", e);
  }
}

export default function NewIssueForm() {
  const [owner, setOwner] = useState("")
  const [repo, setRepo] = useState("")
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [labels, setLabels] = useState<string[]>([])
  const [assignees, setAssignees] = useState<string>("")
  const [milestone, setMilestone] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Separate stake and bounty amounts
  const [stakeAmount, setStakeAmount] = useState<string>("")
  const [bountyAmount, setBountyAmount] = useState<string>("")
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // On mount, restore values from cookies
  useEffect(() => {
    const savedOwner = cookieGet("issue_owner")
    const savedRepo = cookieGet("issue_repo")
    const savedTitle = cookieGet("issue_title")
    const savedBody = cookieGet("issue_body")
    const savedLabels = cookieGetArr("issue_labels")
    const savedAssignees = cookieGet("issue_assignees")
    const savedMilestone = cookieGet("issue_milestone")
    const savedStakeAmount = cookieGet("issue_stakeAmount")
    const savedBountyAmount = cookieGet("issue_bountyAmount")

    setOwner(savedOwner)
    setRepo(savedRepo)
    setTitle(savedTitle)
    setBody(savedBody)
    setLabels(savedLabels)
    setAssignees(savedAssignees)
    setMilestone(savedMilestone)
    setStakeAmount(savedStakeAmount)
    setBountyAmount(savedBountyAmount)

    console.log("📱 Restored form data from cookies:", {
      owner: savedOwner,
      repo: savedRepo,
      title: savedTitle,
      body: savedBody ? savedBody.substring(0, 50) + "..." : "",
      labels: savedLabels,
      assignees: savedAssignees,
      milestone: savedMilestone,
      stakeAmount: savedStakeAmount,
      bountyAmount: savedBountyAmount
    })
  }, [])

  // On value change, save to cookies with debouncing
  useEffect(() => { 
    cookieSet("issue_owner", owner)
    console.log("💾 Saved owner to cookies:", owner)
  }, [owner])
  
  useEffect(() => { 
    cookieSet("issue_repo", repo)
    console.log("💾 Saved repo to cookies:", repo)
  }, [repo])
  
  useEffect(() => { 
    cookieSet("issue_title", title)
    console.log("💾 Saved title to cookies:", title)
  }, [title])
  
  useEffect(() => { 
    cookieSet("issue_body", body)
    console.log("💾 Saved body to cookies:", body ? `${body.length} characters` : "empty")
  }, [body])
  
  useEffect(() => { 
    cookieSet("issue_labels", labels)
    console.log("💾 Saved labels to cookies:", labels)
  }, [labels])
  
  useEffect(() => { 
    cookieSet("issue_assignees", assignees)
    console.log("💾 Saved assignees to cookies:", assignees)
  }, [assignees])
  
  useEffect(() => { 
    cookieSet("issue_milestone", milestone)
    console.log("💾 Saved milestone to cookies:", milestone)
  }, [milestone])
  
  useEffect(() => { 
    cookieSet("issue_stakeAmount", stakeAmount)
    console.log("💾 Saved stake amount to cookies:", stakeAmount)
  }, [stakeAmount])
  
  useEffect(() => { 
    cookieSet("issue_bountyAmount", bountyAmount)
    console.log("💾 Saved bounty amount to cookies:", bountyAmount)
  }, [bountyAmount])

  const toggleLabel = (l: string) =>
    setLabels((prev) => (prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l]))

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000) // Auto-hide after 5 seconds
  }

  const clearForm = () => {
    // Clear state
    setTitle("")
    setBody("")
    setLabels([])
    setAssignees("")
    setMilestone("")
    setStakeAmount("")
    setBountyAmount("")
    setError(null)
    
    // Clear cookies
    cookieDelete("issue_title")
    cookieDelete("issue_body")
    cookieDelete("issue_labels")
    cookieDelete("issue_assignees")
    cookieDelete("issue_milestone")
    cookieDelete("issue_stakeAmount")
    cookieDelete("issue_bountyAmount")
    
    console.log("✨ Form cleared and cookies deleted")
  }

const handleSubmit = async () => {
    if (!owner.trim() || !repo.trim()) {
      setError("Owner and Repository are required")
      return
    }
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    if (!stakeAmount.trim() || Number(stakeAmount) <= 0) {
      setError("A valid stake amount is required")
      return
    }
    if (!bountyAmount.trim() || Number(bountyAmount) <= 0) {
      setError("A valid bounty amount is required")
      return
    }
    
    setSubmitting(true)
    setError(null)

    // Blockchain API payload
    const blockchainPayload: CreateIssueRequest = {
      owner,
      repo,
      title,
      body,
      stakeAmount: Number(stakeAmount),
      labels,
    }

    // Backend API payload - add both stake and bounty labels automatically
    const stakeLabel = `stake-${stakeAmount}`
    const bountyLabel = `bounty-${bountyAmount}ℏ`
    const backendLabels = [...labels, stakeLabel, bountyLabel]
    
    const backendPayload = {
      owner,
      repo,
      title,
      body,
      labels: backendLabels,
      assignees: assignees.split(",").map((a) => a.trim()).filter(Boolean),
      milestone: milestone || undefined,
      stakeAmount: Number(stakeAmount),
      bountyAmount: Number(bountyAmount), // Add bounty to backend payload
    }

    // Backend API configuration
    const url = "http://localhost:8012/api/maintainer/create-issue"
    const jwt = cookieGet("token") || (typeof localStorage !== 'undefined' ? localStorage.getItem("token") : null)

    try {
      console.log("Creating issue on blockchain and backend simultaneously...")
      console.log("Backend URL:", url)
      console.log("JWT Token:", jwt ? "Present" : "Not present")
      console.log("Blockchain payload:", blockchainPayload)
      console.log("Backend payload:", backendPayload)
      console.log("Added stake label:", stakeLabel)
      console.log("Added bounty label:", bountyLabel)
      
      // Make backend request with detailed logging
      const backendRequest = fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(jwt && { Authorization: `Bearer ${jwt}` }),
        },
        credentials: 'include',
        body: JSON.stringify(backendPayload),
      }).then(async (response) => {
        console.log("Backend response status:", response.status)
        console.log("Backend response headers:", response.headers)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Backend error response:", errorText)
          throw new Error(`Backend request failed: ${response.status} - ${errorText}`)
        }
        
        return response.json()
      }).catch(error => {
        console.error("Backend request error:", error)
        throw error
      })
      
      // Make both requests simultaneously
      const [blockchainResponse, backendResponse] = await Promise.all([
        BlockchainAPI.createIssue(blockchainPayload),
        backendRequest
      ])
      
      console.log("Blockchain response:", blockchainResponse)
      console.log("Backend response:", backendResponse)
      
      // Check if both requests were successful
      if (blockchainResponse.success && blockchainResponse.data && 
          backendResponse.success && backendResponse.data) {
        
        // Show success toast with both blockchain and GitHub info
        showToast(
          `Issue #${backendResponse.data.number} created on GitHub and blockchain (#${blockchainResponse.data.blockchainIssueId}) with ${stakeAmount} HBAR stake and ${bountyAmount} HBAR bounty! TX: ${blockchainResponse.data.txHash?.slice(0, 10)}...`,
          'success'
        )
        
        // Clear the form
        clearForm()
        
        // Stay on the same page (don't navigate)
        console.log(`✅ GitHub Issue created: #${backendResponse.data.number} - ${backendResponse.data.title}`)
        console.log(`✅ Blockchain Issue created: #${blockchainResponse.data.blockchainIssueId}`)
        console.log(`🔗 Transaction Hash: ${blockchainResponse.data.txHash}`)
        console.log(`🛡️ Stake Amount: ${blockchainResponse.data.stakeAmount} HBAR`)
        // Bounty amount is not available in blockchainResponse.data
        console.log(`📄 View on HashScan: https://hashscan.io/testnet/transaction/${blockchainResponse.data.txHash}`)
        
      } else {
        // Handle partial failures
        const errors = []
        if (!blockchainResponse.success) {
          errors.push(`Blockchain: ${blockchainResponse.message || "Failed"}`)
        }
        if (!backendResponse.success) {
          errors.push(`Backend: ${backendResponse.message || "Failed"}`)
        }
        
        const errorMsg = errors.length > 0 ? errors.join(", ") : "Issue creation failed"
        setError(errorMsg)
        showToast(errorMsg, 'error')
      }
    } catch (e: any) {
      const errorMsg = e.message || "Unknown error occurred"
      setError(errorMsg)
      showToast(errorMsg, 'error')
      console.error("Error creating issue:", e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
      
      <div className="mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <Github className="w-6 h-6 text-gray-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Issue with Stake & Bounty</h1>
            <p className="text-gray-600">
              Define the issue, set your stake amount, and offer a bounty reward.
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-200">
        <CardContent className="p-8">
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Owner / Organization</label>
                </div>
                <Input 
                  placeholder="e.g., facebook" 
                  value={owner} 
                  onChange={(e) => setOwner(e.target.value)} 
                  disabled={submitting} 
                  className="font-medium border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Repository Name</label>
                </div>
                <Input 
                  placeholder="e.g., react" 
                  value={repo} 
                  onChange={(e) => setRepo(e.target.value)} 
                  disabled={submitting} 
                  className="font-medium border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
            </div>

            <div className="space-y-6 border-t border-gray-100 pt-8">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Issue Title</label>
                </div>
                <Input 
                  placeholder="Brief description of the issue" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  disabled={submitting} 
                  className="text-lg font-medium border-gray-200 focus:border-blue-500 focus:ring-blue-500" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <Textarea 
                  placeholder="Provide a detailed description of the issue..." 
                  rows={12} 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)} 
                  disabled={submitting} 
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 leading-relaxed" 
                />
              </div>
            </div>
            
            {/* Separate Stake Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Stake Amount (HBAR)</h3>
                </div>
                <p className="text-sm text-gray-500">
                  Your stake amount that will be locked in the smart contract as collateral for creating this issue.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_STAKES.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={stakeAmount === String(amount) ? "default" : "outline"}
                      onClick={() => setStakeAmount(String(amount))}
                      disabled={submitting}
                      className="transition-all duration-200 border-orange-200 text-orange-700 hover:bg-orange-50"
                    >
                      {amount} HBAR
                    </Button>
                  ))}
                  <div className="relative flex-grow min-w-[150px]">
                    <Input
                      type="number"
                      placeholder="Custom stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={submitting}
                      className="pl-4 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      min="1"
                    />
                  </div>
                </div>
                {stakeAmount && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                    A label "stake-{stakeAmount}ℏ" will be automatically added to the GitHub issue.
                  </div>
                )}
              </div>
            </div>

            {/* Separate Bounty Section */}
            <div className="border-t border-gray-100 pt-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Bounty Reward (HBAR)</h3>
                </div>
                <p className="text-sm text-gray-500">
                  The bounty reward that will be paid to the developer who successfully resolves this issue.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {PRESET_BOUNTIES.map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={bountyAmount === String(amount) ? "default" : "outline"}
                      onClick={() => setBountyAmount(String(amount))}
                      disabled={submitting}
                      className="transition-all duration-200 border-green-200 text-green-700 hover:bg-green-50"
                    >
                      {amount} HBAR
                    </Button>
                  ))}
                  <div className="relative flex-grow min-w-[150px]">
                    <Input
                      type="number"
                      placeholder="Custom bounty"
                      value={bountyAmount}
                      onChange={(e) => setBountyAmount(e.target.value)}
                      disabled={submitting}
                      className="pl-4 border-gray-200 focus:border-green-500 focus:ring-green-500"
                      min="1"
                    />
                  </div>
                </div>
                {bountyAmount && (
                  <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                    A label "bounty-{bountyAmount}ℏ" will be automatically added to the GitHub issue.
                  </div>
                )}
              </div>
            </div>

            {/* Summary Section */}
            {(stakeAmount || bountyAmount) && (
              <div className="border-t border-gray-100 pt-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">Transaction Summary:</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    {stakeAmount && (
                      <div className="flex justify-between">
                        <span>Your Stake (Locked):</span>
                        <span className="font-medium">{stakeAmount} HBAR</span>
                      </div>
                    )}
                    {bountyAmount && (
                      <div className="flex justify-between">
                        <span>Bounty Reward (Escrowed):</span>
                        <span className="font-medium">{bountyAmount} HBAR</span>
                      </div>
                    )}
                    {stakeAmount && bountyAmount && (
                      <div className="flex justify-between border-t border-blue-300 pt-1 mt-2">
                        <span className="font-semibold">Total HBAR Required:</span>
                        <span className="font-bold">{Number(stakeAmount) + Number(bountyAmount)} HBAR</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-100 pt-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Labels</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {PRESET_LABELS.map(({ name, color }) => (
                    <Badge 
                      key={name} 
                      onClick={() => toggleLabel(name)} 
                      className={`cursor-pointer border transition-all duration-200 hover:scale-105 ${
                        labels.includes(name) 
                          ? color + " shadow-sm" 
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <div className="border-t border-gray-100 bg-gray-50 px-8 py-6 rounded-b-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Both stake and bounty will be locked in the smart contract and issue created on GitHub
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                onClick={() => window.history.back()} 
                disabled={submitting} 
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !title.trim() || !owner.trim() || !repo.trim() || !stakeAmount.trim() || !bountyAmount.trim()} 
                className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating on Blockchain & GitHub...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Create Issue with Stake & Bounty
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <MapAddressButton
        githubUsername="NishantSinghhhhhh"
        userAddress="0x236496846af4047acca20F91d8179ffd92D19cdD"
      />
    </div>
  )
}