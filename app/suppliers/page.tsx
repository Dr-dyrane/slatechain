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
import type { ChatMessage, Supplier, SupplierDocument } from "@/lib/types"
import { SupplierList } from "@/components/supplier/SupplierList"
import { CommunicationCenter } from "@/components/supplier/CommunicationCenter"
import { DocumentManagement } from "@/components/supplier/DocumentManagement"
import { AddSupplierModal } from "@/components/supplier/AddSupplierModal"
import { EditSupplierModal } from "@/components/supplier/EditSupplierModal"
import { toast } from "sonner"
import { SupplierKPIs } from "@/components/supplier/SupplierKPIs"
import { DeleteModal } from "@/components/supplier/DeleteSupplierModal"

export default function SuppliersPage() {
  const [activeTab, setActiveTab] = useState("list")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const suppliers = useSelector((state: RootState) => state.supplier.items) as Supplier[]
  const documents = useSelector((state: RootState) => state.supplier.documents)
  const chatMessages = useSelector((state: RootState) => state.supplier.chatMessages)

  const groupedMessages = suppliers.reduce<Record<string, ChatMessage[]>>((acc, supplier) => {
    acc[supplier.id] = chatMessages.filter((msg) => msg.supplierId === supplier.id);
    return acc;
  }, {});
  
  const groupedDocuments = suppliers.reduce<Record<string, SupplierDocument[]>>((acc, supplier) => {
    acc[supplier.id] = documents.filter((doc) => doc.supplierId === supplier.id);
    return acc;
  }, {});


  useEffect(() => {
    dispatch(fetchSuppliers())
  }, [dispatch])

  useEffect(() => {
    suppliers.forEach((supplier) => {
      dispatch(fetchSupplierDocuments(supplier.id))
      dispatch(fetchChatMessages(supplier.id))
    })
  }, [dispatch, suppliers])

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

  const handleSendMessage = async (supplierId: string, message: string) => {
    try {
      await dispatch(
        sendChatMessage({
          supplierId,
          senderId: "current-user-id", // Replace with actual user ID
          senderName: "Current User", // Replace with actual user name
          message,
        }),
      ).unwrap()
    } catch (error) {
      toast.error("Failed to send message")
    }
  }

  const handleUploadDocument = async (supplierId: string, file: File) => {
    try {
      await dispatch(
        addSupplierDocument({
          supplierId,
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

  const handleDeleteDocument = async (supplierId: string, documentId: string) => {
    try {
      await dispatch(deleteSupplierDocument({ supplierId, documentId })).unwrap()
      toast.success("Document deleted successfully")
    } catch (error) {
      toast.error("Failed to delete document")
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl sm:text-3xl font-bold">Supplier Collaboration</h1>
      <SupplierKPIs suppliers={suppliers} />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-8 flex flex-wrap justify-start">
          <TabsTrigger value="list" className="flex-grow sm:flex-grow-0">
            Supplier List
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex-grow sm:flex-grow-0">
            Communication
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-grow sm:flex-grow-0">
            Documents
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <SupplierList
            suppliers={suppliers}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
            onSelectSupplier={setSelectedSupplier}
          />
        </TabsContent>
        <TabsContent value="communication">
          <CommunicationCenter suppliers={suppliers} messages={groupedMessages} onSendMessage={handleSendMessage} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentManagement
            suppliers={suppliers}
            documents={groupedDocuments}
            onUploadDocument={handleUploadDocument}
            onDeleteDocument={handleDeleteDocument}
          />
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

