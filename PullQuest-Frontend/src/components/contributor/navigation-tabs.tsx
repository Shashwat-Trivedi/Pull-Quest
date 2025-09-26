"use client"

import { User, FolderOpen } from "lucide-react"

interface NavigationTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function NavigationTabs({ activeTab, setActiveTab }: NavigationTabsProps) {
  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "repositories", label: "Repositories", icon: FolderOpen },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 mb-8">
      <div className="border-b border-neutral-100">
        <nav className="flex px-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`py-6 px-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === id
                  ? "border-neutral-900 text-neutral-900"
                  : "border-transparent text-neutral-500 hover:text-neutral-700"
              }`}
            >
              <Icon className="w-4 h-4 inline mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
