// app/portal/page.tsx

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
import { fetchSupplierContracts } from "@/lib/slices/contractSlice"
import type { Supplier, User } from "@/lib/types"
import { KPIs } from "@/components/portal/KPIs"
import { CommunicationCenter } from "@/components/portal/Communication"
import { Documents } from "@/components/portal/Documents"
import { Overview } from "@/components/portal/Overview"
import { Contracts } from "@/components/portal/Contracts"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { UserRole } from "@/lib/types"
import { toast } from "sonner"
import { fetchNotifications } from "@/lib/slices/notificationSlice"
import { useDispatch, useSelector } from "react-redux"
import { ErrorState } from "@/components/ui/error"


export default function PortalPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()

  const { user } = useSelector((state: RootState) => state.auth)
  const suppliers = useSelector((state: RootState) => state.supplier.items)
  const documents = useSelector((state: RootState) => state.supplier.documents)
  const contracts = useSelector((state: RootState) => state.contracts.contracts)
  const { chatLoading, loading, error } = useSelector((state: RootState) => state.supplier)
  const contractLoading = useSelector((state: RootState) => state.contracts.loading)
  const notifications = useSelector((state: RootState) => state.notifications?.notifications || [])

  // Find the current supplier based on the logged-in user
  const currentSupplier = suppliers.find((supplier) => supplier.email === user?.email || supplier.id === user?.id)

  // Filter documents and messages for the current supplier
  const supplierDocuments = currentSupplier ? documents.filter((doc) => doc.supplierId === currentSupplier.id) : []
  const supplierContracts = currentSupplier
    ? contracts.filter((contract) => contract.supplierId === currentSupplier.id)
    : []

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
      dispatch(fetchSupplierContracts(currentSupplier.id))
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
    } finally {
      setChatLoading(false)
    }
  }

  const handleUploadDocument = async (file: File, documentType?: string) => {
    if (!currentSupplier) return

    try {
      await dispatch(
        addSupplierDocument({
          supplierId: currentSupplier.id,
          file,
          documentType: documentType || "OTHER",
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

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          title="Portal Error"
          description="We encountered an issue while loading the supplier portal."
          message={error}
          onRetry={() => window.location.reload()}
          onCancel={() => (window.location.href = "/dashboard")}
        />
      </div>
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
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 md:mb-8">
          <TabsTrigger value="overview" >
            Overview
          </TabsTrigger>
          <TabsTrigger value="communication" >
            Communication
          </TabsTrigger>
          <TabsTrigger value="documents" className="hidden md:flex">
            Documents
          </TabsTrigger>
          <TabsTrigger value="contracts" className="hidden md:flex">
            Contracts
          </TabsTrigger>
        </TabsList>
        <TabsList className="w-full md:hidden grid grid-cols-2 gap-2 mb-8">
          <TabsTrigger value="documents" >
            Documents
          </TabsTrigger>
          <TabsTrigger value="contracts" >
            Contracts
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
          <CommunicationCenter onSendMessage={handleSendMessage} loading={chatLoading} />
        </TabsContent>
        <TabsContent value="documents">
          <Documents
            documents={supplierDocuments}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
            isLoading={loading}
            supplierId={currentSupplier?.id}
          />
        </TabsContent>
        <TabsContent value="contracts">
          <Contracts contracts={contracts} isLoading={contractLoading} supplierId={currentSupplier?.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

