// app/settings/help-support/schedule/page.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Calendar, Clock, Video, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [topic, setTopic] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [supportType, setSupportType] = useState<string>("general")
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success("Your support call has been scheduled successfully!")
    }, 1500)
  }

  // Generate available dates (next 14 days)
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1) // Start from tomorrow
    return date
  })

  // Generate available time slots
  const availableTimes = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"]

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Schedule Support Call</h1>
      </div>

      {isSuccess ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your Call is Scheduled!</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                We've sent a confirmation email with details and a calendar invitation. Our support team is looking
                forward to speaking with you.
              </p>
              <div className="bg-muted p-6 rounded-lg mb-6 w-full max-w-md">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-muted-foreground text-right">Date:</div>
                  <div className="font-medium">{selectedDate}</div>
                  <div className="text-muted-foreground text-right">Time:</div>
                  <div className="font-medium">{selectedTime}</div>
                  <div className="text-muted-foreground text-right">Topic:</div>
                  <div className="font-medium">{topic}</div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link href="/settings/help-support">Return to Help Center</Link>
                </Button>
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Book a Video Support Session</span>
            </CardTitle>
            <CardDescription>
              Schedule a 30-minute video call with our support team to get personalized assistance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="datetime" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-3 mb-2 md:mb-8">
                  <TabsTrigger value="datetime">
                    <Calendar className="h-4 w-4 mr-2" />
                    Date & Time
                  </TabsTrigger>
                  <TabsTrigger value="topic">
                    <Clock className="h-4 w-4 mr-2" />
                    Topic
                  </TabsTrigger>
                  <TabsTrigger value="contact" className="hidden md:flex">
                    <Video className="h-4 w-4 mr-2" />
                    Your Details
                  </TabsTrigger>
                </TabsList>
                <TabsList className="flex w-full mb-8 md:hidden">
                  <TabsTrigger value="contact" >
                    <Video className="h-4 w-4 mr-2" />
                    Your Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="datetime" className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select a Date</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableDates.map((date, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={selectedDate === formatDate(date) ? "default" : "outline"}
                          className="h-auto py-3"
                          onClick={() => setSelectedDate(formatDate(date))}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs opacity-75">
                              {date.toLocaleDateString("en-US", { weekday: "short" })}
                            </span>
                            <span className="text-lg font-semibold">{date.getDate()}</span>
                            <span className="text-xs opacity-75">
                              {date.toLocaleDateString("en-US", { month: "short" })}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Select a Time</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {availableTimes.map((time, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={selectedTime === time ? "default" : "outline"}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      All times are shown in your local timezone. Support sessions are 30 minutes long.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="topic" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="supportType">Support Category</Label>
                      <Select value={supportType} onValueChange={setSupportType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Questions</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="billing">Billing & Account</SelectItem>
                          <SelectItem value="integration">Integration Help</SelectItem>
                          <SelectItem value="blockchain">Blockchain Authentication</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic">Topic</Label>
                      <Input
                        id="topic"
                        placeholder="Brief description of your issue"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide details about your issue or question"
                        rows={5}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <RadioGroup defaultValue="medium">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low">Low - General question or inquiry</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">Medium - Issue affecting some functionality</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high">High - Critical issue affecting operations</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contact" className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        We'll send the meeting details and calendar invitation to this email.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Preferred Contact Method for Reminders</Label>
                      <RadioGroup defaultValue="email">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="email" id="email-reminder" />
                          <Label htmlFor="email-reminder">Email</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sms" id="sms-reminder" />
                          <Label htmlFor="sms-reminder">SMS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="both-reminder" />
                          <Label htmlFor="both-reminder">Both Email and SMS</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label>Additional Notes</Label>
                      <Textarea
                        placeholder="Any additional information you'd like us to know before the call"
                        rows={3}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" type="button" asChild>
                  <Link href="/settings/help-support">Cancel</Link>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !selectedDate || !selectedTime || !topic || !name || !email}
                >
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Call"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

