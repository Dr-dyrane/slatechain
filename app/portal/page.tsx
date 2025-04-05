"use client"

import { useState, useEffect } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState, AppDispatch } from "@/lib/store"
import {
  fetchSuppliers,
  fetchSupplierDocuments,
  addSupplierDocument,
  deleteSupplierDocument,
  fetchChatMessages,
  sendChatMessage,
  updateSupplier,
  setChatLoading,
} from "@/lib/slices/supplierSlice"
import type { Supplier, User } from "@/lib/types"
import { KPIs } from "@/components/portal/KPIs"
import { CommunicationCenter } from "@/components/portal/Communication"
import { Documents } from "@/components/portal/Documents"
import { Overview } from "@/components/portal/Overview"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { UserRole } from "@/lib/types"
import { toast } from "sonner"
import { fetchNotifications } from "@/lib/slices/notificationSlice"
import { useDispatch, useSelector } from "react-redux"
import { set } from "mongoose"

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { user } = useSelector((state: RootState) => state.auth)
  const suppliers = useSelector((state: RootState) => state.supplier.items)
  const documents = useSelector((state: RootState) => state.supplier.documents)
  const { chatLoading, loading, error } = useSelector((state: RootState) => state.supplier)
  const notifications = useSelector((state: RootState) => state.notifications?.notifications || [])

  // Find the current supplier based on the logged-in user
  const currentSupplier = suppliers.find((supplier) => supplier.email === user?.email || supplier.id === user?.id)

  // Filter documents and messages for the current supplier
  const supplierDocuments = currentSupplier ? documents.filter((doc) => doc.supplierId === currentSupplier.id) : []

  const supplierNotifications =
    currentSupplier && notifications
      ? notifications.filter(
        (notification) =>
          notification.data?.supplierId === currentSupplier.id || notification.data?.userId === user?.id,
      )
      : []

  useEffect(() => {
    // Redirect if user is not a supplier
    if (user && user.role !== UserRole.SUPPLIER) {
      router.push("/dashboard")
      toast.error("This page is only accessible to suppliers")
    }
  }, [user, router])

  useEffect(() => {
    dispatch(fetchSuppliers())
    dispatch(fetchNotifications())
  }, [dispatch])

  useEffect(() => {
    if (currentSupplier) {
      dispatch(fetchSupplierDocuments(currentSupplier.id))
      dispatch(fetchChatMessages(currentSupplier.id))
    }
  }, [dispatch, currentSupplier])

  const handleSendMessage = async (supplierId: string, message: string) => {
    setChatLoading(true)
    if (!user) return
    try {
      await dispatch(
        sendChatMessage({
          supplierId,
          senderId: supplierId,
          senderName: user.name,
          message,
        }),
      ).unwrap()
      toast.success("Message sent successfully")
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    }
    finally {
      setChatLoading(false)
    }
  }

  const handleUploadDocument = async (file: File) => {
    if (!currentSupplier) return

    try {
      // In a real app, you would upload the file to a server first
      // and then get the URL back
      const documentUrl = URL.createObjectURL(file)

      await dispatch(
        addSupplierDocument({
          supplierId: currentSupplier.id,
          name: file.name,
          type: file.type || "application/octet-stream",
          url: documentUrl,
        }),
      ).unwrap()

      toast.success("Document uploaded successfully")
    } catch (error) {
      console.error("Failed to upload document:", error)
      toast.error("Failed to upload document")
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!currentSupplier) return

    try {
      await dispatch(
        deleteSupplierDocument({
          supplierId: currentSupplier.id,
          documentId,
        }),
      ).unwrap()

      toast.success("Document deleted successfully")
    } catch (error) {
      console.error("Failed to delete document:", error)
      toast.error("Failed to delete document")
    }
  }

  const handleUpdateSupplier = async (updatedSupplier: Supplier) => {
    try {
      await dispatch(updateSupplier(updatedSupplier)).unwrap()
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile")
    }
  }


  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Show message if user is not a supplier
  if (user && user.role !== UserRole.SUPPLIER) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>This page is only accessible to suppliers.</AlertDescription>
      </Alert>
    )
  }

  // Show message if supplier data not found
  if (!currentSupplier) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Supplier information not found. Please contact support.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Supplier Portal</h1>
      <KPIs supplier={currentSupplier} />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-8 flex flex-wrap justify-start">
          <TabsTrigger value="overview" className="flex-grow sm:flex-grow-0">
            Overview
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex-grow sm:flex-grow-0">
            Communication
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-grow sm:flex-grow-0">
            Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview
            supplier={currentSupplier}
            notifications={supplierNotifications}
            onUpdateSupplier={handleUpdateSupplier}
            user={user as User}
          />
        </TabsContent>
        <TabsContent value="communication">
          <CommunicationCenter
            onSendMessage={handleSendMessage}
            loading={chatLoading}
          />
        </TabsContent>

        <TabsContent value="documents">
          <Documents
            documents={supplierDocuments}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            isLoading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

