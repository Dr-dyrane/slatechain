"use client"

import { useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import type { InvoiceData } from "@/components/invoice/InvoicesTab"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Download, Printer, FileText, Building, Package, Hash, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

interface InvoiceModalProps {
    open: boolean
    onClose: () => void
    invoiceData: InvoiceData
}

export function InvoiceModal({ open, onClose, invoiceData }: InvoiceModalProps) {
    const invoiceRef = useRef<HTMLDivElement>(null)
    const [activeTab, setActiveTab] = useState<string>("preview")

    const downloadPdf = async () => {
        if (invoiceRef.current) {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
            })

            const imgData = canvas.toDataURL("image/png")
            const pdf = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
            })

            const imgWidth = 210
            const imgHeight = (canvas.height * imgWidth) / canvas.width

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
            pdf.save(`invoice-${invoiceData.invoiceNumber}.pdf`)
        }
    }

    const printInvoice = () => {
        const printWindow = window.open("", "_blank")
        if (printWindow && invoiceRef.current) {
            printWindow.document.write("<html><head><title>Print Invoice</title>")
            printWindow.document.write(
                "<style>body { font-family: system-ui, sans-serif; color: #000; background: #fff; }</style>",
            )
            printWindow.document.write("</head><body>")
            printWindow.document.write(invoiceRef.current.innerHTML)
            printWindow.document.write("</body></html>")
            printWindow.document.close()
            printWindow.print()
        }
    }

    // Calculate totals
    const calculateSubtotal = () => {
        return invoiceData.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    }

    const calculateTax = () => {
        return calculateSubtotal() * (invoiceData.taxRate / 100)
    }

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax()
    }

    const statusVariants = {
        PENDING: "bg-warning text-warning-foreground",
        PAID: "bg-success text-success-foreground",
        OVERDUE: "bg-destructive text-destructive-foreground",
    }

    return (
        <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Invoice {invoiceData.invoiceNumber}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="preview" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6">
                        <TabsList className="grid w-full max-w-md grid-cols-1">
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="preview" className="mt-0">
                        <div className="flex justify-end space-x-2 px-6 py-2">
                            <Button variant="outline" size="sm" onClick={downloadPdf}>
                                <Download className="h-4 w-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button variant="outline" size="sm" onClick={printInvoice}>
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </div>

                        <ScrollArea className="h-[calc(90vh-10rem)]">
                            <div className="p-6">
                                <Card className="overflow-hidden">
                                    <CardContent className="p-0">
                                        <div ref={invoiceRef} className="p-8 bg-background text-foreground">
                                            <div className="mb-8">
                                                {/* First row: Logo and Company Details */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                                                    <div className="flex items-start gap-4">
                                                        {invoiceData.companyLogo && (
                                                            <Avatar className="h-16 w-16 rounded-md">
                                                                <img
                                                                    src={invoiceData.companyLogo || "/placeholder.svg"}
                                                                    alt="Company Logo"
                                                                    className="h-full w-full object-contain"
                                                                />
                                                            </Avatar>
                                                        )}
                                                        <div>
                                                            <div className="text-2xl font-bold">SlateChain Supply</div>
                                                            <div className="text-muted-foreground text-sm mt-1">
                                                                <Building className="h-3 w-3 inline mr-1" />
                                                                Supply Chain Management
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {invoiceData.companyName && <p className="font-bold">{invoiceData.companyName}</p>}
                                                        {invoiceData.companyDetails && (
                                                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                                                                {invoiceData.companyDetails}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Separator line */}
                                                <div className="w-full h-px bg-border my-6"></div>

                                                {/* Second row: Invoice and Dates */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                                    <div>
                                                        <h1 className="text-2xl font-bold mb-1">INVOICE</h1>
                                                        <p className="text-muted-foreground">#{invoiceData.invoiceNumber}</p>
                                                        <p className="text-muted-foreground mt-2">Order: {invoiceData.orderNumber}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p>Date: {formatDate(invoiceData.date)}</p>
                                                        <p>Due Date: {formatDate(invoiceData.dueDate)}</p>
                                                        <p className="mt-2">
                                                            Status:
                                                            <span
                                                                className={cn(
                                                                    "ml-2 px-2 py-1 rounded-lg text-xs font-semibold",
                                                                    statusVariants[invoiceData.status],
                                                                )}
                                                            >
                                                                {invoiceData.status}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-8">
                                                <div className="border rounded-lg p-4 bg-muted/20">
                                                    <h2 className="text-lg font-semibold mb-2">From:</h2>
                                                    <div className="text-muted-foreground">
                                                        <p className="font-semibold text-foreground">{invoiceData.fromName}</p>
                                                        <p>{invoiceData.fromEmail}</p>
                                                        <p className="whitespace-pre-line">{invoiceData.fromAddress}</p>
                                                    </div>
                                                </div>
                                                <div className="border rounded-lg p-4 bg-muted/20">
                                                    <h2 className="text-lg font-semibold mb-2">To:</h2>
                                                    <div className="text-muted-foreground">
                                                        <p className="font-semibold text-foreground">{invoiceData.toName}</p>
                                                        <p>{invoiceData.toEmail}</p>
                                                        <p className="whitespace-pre-line">{invoiceData.toAddress}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Table for medium and larger screens */}
                                            <div className="hidden md:block overflow-x-auto mb-8 border rounded-lg">
                                                <table className="w-full border-collapse">
                                                    <thead className="bg-muted/50">
                                                        <tr>
                                                            <th className="py-3 px-4 text-left">Description</th>
                                                            <th className="py-3 px-4 text-right">Quantity</th>
                                                            <th className="py-3 px-4 text-right">Price</th>
                                                            <th className="py-3 px-4 text-right">Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {invoiceData.items.map((item) => (
                                                            <tr key={item.id} className="border-t border-border">
                                                                <td className="py-3 px-4">{item.description}</td>
                                                                <td className="py-3 px-4 text-right">{item.quantity}</td>
                                                                <td className="py-3 px-4 text-right">{formatCurrency(item.price, item.currency)}</td>
                                                                <td className="py-3 px-4 text-right">
                                                                    {formatCurrency(item.quantity * item.price, item.currency)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Cards for small screens */}
                                            <div className="md:hidden space-y-4 mb-8">
                                                <h3 className="font-semibold text-lg mb-2">Items</h3>
                                                {invoiceData.items.map((item) => (
                                                    <Card key={item.id} className="overflow-hidden">
                                                        <CardContent className="p-4">
                                                            <div className="font-medium mb-2">{item.description}</div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <Hash className="h-3.5 w-3.5" />
                                                                    <span>Quantity:</span>
                                                                </div>
                                                                <div className="text-right">{item.quantity}</div>

                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <DollarSign className="h-3.5 w-3.5" />
                                                                    <span>Price:</span>
                                                                </div>
                                                                <div className="text-right">{formatCurrency(item.price, item.currency)}</div>

                                                                <div className="flex items-center gap-1 text-muted-foreground">
                                                                    <Package className="h-3.5 w-3.5" />
                                                                    <span>Amount:</span>
                                                                </div>
                                                                <div className="text-right font-medium">
                                                                    {formatCurrency(item.quantity * item.price, item.currency)}
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>

                                            <div className="flex justify-end mb-8">
                                                <div className="w-full sm:w-64 border rounded-lg p-4 bg-muted/20">
                                                    <div className="flex justify-between py-2">
                                                        <span>Subtotal:</span>
                                                        <span>{formatCurrency(calculateSubtotal(), invoiceData.currency)}</span>
                                                    </div>

                                                    <div className="flex justify-between py-2 border-b border-border">
                                                        <span>Tax ({invoiceData.taxRate}%):</span>
                                                        <span>{formatCurrency(calculateTax(), invoiceData.currency)}</span>
                                                    </div>

                                                    <div className="flex justify-between py-2 font-bold text-lg">
                                                        <span>Total:</span>
                                                        <span>{formatCurrency(calculateTotal(), invoiceData.currency)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {invoiceData.notes && (
                                                <div className="mb-8 border rounded-lg p-4 bg-muted/20">
                                                    <h2 className="text-lg font-semibold mb-2">Notes:</h2>
                                                    <p className="text-muted-foreground whitespace-pre-line">{invoiceData.notes}</p>
                                                </div>
                                            )}

                                            <div className="text-center text-muted-foreground text-sm mt-16 border-t border-border pt-4">
                                                <p className="whitespace-pre-line">{invoiceData.footer}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}

