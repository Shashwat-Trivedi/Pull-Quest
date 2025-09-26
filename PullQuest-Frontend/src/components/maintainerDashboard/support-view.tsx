"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, MessageCircle, Mail, Phone, CheckCircle } from "lucide-react"

const supportTickets = [
  {
    id: "#12345",
    title: "Integration with GitHub not working",
    status: "Open",
    priority: "High",
    created: "2 hours ago",
    lastUpdate: "1 hour ago",
  },
  {
    id: "#12344",
    title: "API rate limit questions",
    status: "In Progress",
    priority: "Medium",
    created: "1 day ago",
    lastUpdate: "4 hours ago",
  },
  {
    id: "#12343",
    title: "Billing inquiry about subscription",
    status: "Resolved",
    priority: "Low",
    created: "3 days ago",
    lastUpdate: "2 days ago",
  },
]

const faqItems = [
  {
    question: "How do I connect my GitHub repository?",
    answer:
      "You can connect your GitHub repository by going to the Integrations page and clicking on the GitHub integration card.",
  },
  {
    question: "What are the API rate limits?",
    answer: "Free accounts have a limit of 1,000 API calls per month. Pro accounts have 10,000 calls per month.",
  },
  {
    question: "How do I upgrade my subscription?",
    answer: "You can upgrade your subscription from the Subscription page in your organization settings.",
  },
  {
    question: "Can I export my code review data?",
    answer: "Yes, you can export your data from the Reports section. This feature is available for Pro subscribers.",
  },
]

export function SupportView() {
  const [ticketTitle, setTicketTitle] = useState("")
  const [ticketDescription, setTicketDescription] = useState("")
  const [ticketPriority, setTicketPriority] = useState("")

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-gray-600" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Support</h1>
              <p className="text-sm text-gray-600 mt-1">Get help with CodeRabbit or submit a support ticket.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submit a Support Ticket</CardTitle>
                  <CardDescription>Describe your issue and we'll get back to you as soon as possible.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-title">Subject</Label>
                    <Input
                      id="ticket-title"
                      placeholder="Brief description of your issue"
                      value={ticketTitle}
                      onChange={(e) => setTicketTitle(e.target.value)}
                      className="border-gray-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-priority">Priority</Label>
                    <Select value={ticketPriority} onValueChange={setTicketPriority}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ticket-description">Description</Label>
                    <Textarea
                      id="ticket-description"
                      placeholder="Please provide detailed information about your issue..."
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="border-gray-300 min-h-[120px]"
                    />
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Submit Ticket</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Support Tickets</CardTitle>
                  <CardDescription>Track the status of your submitted tickets.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-gray-900">{ticket.id}</span>
                            <Badge
                              variant={
                                ticket.status === "Open"
                                  ? "destructive"
                                  : ticket.status === "In Progress"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {ticket.status}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                ticket.priority === "High"
                                  ? "border-red-300 text-red-700"
                                  : ticket.priority === "Medium"
                                    ? "border-yellow-300 text-yellow-700"
                                    : "border-gray-300 text-gray-700"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Created: {ticket.created}</span>
                            <span>Last update: {ticket.lastUpdate}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-3" />
                    Live Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-3" />
                    Email Support
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="w-4 h-4 mr-3" />
                    Schedule Call
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Monday - Friday</span>
                      <span className="text-gray-600">9 AM - 6 PM PST</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Saturday</span>
                      <span className="text-gray-600">10 AM - 4 PM PST</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sunday</span>
                      <span className="text-gray-600">Closed</span>
                    </div>
                    <div className="flex items-center mt-3 p-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-green-800 text-xs">Currently Online</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {faqItems.map((faq, index) => (
                      <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{faq.question}</h4>
                        <p className="text-xs text-gray-600">{faq.answer}</p>
                      </div>
                    ))}
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
