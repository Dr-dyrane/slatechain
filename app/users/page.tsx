"use client"

import { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import type { User } from "@/lib/types"
import { fetchUsers } from "@/lib/slices/user/user"
import LayoutLoader from "@/components/layout/loading"
import { EditUserModal } from "@/components/user/EditUserModal"
import { DeleteUserModal } from "@/components/user/DeleteUserModal"
import { UserModal } from "@/components/user/UserModal"
import { Columns } from "@/components/user/UserColumns"
import { ErrorState } from "@/components/ui/error"

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const { items: users, loading, error } = useSelector((state: RootState) => state.user)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    if (currentUser?.role !== "admin") {
      router.push("/dashboard")
      return
    }
    dispatch(fetchUsers())
  }, [dispatch, router, currentUser])

  const handleAddUserOpen = () => setAddModalOpen(true)
  const handleAddUserClose = () => setAddModalOpen(false)

  const handleEditUserOpen = (user: User) => {
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  const handleEditUserClose = () => {
    setEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUserOpen = (user: User) => {
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const handleDeleteUserClose = () => {
    setDeleteModalOpen(false)
    setSelectedUser(null)
  }

  if (loading) {
    return <LayoutLoader />
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          message="There was an error fetching user data"
          onRetry={() => {
            dispatch(fetchUsers())
          }}
          onCancel={() => router.push("/dashboard")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddUserOpen}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>
      <DataTable columns={Columns} data={users} onEdit={handleEditUserOpen} onDelete={handleDeleteUserOpen} />
      <UserModal open={addModalOpen} onClose={handleAddUserClose} />
      <EditUserModal open={editModalOpen} onClose={handleEditUserClose} user={selectedUser} />
      <DeleteUserModal open={deleteModalOpen} onClose={handleDeleteUserClose} user={selectedUser} />
    </div>
  )
}

