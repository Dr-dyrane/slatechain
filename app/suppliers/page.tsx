"use client"

import { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { RootState, AppDispatch } from "@/lib/store"
import {
  fetchSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  fetchSupplierDocuments,
  addSupplierDocument,
  deleteSupplierDocument,
  fetchChatMessages,
  sendChatMessage,
} from "@/lib/slices/supplierSlice"
import type { Supplier } from "@/lib/types"
import { SupplierList } from "@/components/supplier/SupplierList"
import { CommunicationCenter } from "@/components/supplier/CommunicationCenter"
import { DocumentManagement } from "@/components/supplier/DocumentManagement"
import { AddSupplierModal } from "@/components/supplier/AddSupplierModal"
import { EditSupplierModal } from "@/components/supplier/EditSupplierModal"
import { toast } from "sonner"
import { DeleteModal } from "@/components/supplier/DeleteSupplierModal"

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const suppliers = useSelector((state: RootState) => state.supplier.items)
  const documents = useSelector((state: RootState) => state.supplier.documents)
  const chatMessages = useSelector((state: RootState) => state.supplier.chatMessages)

  useEffect(() => {
    dispatch(fetchSuppliers())
  }, [dispatch])

  const handleAddSupplier = () => {
    setAddModalOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setEditModalOpen(true)
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedSupplier) {
      try {
        await dispatch(deleteSupplier(selectedSupplier.id)).unwrap()
        toast.success("Supplier deleted successfully")
        setDeleteModalOpen(false)
        setSelectedSupplier(null)
      } catch (error) {
        toast.error("Failed to delete supplier")
      }
    }
  }

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    dispatch(fetchSupplierDocuments(supplier.id))
    dispatch(fetchChatMessages(supplier.id))
  }

  const handleSendMessage = async (message: string) => {
    if (selectedSupplier) {
      try {
        await dispatch(
          sendChatMessage({
            supplierId: selectedSupplier.id,
            senderId: "current-user-id", // Replace with actual user ID
            senderName: "Current User", // Replace with actual user name
            message,
          }),
        ).unwrap()
      } catch (error) {
        toast.error("Failed to send message")
      }
    }
  }

  const handleUploadDocument = async (file: File) => {
    if (selectedSupplier) {
      try {
        await dispatch(
          addSupplierDocument({
            supplierId: selectedSupplier.id,
            name: file.name,
            type: file.type,
            url: "placeholder-url", // Replace with actual file upload logic
          }),
        ).unwrap()
        toast.success("Document uploaded successfully")
      } catch (error) {
        toast.error("Failed to upload document")
      }
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (selectedSupplier) {
      try {
        await dispatch(deleteSupplierDocument({ supplierId: selectedSupplier.id, documentId })).unwrap()
        toast.success("Document deleted successfully")
      } catch (error) {
        toast.error("Failed to delete document")
      }
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Supplier Collaboration</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Supplier List</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <SupplierList
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onSelectSupplier={handleSupplierSelect}
          />
        </TabsContent>
        <TabsContent value="communication">
          {selectedSupplier ? (
            <CommunicationCenter
              supplier={selectedSupplier}
              messages={chatMessages}
              onSendMessage={handleSendMessage}
            />
          ) : (
            <div className="text-center py-8">Please select a supplier to view communication history.</div>
          )}
        </TabsContent>
        <TabsContent value="documents">
          {selectedSupplier ? (
            <DocumentManagement
              documents={documents}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          ) : (
            <div className="text-center py-8">Please select a supplier to manage documents.</div>
          )}
        </TabsContent>
      </Tabs>
      <AddSupplierModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={async (newSupplier) => {
          try {
            await dispatch(addSupplier(newSupplier)).unwrap()
            toast.success("Supplier added successfully")
            setAddModalOpen(false)
          } catch (error) {
            toast.error("Failed to add supplier")
          }
        }}
      />
      <EditSupplierModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={async (updatedSupplier) => {
          try {
            await dispatch(updateSupplier(updatedSupplier)).unwrap()
            toast.success("Supplier updated successfully")
            setEditModalOpen(false)
          } catch (error) {
            toast.error("Failed to update supplier")
          }
        }}
        supplier={selectedSupplier}
      />
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        data={selectedSupplier}
        deleteModalTitle="Delete Supplier"
      />
    </div>
  )
}

