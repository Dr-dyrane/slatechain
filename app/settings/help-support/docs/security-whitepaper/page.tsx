// app/settings/help-support/docs/security-whitepaper/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search, ChevronRight, Shield, Lock, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"

export default function SecurityWhitepaperPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Security Whitepaper</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search in security whitepaper..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Contents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                <TableOfContentsItem href="#introduction" label="Introduction" />
                <TableOfContentsItem href="#security-architecture" label="Security Architecture" />
                <TableOfContentsItem href="#data-protection" label="Data Protection" isExpanded>
                  <TableOfContentsItem href="#encryption" label="Encryption" level={2} />
                  <TableOfContentsItem href="#data-isolation" label="Data Isolation" level={2} />
                  <TableOfContentsItem href="#backup-recovery" label="Backup & Recovery" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#access-control" label="Access Control" isExpanded>
                  <TableOfContentsItem href="#authentication" label="Authentication" level={2} />
                  <TableOfContentsItem href="#authorization" label="Authorization" level={2} />
                  <TableOfContentsItem href="#mfa" label="Multi-Factor Authentication" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#network-security" label="Network Security" />
                <TableOfContentsItem href="#blockchain-security" label="Blockchain Security" />
                <TableOfContentsItem href="#compliance" label="Compliance & Certifications" />
                <TableOfContentsItem href="#incident-response" label="Incident Response" />
                <TableOfContentsItem href="#security-testing" label="Security Testing" />
                <TableOfContentsItem href="#best-practices" label="Security Best Practices" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-8">
                <section id="introduction" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Introduction</h2>
                  <p className="text-muted-foreground mb-4">
                    This security whitepaper provides a comprehensive overview of the security measures implemented in
                    SlateChain to protect your supply chain data and operations. It outlines our security architecture,
                    data protection mechanisms, access controls, and compliance certifications.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    At SlateChain, security is a core principle that guides our product development and operations. We
                    employ industry-leading security practices and technologies to ensure the confidentiality,
                    integrity, and availability of your data.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Security Principles</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Defense in depth with multiple security layers</li>
                      <li>Least privilege access control</li>
                      <li>End-to-end encryption for sensitive data</li>
                      <li>Regular security assessments and penetration testing</li>
                      <li>Continuous monitoring and threat detection</li>
                      <li>Compliance with industry standards and regulations</li>
                    </ul>
                  </div>
                </section>

                <section id="security-architecture" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Security Architecture</h2>
                  <p className="text-muted-foreground mb-4">
                    SlateChain's security architecture is designed with multiple layers of protection to safeguard your
                    data and ensure secure operations.
                  </p>

                  <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg?height=400&width=800"
                      alt="Security Architecture Diagram"
                      fill
                      className="object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-medium mt-6 mb-3">Key Components</h3>
                  <div className="space-y-4 mb-6">
                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Application Layer Security</h4>
                      <p className="text-sm text-muted-foreground">
                        The application layer includes secure coding practices, input validation, output encoding, and
                        protection against common web vulnerabilities such as XSS, CSRF, and SQL injection.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">API Security</h4>
                      <p className="text-sm text-muted-foreground">
                        All API endpoints are secured with authentication, rate limiting, and input validation. API
                        communications are encrypted using TLS 1.2 or higher.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Infrastructure Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Our infrastructure is hosted in SOC 2 compliant data centers with physical security controls. We
                        employ network segmentation, firewalls, and intrusion detection systems.
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">Data Security</h4>
                      <p className="text-sm text-muted-foreground">
                        Data is encrypted both in transit and at rest. We implement strict access controls and data
                        isolation between customers.
                      </p>
                    </div>
                  </div>
                </section>

                <section id="data-protection" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Data Protection</h2>
                  <p className="text-muted-foreground mb-4">
                    Protecting your data is our highest priority. SlateChain implements comprehensive data protection
                    measures to ensure the confidentiality, integrity, and availability of your supply chain
                    information.
                  </p>

                  <h3 id="encryption" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Encryption
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    SlateChain employs strong encryption to protect your data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">Transport Layer Security (TLS):</span> All data in transit is
                      encrypted using TLS 1.2 or higher
                    </li>
                    <li>
                      <span className="font-medium">Data at Rest:</span> All data stored in our databases is encrypted
                      using AES-256
                    </li>
                    <li>
                      <span className="font-medium">Field-level Encryption:</span> Sensitive data fields are encrypted
                      with unique keys
                    </li>
                    <li>
                      <span className="font-medium">Key Management:</span> Encryption keys are managed securely and
                      rotated regularly
                    </li>
                  </ul>

                  <h3 id="data-isolation" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Data Isolation
                  </h3>
                  <p className="text-muted-foreground mb-4">SlateChain ensures complete isolation of customer data:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>
                      <span className="font-medium">Multi-tenant Architecture:</span> Logical separation of customer
                      data
                    </li>
                    <li>
                      <span className="font-medium">Database Isolation:</span> Strict access controls at the database
                      level
                    </li>
                    <li>
                      <span className="font-medium">Tenant Identifiers:</span> All data is tagged with tenant
                      identifiers
                    </li>
                    <li>
                      <span className="font-medium">Access Controls:</span> Role-based access controls within each
                      tenant
                    </li>
                  </ul>

                  <h3 id="backup-recovery" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">
                    Backup & Recovery
                  </h3>
                  <p className="text-muted-foreground">SlateChain implements robust backup and recovery procedures:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>
                      <span className="font-medium">Automated Backups:</span> Regular automated backups of all customer
                      data
                    </li>
                    <li>
                      <span className="font-medium">Geo-redundancy:</span> Backups are stored in multiple geographic
                      locations
                    </li>
                    <li>
                      <span className="font-medium">Point-in-time Recovery:</span> Ability to restore data to any point
                      in time
                    </li>
                    <li>
                      <span className="font-medium">Backup Encryption:</span> All backups are encrypted with strong
                      encryption
                    </li>
                    <li>
                      <span className="font-medium">Backup Testing:</span> Regular testing of backup restoration
                      procedures
                    </li>
                  </ul>
                </section>

                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button asChild>
                    <Link href="#access-control">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="diagrams" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Security Diagrams</h2>
                <p className="text-muted-foreground mb-6">
                  These diagrams illustrate key aspects of SlateChain's security architecture and controls.
                </p>

                <div className="space-y-8">
                  <Card>
                    <CardHeader>
                      <CardTitle>Defense in Depth Model</CardTitle>
                      <CardDescription>Multiple layers of security controls</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Defense in Depth Model"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Data Encryption Flow</CardTitle>
                      <CardDescription>How data is encrypted throughout the system</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Data Encryption Flow"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Access Control Model</CardTitle>
                      <CardDescription>Role-based access control implementation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Access Control Model"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Incident Response Workflow</CardTitle>
                      <CardDescription>Process for handling security incidents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative h-80 w-full rounded-lg overflow-hidden">
                        <Image
                          src="/placeholder.svg?height=400&width=800"
                          alt="Incident Response Workflow"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="certifications" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Compliance & Certifications</h2>
                <p className="text-muted-foreground mb-6">
                  SlateChain maintains compliance with industry standards and regulations to ensure the highest level of
                  security for our customers.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-primary" />
                        SOC 2 Type II
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        SlateChain has successfully completed SOC 2 Type II audits, demonstrating our commitment to
                        security, availability, processing integrity, confidentiality, and privacy.
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Image
                          src="/placeholder.svg?height=100&width=200"
                          alt="SOC 2 Certification"
                          width={200}
                          height={100}
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <Lock className="h-5 w-5 mr-2 text-primary" />
                        ISO 27001
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Our ISO 27001 certification demonstrates our systematic approach to managing sensitive company
                        and customer information through our Information Security Management System (ISMS).
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Image
                          src="/placeholder.svg?height=100&width=200"
                          alt="ISO 27001 Certification"
                          width={200}
                          height={100}
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary" />
                        GDPR Compliance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        SlateChain is fully compliant with the General Data Protection Regulation (GDPR), ensuring
                        proper handling of personal data for European users and customers.
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Image
                          src="/placeholder.svg?height=100&width=200"
                          alt="GDPR Compliance"
                          width={200}
                          height={100}
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                        PCI DSS
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        For payment processing, SlateChain maintains PCI DSS compliance, ensuring that all credit card
                        information is handled according to the strictest security standards.
                      </p>
                      <div className="mt-4 flex justify-center">
                        <Image
                          src="/placeholder.svg?height=100&width=200"
                          alt="PCI DSS Compliance"
                          width={200}
                          height={100}
                          className="object-contain"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface TableOfContentsItemProps {
  href: string
  label: string
  level?: number
  isExpanded?: boolean
  children?: React.ReactNode
}

function TableOfContentsItem({ href, label, level = 1, isExpanded = false, children }: TableOfContentsItemProps) {
  const [expanded, setExpanded] = useState(isExpanded)
  const hasChildren = Boolean(children)

  return (
    <div className="space-y-1">
      <div className={`flex items-center ${level > 1 ? "pl-4" : ""}`}>
        {hasChildren && (
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 mr-1" onClick={() => setExpanded(!expanded)}>
            <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </Button>
        )}
        <Link href={href} className={`text-sm hover:underline ${level > 1 ? "text-muted-foreground" : "font-medium"}`}>
          {label}
        </Link>
      </div>
      {expanded && children && <div className="ml-2">{children}</div>}
    </div>
  )
}

