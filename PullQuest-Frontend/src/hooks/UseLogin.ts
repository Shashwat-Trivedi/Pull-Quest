// src/hooks/useLogin.ts
import { useState } from "react"
import axios from "axios"

import { toast } from "sonner"
import { useUser } from "../context/UserProvider"

interface LoginPayload {
  role: "contributor" | "maintainer" | "company"
  email?: string
  password?: string
  githubUsername?: string
}

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setUser } = useUser()

  const login = async (payload: LoginPayload) => {
    setIsLoading(true)
    setError(null)

    try {
      // 1) authenticate
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        payload
      )
      const token = response.data.token as string
      localStorage.setItem("token", token)
      toast.success("Login successful")

      // 2) Prime context from payload
      setUser({
              id: "",                   // will be refreshed by UserProvider effect
              email: payload.email,
              role: payload.role,
              githubUsername: payload.githubUsername,
              accessToken: token,       // Add accessToken from the login response
            })

      // 3) navigate
      // navigate(`/${payload.role}/dashboard`)
      return { success: true }
    } catch (err: any) {
      const message = err.response?.data?.message || "Login failed"
      setError(message)
      toast.error(message)
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  return { login, isLoading, error }
}
