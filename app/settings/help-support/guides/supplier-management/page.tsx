// app/settings/help-support/guides/supplier-management/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, FileText, CheckCircle, Users, MessageSquare, FileCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SupplierManagementGuidePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Supplier Management Guide</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Managing Suppliers in SlateChain</span>
          </CardTitle>
          <CardDescription>
            Learn how to effectively manage your suppliers and optimize your supply chain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="adding">Adding Suppliers</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Supplier Management Overview"
                  fill
                  className="object-cover"
                />
              </div>

              <h2 className="text-2xl font-semibold mt-6">Supplier Management Overview</h2>
              <p className="text-muted-foreground">
                SlateChain's supplier management system helps you maintain relationships with your suppliers, track
                performance metrics, and streamline communication. This guide will walk you through the key features and
                best practices for managing suppliers effectively.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <FeatureCard
                  icon={<Users className="h-8 w-8" />}
                  title="Supplier Directory"
                  description="Maintain a comprehensive directory of all your suppliers with detailed profiles and contact information."
                />
                <FeatureCard
                  icon={<CheckCircle className="h-8 w-8" />}
                  title="Performance Tracking"
                  description="Monitor supplier performance with metrics like on-time delivery, quality ratings, and response times."
                />
                <FeatureCard
                  icon={<MessageSquare className="h-8 w-8" />}
                  title="Communication Tools"
                  description="Use built-in messaging and notification tools to communicate with suppliers directly within the platform."
                />
                <FeatureCard
                  icon={<FileCheck className="h-8 w-8" />}
                  title="Document Management"
                  description="Store and manage supplier-related documents such as contracts, certifications, and compliance records."
                />
              </div>
            </TabsContent>

            <TabsContent value="adding" className="space-y-6">
              <h2 className="text-2xl font-semibold">Adding and Managing Suppliers</h2>
              <p className="text-muted-foreground mb-6">
                Learn how to add new suppliers to your SlateChain account and manage their information effectively.
              </p>

              <div className="space-y-8">
                <StepItem
                  number={1}
                  title="Navigate to the Suppliers Section"
                  description="Click on 'Suppliers' in the main navigation sidebar to access the supplier management area."
                  image="/placeholder.svg?height=300&width=600"
                />

                <StepItem
                  number={2}
                  title="Add a New Supplier"
                  description="Click the 'Add Supplier' button in the top-right corner of the suppliers page. You can either create a new user account for the supplier or convert an existing user to a supplier role."
                  image="/placeholder.svg?height=300&width=600"
                />

                <StepItem
                  number={3}
                  title="Fill in Supplier Details"
                  description="Enter the supplier's information including name, contact details, address, and any other relevant information. You can also set a default rating and status for the supplier."
                  image="/placeholder.svg?height=300&width=600"
                />

                <StepItem
                  number={4}
                  title="Assign Manager (Optional)"
                  description="If you have multiple managers in your organization, you can assign specific managers to handle particular suppliers."
                  image="/placeholder.svg?height=300&width=600"
                />

                <StepItem
                  number={5}
                  title="Save and Activate"
                  description="Click 'Save' to add the supplier to your directory. The supplier will now appear in your supplier list and can be selected when creating purchase orders."
                  image="/placeholder.svg?height=300&width=600"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-2">Pro Tip</h3>
                <p className="text-sm text-muted-foreground">
                  For suppliers that you work with frequently, consider setting up automated purchase orders to
                  streamline your procurement process.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-6">
              <h2 className="text-2xl font-semibold">Supplier Communication</h2>
              <p className="text-muted-foreground mb-6">
                Effective communication with suppliers is essential for maintaining a smooth supply chain operation.
                SlateChain provides several tools to help you communicate with your suppliers.
              </p>

              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Supplier Communication"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-medium mt-6">Communication Features</h3>
              <div className="space-y-4 mt-4">
                <FeatureItem
                  title="In-App Messaging"
                  description="Send and receive messages directly within SlateChain. All communication is logged and searchable for future reference."
                />
                <FeatureItem
                  title="Email Notifications"
                  description="Configure email notifications for important updates and messages to ensure timely communication."
                />
                <FeatureItem
                  title="Bulk Messaging"
                  description="Send announcements or updates to multiple suppliers simultaneously when needed."
                />
                <FeatureItem
                  title="Message Templates"
                  description="Create and save message templates for common communications to save time and ensure consistency."
                />
              </div>

              <h3 className="text-xl font-medium mt-8">Best Practices</h3>
              <div className="space-y-4 mt-4">
                <FeatureItem
                  title="Regular Updates"
                  description="Maintain regular communication with suppliers about upcoming orders, changes in requirements, or feedback."
                />
                <FeatureItem
                  title="Clear Expectations"
                  description="Clearly communicate expectations regarding delivery times, quality standards, and other requirements."
                />
                <FeatureItem
                  title="Feedback Loop"
                  description="Establish a feedback loop with suppliers to continuously improve the relationship and address any issues promptly."
                />
                <FeatureItem
                  title="Document Conversations"
                  description="Keep records of important conversations and decisions for future reference and accountability."
                />
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <h2 className="text-2xl font-semibold">Supplier Document Management</h2>
              <p className="text-muted-foreground mb-6">
                Managing supplier documents efficiently is crucial for compliance, risk management, and smooth
                operations. SlateChain provides robust document management capabilities for your supplier relationships.
              </p>

              <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Document Management"
                  fill
                  className="object-cover"
                />
              </div>

              <h3 className="text-xl font-medium mt-6">Document Types</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <DocumentTypeCard
                  title="Contracts"
                  description="Store supplier contracts with expiration alerts and version history."
                />
                <DocumentTypeCard
                  title="Certifications"
                  description="Manage quality, compliance, and industry-specific certifications."
                />
                <DocumentTypeCard
                  title="Insurance Documents"
                  description="Track insurance certificates and coverage details."
                />
                <DocumentTypeCard
                  title="Compliance Records"
                  description="Store regulatory compliance documentation and audit records."
                />
                <DocumentTypeCard
                  title="Price Lists"
                  description="Maintain current and historical price lists and catalogs."
                />
                <DocumentTypeCard
                  title="Quality Reports"
                  description="Store quality inspection reports and test results."
                />
              </div>

              <h3 className="text-xl font-medium mt-8">Managing Documents</h3>
              <div className="space-y-4 mt-4">
                <FeatureItem
                  title="Upload Documents"
                  description="Upload documents directly to a supplier's profile or via the documents tab in the supplier section."
                />
                <FeatureItem
                  title="Set Expiration Dates"
                  description="Add expiration dates to documents like certifications and contracts to receive renewal reminders."
                />
                <FeatureItem
                  title="Document Sharing"
                  description="Share documents with suppliers or internal team members with appropriate access controls."
                />
                <FeatureItem
                  title="Version Control"
                  description="Maintain version history of documents to track changes over time."
                />
              </div>

              <div className="bg-muted p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-2">Security Note</h3>
                <p className="text-sm text-muted-foreground">
                  All documents stored in SlateChain are encrypted and accessible only to users with appropriate
                  permissions. Regular backups ensure your important supplier documents are never lost.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8">
            <Button variant="outline" asChild>
              <Link href="/settings/help-support">Back to Help Center</Link>
            </Button>
            <Button asChild>
              <Link href="/suppliers">Go to Suppliers</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
          <div className="space-y-1">
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StepItemProps {
  number: number
  title: string
  description: string
  image: string
}

function StepItem({ number, title, description, image }: StepItemProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
            {number}
          </div>
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        <p className="text-muted-foreground pl-11">{description}</p>
      </div>
      <div className="relative h-48 rounded-lg overflow-hidden">
        <Image src={image || "/placeholder.svg"} alt={`Step ${number}: ${title}`} fill className="object-cover" />
      </div>
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

interface DocumentTypeCardProps {
  title: string
  description: string
}

function DocumentTypeCard({ title, description }: DocumentTypeCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start space-x-3">
        <FileText className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  )
}

