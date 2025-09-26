"use client"

import logo from "@/assets/Logo.png";
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowRight } from "lucide-react"
import { useRegister } from "../hooks/UseRegister"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"

export default function SignUp() {
  const [role, setRole] = useState("")
  const [githubUsername, setGithubUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { register, isLoading, error } = useRegister()
  const navigate = useNavigate()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await register({
      role,
      email,
      password,
      githubUsername: (role === "contributor" || role === "maintainer") ? githubUsername : undefined,
    })

    if (result?.success) {
        toast("✅ User registered successfully!")


      setTimeout(() => {
        navigate("/login")
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-semibold text-gray-900">Pull Quest</span>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900">
  <img src={logo} alt="Pull Quest Logo" className="h-16 w-16 object-cover rounded-full" />
</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Pull Quest Now </h1>
            <p className="text-xl text-gray-600">Let’s get you started based on your role</p>
          </div>

          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSignup} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Who are you?</Label>
                  <Select value={role} onValueChange={setRole} required>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contributor">Contributor</SelectItem>
                      <SelectItem value="maintainer">Maintainer</SelectItem>
                      <SelectItem value="company">Company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* GitHub Username */}
                {(role === "contributor" || role === "maintainer") && (
                  <div className="space-y-2">
                    <Label htmlFor="githubUsername">GitHub Username</Label>
                    <Input
                      id="githubUsername"
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="e.g. octocat"
                      className="h-12"
                    />
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="you@example.com"
                    className="h-12"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    placeholder="Enter password"
                    className="h-12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-medium"
                  disabled={
                    isLoading ||
                    !email ||
                    !password ||
                    !role ||
                    ((role === "contributor" || role === "maintainer") && !githubUsername)
                  }
                >
                  {isLoading ? (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4 animate-spin" />
                      Signing up...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-8 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <a href="/login" className="font-medium text-gray-900 hover:underline">
                  Log in
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
