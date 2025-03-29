// app/settings/help-support/docs/admin-guide/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ShieldAlert, Search, ChevronRight, Users, Settings, Lock, Database } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import Image from "next/image"

export default function AdminGuidePage() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/settings/help-support">
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold">Administrator Guide</h1>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search in admin guide..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <ShieldAlert className="h-5 w-5" />
                            <span>Admin Contents</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="space-y-1">
                                <TableOfContentsItem href="#introduction" label="Introduction" />
                                <TableOfContentsItem href="#user-management" label="User Management" isExpanded>
                                    <TableOfContentsItem href="#adding-users" label="Adding Users" level={2} />
                                    <TableOfContentsItem href="#roles-permissions" label="Roles & Permissions" level={2} />
                                    <TableOfContentsItem href="#user-groups" label="User Groups" level={2} />
                                </TableOfContentsItem>
                                <TableOfContentsItem href="#system-configuration" label="System Configuration" />
                                <TableOfContentsItem href="#security" label="Security Settings" />
                                <TableOfContentsItem href="#data-management" label="Data Management" />
                                <TableOfContentsItem href="#integrations" label="Integration Management" />
                                <TableOfContentsItem href="#audit-logs" label="Audit Logs" />
                                <TableOfContentsItem href="#backup-restore" label="Backup & Restore" />
                                <TableOfContentsItem href="#performance" label="Performance Monitoring" />
                                <TableOfContentsItem href="#troubleshooting" label="Troubleshooting" />
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <Card className="md:col-span-3">
                    <CardContent className="p-6">
                        <Tabs defaultValue="content" className="w-full">
                            <TabsList className="grid grid-cols-2 mb-6">
                                <TabsTrigger value="content">Content</TabsTrigger>
                                <TabsTrigger value="examples">Examples</TabsTrigger>
                            </TabsList>

                            <TabsContent value="content" className="space-y-8">
                                <section id="introduction" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">Administrator Guide Introduction</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Welcome to the SlateChain Administrator Guide. This comprehensive resource is designed for system administrators responsible for configuring, maintaining, and optimizing the SlateChain platform for their organization.
                                    </p>
                                    <p className="text-muted-foreground mb-4">
                                        As an administrator, you have access to powerful tools and settings that control how SlateChain functions across your organization. This guide will help you understand these capabilities and implement best practices for system administration.
                                    </p>
                                    <div className="bg-muted p-4 rounded-lg">
                                        <h3 className="font-medium mb-2">Administrator Responsibilities</h3>
                                        <ul className="list-disc p-4 list-inside space-y-1 text-sm text-muted-foreground">
                                            <li>User account management and access control</li>
                                            <li>System configuration and customization</li>
                                            <li>Security policy implementation</li>
                                            <li>Data management and integrity</li>
                                            <li>Integration with external systems</li>
                                            <li>Performance monitoring and optimization</li>
                                            <li>Backup and disaster recovery</li>
                                        </ul>
                                    </div>
                                </section>

                                <section id="user-management" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">User Management</h2>
                                    <p className="text-muted-foreground mb-4">
                                        User management is a critical responsibility for SlateChain administrators. This section covers how to add, modify, and manage user accounts, as well as how to configure roles and permissions.
                                    </p>

                                    <div className="relative w-full h-64 rounded-lg overflow-hidden mb-6">
                                        <Image
                                            src="/placeholder.svg?height=400&width=800"
                                            alt="User Management Interface"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    <h3 id="adding-users" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">Adding Users</h3>
                                    <p className="text-muted-foreground mb-4">
                                        To add a new user to the system:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4">
                                        <li>Navigate to the Users section in the Admin panel</li>
                                        <li>Click the "Add User" button</li>
                                        <li>Fill in the required information (name, email, etc.)</li>
                                        <li>Assign appropriate roles and permissions</li>
                                        <li>Set initial password or enable "User must change password at next login"</li>
                                        <li>Click "Create User" to finalize</li>
                                    </ol>

                                    <h3 id="roles-permissions" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">Roles & Permissions</h3>
                                    <p className="text-muted-foreground mb-4">
                                        SlateChain uses a role-based access control system to manage permissions:
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center">
                                                    <Users className="h-4 w-4 mr-2" />
                                                    Default Roles
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                    <li><span className="font-medium">Administrator:</span> Full system access</li>
                                                    <li><span className="font-medium">Manager:</span> Department-level access</li>
                                                    <li><span className="font-medium">Supplier:</span> Limited access to supplier portal</li>
                                                    <li><span className="font-medium">Customer:</span> Access to customer-facing features</li>
                                                    <li><span className="font-medium">Viewer:</span> Read-only access to specified areas</li>
                                                </ul>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-base flex items-center">
                                                    <Lock className="h-4 w-4 mr-2" />
                                                    Permission Categories
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="text-sm">
                                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                                    <li><span className="font-medium">View:</span> Read-only access</li>
                                                    <li><span className="font-medium">Create:</span> Ability to add new items</li>
                                                    <li><span className="font-medium">Edit:</span> Ability to modify existing items</li>
                                                    <li><span className="font-medium">Delete:</span> Ability to remove items</li>
                                                    <li><span className="font-medium">Approve:</span> Ability to authorize actions</li>
                                                </ul>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <p className="text-muted-foreground mb-4">
                                        To create a custom role:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                        <li>Go to Admin &gt; Roles & Permissions</li>
                                        <li>Click "Create New Role"</li>
                                        <li>Name the role and provide a description</li>
                                        <li>Select the permissions to assign to this role</li>
                                        <li>sign to this role</li>
                                        <li>Save the role configuration</li>
                                    </ol>

                                    <h3 id="user-groups" className="text-xl font-medium mt-6 mb-3 scroll-mt-16">User Groups</h3>
                                    <p className="text-muted-foreground mb-4">
                                        User groups allow you to organize users and apply permissions to multiple users simultaneously:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                        <li>Create groups based on departments, locations, or functions</li>
                                        <li>Assign users to one or multiple groups</li>
                                        <li>Apply permissions at the group level</li>
                                        <li>Use groups for filtering and reporting</li>
                                    </ul>
                                </section>

                                <section id="system-configuration" className="scroll-mt-16">
                                    <h2 className="text-2xl font-bold mb-4">System Configuration</h2>
                                    <p className="text-muted-foreground mb-4">
                                        System configuration allows you to customize SlateChain to meet your organization's specific needs.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex items-start space-x-4">
                                                    <Settings className="h-8 w-8 text-primary mt-1" />
                                                    <div>
                                                        <h3 className="font-medium mb-2">General Settings</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Configure company information, regional settings, language preferences, and default system behaviors.
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardContent className="p-6">
                                                <div className="flex items-start space-x-4">
                                                    <Database className="h-8 w-8 text-primary mt-1" />
                                                    <div>
                                                        <h3 className="font-medium mb-2">Data Configuration</h3>
                                                        <p className="text-sm text-muted-foreground">
                                                            Set up custom fields, data validation rules, and configure how data is stored and processed.
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <p className="text-muted-foreground">
                                        Key configuration areas include:
                                    </p>
                                    <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
                                        <li><span className="font-medium">Workflow Configuration:</span> Define approval processes and automated workflows</li>
                                        <li><span className="font-medium">Notification Settings:</span> Configure email, in-app, and mobile notifications</li>
                                        <li><span className="font-medium">UI Customization:</span> Customize the user interface with company branding</li>
                                        <li><span className="font-medium">Module Configuration:</span> Enable or disable specific system modules</li>
                                        <li><span className="font-medium">API Settings:</span> Configure API access and rate limits</li>
                                    </ul>
                                </section>

                                <div className="flex justify-between mt-8 pt-4 border-t">
                                    <Button variant="outline" disabled>
                                        Previous
                                    </Button>
                                    <Button asChild>
                                        <Link href="#security">
                                            Next <ChevronRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="examples" className="space-y-6">
                                <h2 className="text-2xl font-bold mb-4">Administrator Examples</h2>
                                <p className="text-muted-foreground mb-6">
                                    These examples demonstrate common administrative tasks in SlateChain.
                                </p>

                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Example 1: Setting Up a New Department</CardTitle>
                                            <CardDescription>How to configure SlateChain for a new department in your organization</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                                <li>Create a new user group for the department (Admin {`>`} User Groups {`>`} Add Group)</li>
                                                <li>Configure appropriate permissions for the group</li>
                                                <li>Create user accounts for department members</li>
                                                <li>Assign users to the department group</li>
                                                <li>Set up department-specific workflows and approval chains</li>
                                                <li>Configure data visibility rules for the department</li>
                                                <li>Create custom dashboards for department KPIs</li>
                                            </ol>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Example 2: Security Audit Preparation</CardTitle>
                                            <CardDescription>Steps to prepare SlateChain for a security audit</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                                <li>Review and update security policies</li>
                                                <li>Generate comprehensive user access reports</li>
                                                <li>Review audit logs for suspicious activities</li>
                                                <li>Verify password policies are enforced</li>
                                                <li>Check two-factor authentication implementation</li>
                                                <li>Review API access and integration security</li>
                                                <li>Verify data encryption settings</li>
                                                <li>Test backup and recovery procedures</li>
                                            </ol>
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Example 3: System Performance Optimization</CardTitle>
                                            <CardDescription>How to improve SlateChain performance</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                                                <li>Review performance monitoring dashboards</li>
                                                <li>Identify performance bottlenecks</li>
                                                <li>Optimize database queries and indexes</li>
                                                <li>Configure caching settings</li>
                                                <li>Adjust resource allocation</li>
                                                <li>Implement data archiving for historical records</li>
                                                <li>Schedule resource-intensive tasks during off-peak hours</li>
                                                <li>Consider scaling options if necessary</li>
                                            </ol>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div >
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

