// app/settings/help-support/guides/getting-started/page.tsx

"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, BookOpen, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function GettingStartedGuidePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Getting Started with SlateChain</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>
              Step {currentStep} of {totalSteps}
            </span>
          </CardTitle>
          <CardDescription>Follow this guide to learn the basics of SlateChain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <StepContent
              title="Welcome to SlateChain"
              content={
                <>
                  <p className="mb-4">
                    SlateChain is a comprehensive supply chain management platform designed to help you manage
                    inventory, track orders, and optimize logistics with ease.
                  </p>
                  <p className="mb-4">
                    This guide will walk you through the basic features and functionality of SlateChain to help you get
                    started quickly.
                  </p>
                  <div className="relative w-full h-64 my-6 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="SlateChain Dashboard"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p>Let's begin by exploring the dashboard and navigation.</p>
                </>
              }
            />
          )}

          {currentStep === 2 && (
            <StepContent
              title="Dashboard & Navigation"
              content={
                <>
                  <p className="mb-4">
                    The SlateChain dashboard provides a quick overview of your supply chain operations with key metrics
                    and actionable insights.
                  </p>
                  <div className="space-y-4 my-6">
                    <FeatureItem
                      title="Navigation Sidebar"
                      description="Use the sidebar on the left to navigate between different sections of the application."
                    />
                    <FeatureItem
                      title="KPI Cards"
                      description="The dashboard displays key performance indicators in card format for quick insights."
                    />
                    <FeatureItem
                      title="Recent Activity"
                      description="View recent orders, inventory changes, and supplier updates in the activity feed."
                    />
                    <FeatureItem
                      title="Quick Actions"
                      description="Perform common tasks directly from the dashboard using the quick action buttons."
                    />
                  </div>
                  <div className="relative w-full h-64 my-6 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="SlateChain Navigation"
                      fill
                      className="object-cover"
                    />
                  </div>
                </>
              }
            />
          )}

          {currentStep === 3 && (
            <StepContent
              title="Inventory Management"
              content={
                <>
                  <p className="mb-4">
                    SlateChain's inventory management system helps you track stock levels, manage product information,
                    and optimize inventory across multiple locations.
                  </p>
                  <div className="space-y-4 my-6">
                    <FeatureItem
                      title="Product Catalog"
                      description="Manage your product catalog with detailed information, images, and specifications."
                    />
                    <FeatureItem
                      title="Stock Tracking"
                      description="Monitor stock levels across multiple warehouses and locations in real-time."
                    />
                    <FeatureItem
                      title="Low Stock Alerts"
                      description="Receive notifications when inventory levels fall below specified thresholds."
                    />
                    <FeatureItem
                      title="Batch & Expiry Tracking"
                      description="Track batch numbers and expiration dates for perishable or regulated products."
                    />
                  </div>
                  <div className="relative w-full h-64 my-6 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="Inventory Management"
                      fill
                      className="object-cover"
                    />
                  </div>
                </>
              }
            />
          )}

          {currentStep === 4 && (
            <StepContent
              title="Order Management"
              content={
                <>
                  <p className="mb-4">
                    The order management system allows you to create, track, and manage purchase orders and sales orders
                    throughout their lifecycle.
                  </p>
                  <div className="space-y-4 my-6">
                    <FeatureItem
                      title="Create Orders"
                      description="Create new purchase orders or sales orders with an intuitive form interface."
                    />
                    <FeatureItem
                      title="Order Tracking"
                      description="Track the status of orders from creation to fulfillment and delivery."
                    />
                    <FeatureItem
                      title="Order History"
                      description="Access a complete history of all orders with detailed information and documentation."
                    />
                    <FeatureItem
                      title="Automated Workflows"
                      description="Set up automated workflows for order approval, fulfillment, and notification."
                    />
                  </div>
                  <div className="relative w-full h-64 my-6 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="Order Management"
                      fill
                      className="object-cover"
                    />
                  </div>
                </>
              }
            />
          )}

          {currentStep === 5 && (
            <StepContent
              title="Next Steps"
              content={
                <>
                  <p className="mb-4">
                    Congratulations! You've completed the getting started guide for SlateChain. Here are some next steps
                    to help you get the most out of the platform:
                  </p>
                  <div className="space-y-4 my-6">
                    <FeatureItem
                      title="Explore Advanced Features"
                      description="Dive deeper into advanced features like supplier management, logistics tracking, and analytics."
                    />
                    <FeatureItem
                      title="Set Up Integrations"
                      description="Connect SlateChain with your existing systems through our integration options."
                    />
                    <FeatureItem
                      title="Customize Your Workspace"
                      description="Personalize your dashboard and settings to match your workflow."
                    />
                    <FeatureItem
                      title="Invite Team Members"
                      description="Add team members and assign appropriate roles and permissions."
                    />
                  </div>
                  <div className="flex justify-center my-6">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <p className="text-center">
                    For more detailed information, check out our other guides and documentation.
                  </p>
                </>
              }
            />
          )}

          <div className="flex justify-between mt-8">
            <Button onClick={prevStep} disabled={currentStep === 1} variant="outline">
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>Next</Button>
            ) : (
              <Button asChild>
                <Link href="/settings/help-support">Finish</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface StepContentProps {
  title: string
  content: React.ReactNode
}

function StepContent({ title, content }: StepContentProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="text-muted-foreground">{content}</div>
    </div>
  )
}

interface FeatureItemProps {
  title: string
  description: string
}

function FeatureItem({ title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

