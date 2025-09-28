"use client";

import logo from "@/assets/Logo.png";
import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, ArrowRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/UseLogin";
import { useUser } from "@/context/UserProvider";
import { toast } from "sonner";

type LoginCase = "initial" | "success";
type UserRole = "contributor" | "maintainer" | "company";

export default function LoginPage() {
  const [currentCase, setCurrentCase] = useState<LoginCase>("initial");
  const [role, setRole] = useState<UserRole>();
  const [githubUsername, setGithubUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading, error } = useLogin();
  const { user, setUser } = useUser(); 

  const handleGoDashboard = () => {
    const targetRole = user?.role || role || "contributor";
    navigate(`/${targetRole}/dashboard`);
  };

  useEffect(() => {
    const savedRole = Cookie.get("pq_role") as UserRole | undefined;
    const savedGh = Cookie.get("pq_githubUsername");
    const savedEm = Cookie.get("pq_email");
    if (savedRole) setRole(savedRole);
    if (savedGh) setGithubUsername(savedGh);
    if (savedEm) setEmail(savedEm);
  }, []);

  useEffect(() => {
    if (role) Cookie.set("pq_role", role, { expires: 30 });
  }, [role]);

  useEffect(() => {
    if (githubUsername) Cookie.set("pq_githubUsername", githubUsername, { expires: 30 });
  }, [githubUsername]);

  useEffect(() => {
    if (email) Cookie.set("pq_email", email, { expires: 30 });
  }, [email]);

  useEffect(() => {
    if (user) {
      console.log("🔐 Context user:", user);
      console.log("🆔 User email:", user.email);
      console.log("🐙 GitHub username:", user.githubUsername);
      console.log("🐙 GitHub accessToken:", user.accessToken);
    }
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    const result = await login({
      role,
      email,
      password,
      githubUsername: role === "contributor" || role === "maintainer" ? githubUsername : undefined,
    });
    
    if (result.success) {
      setCurrentCase("success");
      toast.success("Login successful!");
      
      // Set user data if returned from login
      if ((result as any).user) {
        setUser((result as any).user);
      }
      
      // Navigate to dashboard after a brief delay
      setTimeout(() => {
        navigate(`/${role}/dashboard`);
      }, 1500);
    }
  };

  const renderLogin = () => (
    <Card className="border shadow-lg">
      <CardContent className="p-8">
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div>
            <Label>Who are you?</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)} disabled={isLoading} required>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contributor">Contributor</SelectItem>
                <SelectItem value="maintainer">Maintainer</SelectItem>
                <SelectItem value="company">Company</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(role === "contributor" || role === "maintainer") && (
            <div>
              <Label>GitHub Username</Label>
              <Input 
                type="text" 
                placeholder="octocat" 
                value={githubUsername} 
                onChange={(e) => setGithubUsername(e.target.value)} 
                disabled={isLoading} 
                required 
              />
            </div>
          )}

          <div>
            <Label>Email</Label>
            <Input 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              disabled={isLoading} 
              required 
            />
          </div>

          <div>
            <Label>Password</Label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading} 
                required 
                className="pr-12" 
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="absolute right-0 top-0 h-full px-3" 
                onClick={() => setShowPassword((v) => !v)} 
                disabled={isLoading}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-gray-900 text-white" 
            disabled={
              isLoading || 
              !role || 
              !email || 
              !password || 
              ((role === "contributor" || role === "maintainer") && !githubUsername)
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm">
          Don't have an account?{" "}
          <button 
            type="button" 
            className="font-medium text-gray-900 underline" 
            onClick={() => navigate("/signUp")}
          >
            Sign up for free
          </button>
        </p>
      </CardContent>
    </Card>
  );

  const renderSuccess = () => (
    <Card className="border shadow-lg">
      <CardContent className="p-8 text-center space-y-4">
        <Check className="mx-auto h-12 w-12 text-green-600" />
        <h3 className="text-xl font-semibold">
          Welcome back, {user?.role || role || "user"}!
        </h3>
        <p className="text-gray-600">
          You've been successfully logged in.
        </p>
        <Button className="w-full" onClick={handleGoDashboard}>
          Go to dashboard
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <span className="text-xl font-semibold text-gray-900">Pull Quest</span>
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900">
              <img src={logo} alt="Pull Quest Logo" className="h-16 w-16 object-cover rounded-full" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              {currentCase === "initial" ? "Welcome back" : "Success!"}
            </h1>
            {currentCase === "initial" && (
              <p className="text-gray-600">Sign in to your Pull Quest account</p>
            )}
          </div>

          {currentCase === "initial" && renderLogin()}
          {currentCase === "success" && renderSuccess()}
        </div>
      </div>
    </div>
  );
}