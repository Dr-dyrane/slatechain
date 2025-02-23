"use client"

import { useEffect, useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import type { User } from "@/lib/types"
import { fetchUsers } from "@/lib/slices/user/user"
import { EditUserModal } from "@/components/user/EditUserModal"
import { DeleteUserModal } from "@/components/user/DeleteUserModal"
import { UserModal } from "@/components/user/UserModal"
import { Columns } from "@/components/user/UserColumns"
import { ErrorState } from "@/components/ui/error"
import DashboardCard from "@/components/dashboard/DashboardCard"
import UsersPageSkeleton from "./loading"

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

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalUsers = users.length
    const activeUsers = users.filter((user) => user.onboardingStatus === "COMPLETED").length
    const pendingKYC = users.filter((user) => user.kycStatus === "PENDING_REVIEW").length
    const userRoles = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalUsers,
      activeUsers,
      pendingKYC,
      userRoles,
    }
  }, [users])

  if (loading) {
    return <UsersPageSkeleton />
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <ErrorState
          title="User Error"
          description="We encountered an issue while loading user data."
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
        <h1 className="text-2xl sm:text-3xl font-bold">User Management</h1>
        <Button onClick={handleAddUserOpen}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          card={{
            title: "Total Users",
            value: kpis.totalUsers.toString(),
            type: "number",
            icon: "Users",
            description: "Total number of users",
            sparklineData: [kpis.totalUsers],
          }}
        />
        <DashboardCard
          card={{
            title: "Active Users",
            value: kpis.activeUsers.toString(),
            type: "number",
            icon: "UserCheck",
            description: "Users with completed onboarding",
            sparklineData: [kpis.activeUsers],
          }}
        />
        <DashboardCard
          card={{
            title: "Pending KYC",
            value: kpis.pendingKYC.toString(),
            type: "number",
            icon: "UserCog",
            description: "Users awaiting KYC review",
            sparklineData: [kpis.pendingKYC],
          }}
        />
        <DashboardCard
          card={{
            title: "",
            type: "donut",
            icon: "PieChart",
            // description: "Distribution of user roles",
            donutData: Object.values(kpis.userRoles),
            // donutLabels: Object.keys(kpis.userRoles),
            colors: ["#4ade80", "#f97316", "#38bdf8", "#a78bfa"],
          }}
        />
      </div>

      <DataTable columns={Columns} data={users} onEdit={handleEditUserOpen} onDelete={handleDeleteUserOpen} />
      <UserModal open={addModalOpen} onClose={handleAddUserClose} />
      <EditUserModal open={editModalOpen} onClose={handleEditUserClose} user={selectedUser} />
      <DeleteUserModal open={deleteModalOpen} onClose={handleDeleteUserClose} user={selectedUser} />
    </div>
  )
}

