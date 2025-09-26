import { useState } from "react"

interface RegisterPayload {
  role: string
  email: string
  password: string
  githubUsername?: string
}

export function useRegister() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const register = async ({ role, email, password, githubUsername }: RegisterPayload) => {
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          email,
          password,
          githubUsername: githubUsername || undefined,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Return success with the data
      return { success: true, data }
      
    } catch (err: any) {
      setError(err.message || "Something went wrong")
      // Return failure
      return { success: false, error: err.message || "Something went wrong" }
    } finally {
      setIsLoading(false)
    }
  }

  return { register, isLoading, error }
}