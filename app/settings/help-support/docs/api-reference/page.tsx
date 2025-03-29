// app/settings/help-support/docs/api-reference/page.tsx

"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Code, Search, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function ApiReferencePage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/settings/help-support">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">API Reference</h1>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search API endpoints..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Code className="h-5 w-5" />
              <span>API Contents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-1">
                <TableOfContentsItem href="#introduction" label="Introduction" />
                <TableOfContentsItem href="#authentication" label="Authentication" />
                <TableOfContentsItem href="#rate-limits" label="Rate Limits" />
                <TableOfContentsItem href="#errors" label="Error Handling" />
                <TableOfContentsItem href="#endpoints" label="API Endpoints" isExpanded>
                  <TableOfContentsItem href="#users" label="Users" level={2} />
                  <TableOfContentsItem href="#suppliers" label="Suppliers" level={2} />
                  <TableOfContentsItem href="#inventory" label="Inventory" level={2} />
                  <TableOfContentsItem href="#orders" label="Orders" level={2} />
                  <TableOfContentsItem href="#documents" label="Documents" level={2} />
                </TableOfContentsItem>
                <TableOfContentsItem href="#webhooks" label="Webhooks" />
                <TableOfContentsItem href="#sdks" label="Client SDKs" />
                <TableOfContentsItem href="#examples" label="Code Examples" />
                <TableOfContentsItem href="#changelog" label="API Changelog" />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardContent className="p-6">
            <Tabs defaultValue="reference" className="w-full">
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="reference">Reference</TabsTrigger>
                <TabsTrigger value="examples">Examples</TabsTrigger>
                <TabsTrigger value="changelog">Changelog</TabsTrigger>
              </TabsList>

              <TabsContent value="reference" className="space-y-8">
                <section id="introduction" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">API Introduction</h2>
                  <p className="text-muted-foreground mb-4">
                    The SlateChain API provides programmatic access to the SlateChain platform, allowing you to
                    integrate supply chain management capabilities into your own applications and systems.
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Our RESTful API uses standard HTTP methods and returns JSON responses, making it easy to integrate
                    with any programming language or framework.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Base URL</h3>
                    <code className="block bg-background p-3 rounded border text-sm font-mono">
                      https://api.slatechain.com/v1
                    </code>
                    <p className="text-sm text-muted-foreground mt-2">
                      All API requests must use HTTPS. HTTP requests will be rejected.
                    </p>
                  </div>
                </section>

                <section id="authentication" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Authentication</h2>
                  <p className="text-muted-foreground mb-4">
                    The SlateChain API uses API keys for authentication. You can generate API keys in your SlateChain
                    account settings.
                  </p>

                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">API Key Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Include your API key in the Authorization header of all requests:
                      </p>
                      <code className="block bg-background p-3 rounded border text-sm font-mono">
                        Authorization: Bearer YOUR_API_KEY
                      </code>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">OAuth 2.0 Authentication</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        For user-based authentication, we also support OAuth 2.0:
                      </p>
                      <ol className="list-decimal list-inside text-sm text-muted-foreground">
                        <li>Register your application in the SlateChain Developer Portal</li>
                        <li>Implement the OAuth 2.0 authorization flow</li>
                        <li>Use the access token in the Authorization header</li>
                      </ol>
                    </div>
                  </div>
                </section>

                <section id="rate-limits" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
                  <p className="text-muted-foreground mb-4">
                    To ensure the stability and performance of our API, we implement rate limiting based on your
                    subscription plan.
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left">Plan</th>
                          <th className="border p-2 text-left">Rate Limit</th>
                          <th className="border p-2 text-left">Burst Limit</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">Basic</td>
                          <td className="border p-2">100 requests/minute</td>
                          <td className="border p-2">150 requests/minute</td>
                        </tr>
                        <tr>
                          <td className="border p-2">Professional</td>
                          <td className="border p-2">500 requests/minute</td>
                          <td className="border p-2">750 requests/minute</td>
                        </tr>
                        <tr>
                          <td className="border p-2">Enterprise</td>
                          <td className="border p-2">2000 requests/minute</td>
                          <td className="border p-2">3000 requests/minute</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-muted-foreground mt-4">
                    Rate limit information is included in the response headers:
                  </p>
                  <code className="block bg-background p-3 rounded border text-sm font-mono mt-2">
                    X-RateLimit-Limit: 100
                    <br />
                    X-RateLimit-Remaining: 95
                    <br />
                    X-RateLimit-Reset: 1620000000
                  </code>
                </section>

                <section id="errors" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">Error Handling</h2>
                  <p className="text-muted-foreground mb-4">
                    The API uses standard HTTP status codes to indicate the success or failure of requests. In addition,
                    error responses include a JSON body with more details.
                  </p>

                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <h3 className="font-medium mb-2">Error Response Format</h3>
                    <code className="block bg-background p-3 rounded border text-sm font-mono">
                      {`{
  "code": "INVALID_INPUT",
  "message": "The request contains invalid parameters",
  "details": {
    "field": "email",
    "error": "Invalid email format"
  }
}`}
                    </code>
                  </div>

                  <h3 className="text-xl font-medium mt-6 mb-3">Common Error Codes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border p-2 text-left">Status Code</th>
                          <th className="border p-2 text-left">Error Code</th>
                          <th className="border p-2 text-left">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border p-2">400</td>
                          <td className="border p-2">INVALID_INPUT</td>
                          <td className="border p-2">The request contains invalid parameters</td>
                        </tr>
                        <tr>
                          <td className="border p-2">401</td>
                          <td className="border p-2">UNAUTHORIZED</td>
                          <td className="border p-2">Authentication is required or has failed</td>
                        </tr>
                        <tr>
                          <td className="border p-2">403</td>
                          <td className="border p-2">FORBIDDEN</td>
                          <td className="border p-2">The authenticated user doesn't have permission</td>
                        </tr>
                        <tr>
                          <td className="border p-2">404</td>
                          <td className="border p-2">NOT_FOUND</td>
                          <td className="border p-2">The requested resource was not found</td>
                        </tr>
                        <tr>
                          <td className="border p-2">429</td>
                          <td className="border p-2">RATE_LIMIT</td>
                          <td className="border p-2">Rate limit exceeded</td>
                        </tr>
                        <tr>
                          <td className="border p-2">500</td>
                          <td className="border p-2">SERVER_ERROR</td>
                          <td className="border p-2">An unexpected server error occurred</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="endpoints" className="scroll-mt-16">
                  <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
                  <p className="text-muted-foreground mb-4">
                    The SlateChain API is organized around RESTful resources. Here are the main endpoint categories:
                  </p>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="users" id="users">
                      <AccordionTrigger className="text-xl font-medium">Users</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <ApiEndpoint
                            method="GET"
                            endpoint="/users"
                            description="List all users"
                            parameters={[
                              { name: "page", type: "integer", description: "Page number for pagination" },
                              { name: "limit", type: "integer", description: "Number of results per page" },
                              { name: "role", type: "string", description: "Filter by user role" },
                            ]}
                          />

                          <ApiEndpoint method="POST" endpoint="/users" description="Create a new user" />

                          <ApiEndpoint method="GET" endpoint="/users/{id}" description="Get a specific user" />

                          <ApiEndpoint method="PUT" endpoint="/users/{id}" description="Update a user" />

                          <ApiEndpoint method="DELETE" endpoint="/users/{id}" description="Delete a user" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="suppliers" id="suppliers">
                      <AccordionTrigger className="text-xl font-medium">Suppliers</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <ApiEndpoint
                            method="GET"
                            endpoint="/suppliers"
                            description="List all suppliers"
                            parameters={[
                              { name: "page", type: "integer", description: "Page number for pagination" },
                              { name: "limit", type: "integer", description: "Number of results per page" },
                              { name: "status", type: "string", description: "Filter by supplier status" },
                            ]}
                          />

                          <ApiEndpoint method="POST" endpoint="/suppliers" description="Create a new supplier" />

                          <ApiEndpoint method="GET" endpoint="/suppliers/{id}" description="Get a specific supplier" />

                          <ApiEndpoint method="PUT" endpoint="/suppliers/{id}" description="Update a supplier" />

                          <ApiEndpoint method="DELETE" endpoint="/suppliers/{id}" description="Delete a supplier" />

                          <ApiEndpoint
                            method="GET"
                            endpoint="/suppliers/{id}/documents"
                            description="List supplier documents"
                          />

                          <ApiEndpoint
                            method="GET"
                            endpoint="/suppliers/{id}/managers"
                            description="List supplier managers"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="inventory" id="inventory">
                      <AccordionTrigger className="text-xl font-medium">Inventory</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <ApiEndpoint
                            method="GET"
                            endpoint="/inventory"
                            description="List inventory items"
                            parameters={[
                              { name: "page", type: "integer", description: "Page number for pagination" },
                              { name: "limit", type: "integer", description: "Number of results per page" },
                              { name: "category", type: "string", description: "Filter by category" },
                              { name: "lowStock", type: "boolean", description: "Filter for low stock items" },
                            ]}
                          />

                          <ApiEndpoint method="POST" endpoint="/inventory" description="Add a new inventory item" />

                          <ApiEndpoint
                            method="GET"
                            endpoint="/inventory/{id}"
                            description="Get a specific inventory item"
                          />

                          <ApiEndpoint method="PUT" endpoint="/inventory/{id}" description="Update an inventory item" />

                          <ApiEndpoint
                            method="DELETE"
                            endpoint="/inventory/{id}"
                            description="Delete an inventory item"
                          />

                          <ApiEndpoint
                            method="POST"
                            endpoint="/inventory/{id}/adjust"
                            description="Adjust inventory quantity"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="orders" id="orders">
                      <AccordionTrigger className="text-xl font-medium">Orders</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <ApiEndpoint
                            method="GET"
                            endpoint="/orders"
                            description="List orders"
                            parameters={[
                              { name: "page", type: "integer", description: "Page number for pagination" },
                              { name: "limit", type: "integer", description: "Number of results per page" },
                              { name: "status", type: "string", description: "Filter by order status" },
                              { name: "supplierId", type: "string", description: "Filter by supplier" },
                            ]}
                          />

                          <ApiEndpoint method="POST" endpoint="/orders" description="Create a new order" />

                          <ApiEndpoint method="GET" endpoint="/orders/{id}" description="Get a specific order" />

                          <ApiEndpoint method="PUT" endpoint="/orders/{id}" description="Update an order" />

                          <ApiEndpoint method="DELETE" endpoint="/orders/{id}" description="Cancel an order" />

                          <ApiEndpoint method="POST" endpoint="/orders/{id}/approve" description="Approve an order" />

                          <ApiEndpoint method="POST" endpoint="/orders/{id}/ship" description="Mark order as shipped" />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="documents" id="documents">
                      <AccordionTrigger className="text-xl font-medium">Documents</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <ApiEndpoint
                            method="GET"
                            endpoint="/documents"
                            description="List documents"
                            parameters={[
                              { name: "page", type: "integer", description: "Page number for pagination" },
                              { name: "limit", type: "integer", description: "Number of results per page" },
                              { name: "type", type: "string", description: "Filter by document type" },
                            ]}
                          />

                          <ApiEndpoint method="POST" endpoint="/documents" description="Upload a new document" />

                          <ApiEndpoint method="GET" endpoint="/documents/{id}" description="Get a specific document" />

                          <ApiEndpoint method="PUT" endpoint="/documents/{id}" description="Update document metadata" />

                          <ApiEndpoint method="DELETE" endpoint="/documents/{id}" description="Delete a document" />

                          <ApiEndpoint
                            method="GET"
                            endpoint="/documents/{id}/download"
                            description="Download a document"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </section>

                <div className="flex justify-between mt-8 pt-4 border-t">
                  <Button variant="outline" disabled>
                    Previous
                  </Button>
                  <Button asChild>
                    <Link href="#webhooks">
                      Next <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">Code Examples</h2>
                <p className="text-muted-foreground mb-6">
                  These examples demonstrate how to use the SlateChain API in different programming languages.
                </p>

                <Tabs defaultValue="javascript">
                  <TabsList className="mb-4">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="javascript">
                    <Card>
                      <CardHeader>
                        <CardTitle>JavaScript Example</CardTitle>
                        <CardDescription>Using fetch API to get suppliers</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="block bg-background p-4 rounded border text-sm font-mono whitespace-pre overflow-x-auto">
                          {`// Get all suppliers
async function getSuppliers() {
  const apiKey = 'YOUR_API_KEY';
  
  try {
    const response = await fetch('https://api.slatechain.com/v1/suppliers', {
      method: 'GET',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`API Error: \${errorData.message}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    throw error;
  }
}

// Create a new supplier
async function createSupplier(supplierData) {
  const apiKey = 'YOUR_API_KEY';
  
  try {
    const response = await fetch('https://api.slatechain.com/v1/suppliers', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(supplierData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(\`API Error: \${errorData.message}\`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating supplier:', error);
    throw error;
  }
}`}
                        </code>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="python">
                    <Card>
                      <CardHeader>
                        <CardTitle>Python Example</CardTitle>
                        <CardDescription>Using requests library to get suppliers</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="block bg-background p-4 rounded border text-sm font-mono whitespace-pre overflow-x-auto">
                          {`import requests
import json

# API configuration
API_BASE_URL = 'https://api.slatechain.com/v1'
API_KEY = 'YOUR_API_KEY'

# Get all suppliers
def get_suppliers():
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.get(f'{API_BASE_URL}/suppliers', headers=headers)
        response.raise_for_status()  # Raise exception for 4XX/5XX responses
        
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error fetching suppliers: {e}')
        if hasattr(e, 'response') and e.response:
            print(f'API Error: {e.response.text}')
        raise

# Create a new supplier
def create_supplier(supplier_data):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f'{API_BASE_URL}/suppliers',
            headers=headers,
            data=json.dumps(supplier_data)
        )
        response.raise_for_status()
        
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f'Error creating supplier: {e}')
        if hasattr(e, 'response') and e.response:
            print(f'API Error: {e.response.text}')
        raise`}
                        </code>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="curl">
                    <Card>
                      <CardHeader>
                        <CardTitle>cURL Example</CardTitle>
                        <CardDescription>Command line examples for API requests</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="block bg-background p-4 rounded border text-sm font-mono whitespace-pre overflow-x-auto">
                          {`# Get all suppliers
curl -X GET \\
  https://api.slatechain.com/v1/suppliers \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'

# Get a specific supplier
curl -X GET \\
  https://api.slatechain.com/v1/suppliers/12345 \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json'

# Create a new supplier
curl -X POST \\
  https://api.slatechain.com/v1/suppliers \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "Acme Supplies",
    "contactPerson": "John Doe",
    "email": "john@acmesupplies.com",
    "phoneNumber": "+1234567890",
    "address": "123 Main St, Anytown, USA",
    "status": "ACTIVE"
  }'

# Update a supplier
curl -X PUT \\
  https://api.slatechain.com/v1/suppliers/12345 \\
  -H 'Authorization: Bearer YOUR_API_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "name": "Acme Supplies Inc.",
    "status": "ACTIVE"
  }'

# Delete a supplier
curl -X DELETE \\
  https://api.slatechain.com/v1/suppliers/12345 \\
  -H 'Authorization: Bearer YOUR_API_KEY'`}
                        </code>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="changelog" className="space-y-6">
                <h2 className="text-2xl font-bold mb-4">API Changelog</h2>
                <p className="text-muted-foreground mb-6">Track changes to the SlateChain API over time.</p>

                <div className="space-y-6">
                  <ChangelogEntry
                    version="v1.5.0"
                    date="2023-11-15"
                    changes={[
                      "Added blockchain authentication endpoints",
                      "Added support for bulk operations on inventory items",
                      "Improved rate limiting with burst allowance",
                      "Added new filter parameters to the suppliers endpoint",
                    ]}
                  />

                  <ChangelogEntry
                    version="v1.4.0"
                    date="2023-09-01"
                    changes={[
                      "Added webhooks for real-time event notifications",
                      "Expanded document management API with new endpoints",
                      "Added support for custom fields on all resources",
                      "Improved error messages and documentation",
                    ]}
                  />

                  <ChangelogEntry
                    version="v1.3.0"
                    date="2023-06-15"
                    changes={[
                      "Added support for OAuth 2.0 authentication",
                      "Introduced new endpoints for order tracking",
                      "Added pagination support to all list endpoints",
                      "Improved performance for large data sets",
                    ]}
                  />

                  <ChangelogEntry
                    version="v1.2.0"
                    date="2023-03-10"
                    changes={[
                      "Added supplier management endpoints",
                      "Introduced inventory forecasting API",
                      "Added support for document uploads",
                      "Improved API response times",
                    ]}
                  />

                  <ChangelogEntry
                    version="v1.1.0"
                    date="2023-01-05"
                    changes={[
                      "Added user management endpoints",
                      "Introduced basic inventory management",
                      "Added simple order processing",
                      "Improved API documentation",
                    ]}
                  />

                  <ChangelogEntry
                    version="v1.0.0"
                    date="2022-11-20"
                    changes={[
                      "Initial API release",
                      "Basic authentication with API keys",
                      "Core endpoints for supply chain management",
                      "JSON response format standardized",
                    ]}
                  />
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

interface ApiEndpointProps {
  method: string
  endpoint: string
  description: string
  parameters?: { name: string; type: string; description: string }[]
}

function ApiEndpoint({ method, endpoint, description, parameters }: ApiEndpointProps) {
  const methodColors = {
    GET: "bg-blue-100 text-blue-800",
    POST: "bg-green-100 text-green-800",
    PUT: "bg-amber-100 text-amber-800",
    DELETE: "bg-red-100 text-red-800",
    PATCH: "bg-purple-100 text-purple-800",
  }

  const methodColor = methodColors[method as keyof typeof methodColors] || "bg-gray-100 text-gray-800"

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start mb-2">
        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-2 ${methodColor}`}>{method}</span>
        <code className="font-mono text-sm">{endpoint}</code>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>

      {parameters && parameters.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium mb-1">Parameters:</h4>
          <div className="text-xs text-muted-foreground">
            {parameters.map((param, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 mb-1">
                <div className="font-medium">{param.name}</div>
                <div className="italic">{param.type}</div>
                <div>{param.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ChangelogEntryProps {
  version: string
  date: string
  changes: string[]
}

function ChangelogEntry({ version, date, changes }: ChangelogEntryProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>{version}</CardTitle>
          <span className="text-sm text-muted-foreground">{date}</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          {changes.map((change, index) => (
            <li key={index}>{change}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

