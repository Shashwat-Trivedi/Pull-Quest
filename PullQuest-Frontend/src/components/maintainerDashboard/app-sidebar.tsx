"use client";

import * as React from "react";
import {
  BarChart3,
  BookOpen,
  FileText,
  GitBranch,
  HelpCircle,
  Puzzle,
  Settings,
  Users,
  ChevronUp,
  ChevronDown,
  Gift,
  PlusCircle,
  DollarSign, // New icon for Bounty Issues
} from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useUser } from "@/context/UserProvider";
import logo from "../../../public/Logo.png"

// Updated navigation items with new Bounty Issues route
const navigationItems = [
  { title: "Repositories", icon: GitBranch,       url: "/dashboard" },
  { title: "Create Issue", icon: PlusCircle,      url: "/new-issue" },
  { title: "Bounty Issues by Me", icon: DollarSign, url: "/bounty-issues" }, // New route
  { title: "Docs",         icon: FileText,        url: "/docs" },
  { title: "Integrations", icon: Puzzle,          url: "/integrations" },
  { title: "Reports",      icon: BarChart3,       url: "/reports" },
];

const organizationSubItems = [
  { title: "Configuration", url: "/org-settings/config" },
  { title: "API Keys",      url: "/org-settings/api-keys" },
];

const bottomItems = [
  { title: "Refer and Earn", icon: Gift,      url: "/referrals" },
  { title: "Docs",           icon: FileText,  url: "/docs" },
  { title: "Support",        icon: HelpCircle, url: "/support" },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [isOrgOpen, setIsOrgOpen] = React.useState(true);
  const { user } = useUser();

  React.useEffect(() => {
    if (user?.githubUsername) {
      console.log("🐙 GitHub username:", user.githubUsername);
    }
  }, [user]);

  return (
    <Sidebar className="border-r border-gray-200 bg-white w-64" {...props}>
      <SidebarHeader className="border-b border-gray-100 p-4">
        <div className="flex items-center space-x-3">
            <img src={logo} alt="" className="h-10 w-10 rounded-lg"/>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">
              {user?.githubUsername ?? "Maintainer"}
            </h2>
            {/* <p className="text-xs text-gray-500">Change Organization</p> */}
          </div>
          {/* <ChevronDown className="w-4 h-4 text-gray-400 ml-auto" /> */}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={`/maintainer${item.url}`}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm rounded-md hover:bg-gray-100"
                    >
                      <item.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-1">
          <Collapsible open={isOrgOpen} onOpenChange={setIsOrgOpen}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton className="w-full justify-between px-3 py-2.5 text-sm rounded-md hover:bg-gray-100">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="text-gray-700">Organization Settings</span>
                  </div>
                  <ChevronUp
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isOrgOpen ? "" : "rotate-180"
                    }`}
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {organizationSubItems.map((sub) => (
                    <SidebarMenuSubItem key={sub.title}>
                      <SidebarMenuSubButton asChild>
                        <Link
                          to={`/maintainer${sub.url}`}
                          className="block px-6 py-2 text-sm text-gray-600 hover:bg-gray-50"
                        >
                          {sub.title}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup className="mt-1 flex-1">
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={`/maintainer${item.url}`}
                      className="flex items-center space-x-3 w-full px-3 py-2.5 text-sm rounded-md hover:bg-gray-100"
                    >
                      <item.icon className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-100 p-3">
        <div className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-50">
          <Avatar className="w-7 h-7">
            <AvatarImage src="/placeholder.svg" alt="User" />
            <AvatarFallback>{user?.githubUsername?.[0] ?? "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.githubUsername ?? "You"}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <Users className="w-3 h-3 text-gray-400" />
            </Button>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <Settings className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 mt-2"
        >
          <ChevronDown className="w-4 h-4 mr-2" />
          Collapse
        </Button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}