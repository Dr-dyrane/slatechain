// UsersPage.tsx

"use client"

import { useEffect, useState, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { PlusIcon } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import type { User } from "@/lib/types"

import { EditUserModal } from "@/components/user/EditUserModal"
import { DeleteUserModal } from "@/components/user/DeleteUserModal"
import { UserModal } from "@/components/user/UserModal"
import { Columns } from "@/components/user/UserColumns"
import { ErrorState } from "@/components/ui/error"
import DashboardCard from "@/components/dashboard/DashboardCard"
import UsersPageSkeleton from "./loading"

// Import KYC related thunks and types
import {
  listPendingKYCSubmissionsThunk,
  verifyKYCSubmissionThunk,
  clearSubmissions,
  clearError,
  setLoading,
} from "@/lib/slices/kycSlice"
import type { KYCDocument } from "@/lib/types"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" // Assuming you have this

// New Components (Create these)
import PendingKYCSubmissionsTable from "@/components/admin/PendingKYCSubmissionsTable" // Display pending submissions
import ViewKYCSubmissionModal from "@/components/admin/ViewKYCSubmissionModal" // View individual documents
import VerifyKYCModal from "@/components/admin/VerifyKYCModal" // Modal for approving/rejecting KYC
import { IKYCDocument } from "../api/models/KYCDocument"
import { IKYCSubmission } from "../api/models/KYCSubmission"
import { fetchUsers } from "@/lib/slices/user/user"
import LoadingTable from "@/components/admin/LoadingTable"

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const { items: users, loading, error } = useSelector((state: RootState) => state.user)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // KYC State Selectors
  const { submissions, loading: kycLoading, error: kycError, documents } = useSelector(
    (state: RootState) => state.kyc
  )

  //KYC MODALS
  const [selectedSubmission, setSelectedSubmission] = useState<IKYCSubmission | null>(null) // Use `any` or create a specific type if submissions are strongly typed
  const [viewSubmissionModalOpen, setViewSubmissionModalOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null)
  const [verifyKYCModalOpen, setVerifyKYCModalOpen] = useState(false)

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
    setDeleteUserOpen(true)
  }

  const handleDeleteUserClose = () => {
    setDeleteUserOpen(false)
    setSelectedUser(null)
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    // Use optional chaining and nullish coalescing operator for safety
    const totalUsers = users?.length ?? 0;
    const activeUsers = users?.filter((user) => user.onboardingStatus === "COMPLETED").length ?? 0;
    const pendingKYC = users?.filter((user) => user.kycStatus === "PENDING_REVIEW").length ?? 0;

    // Safe handling for userRoles calculation as well
    const userRoles = users?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) ?? {}; // Default value of empty object

    return {
      totalUsers,
      activeUsers,
      pendingKYC,
      userRoles,
    };
  }, [users]);

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

  // --- KYC Functions ---

  // Load Pending Submissions on tab change
  const handleTabChange = (value: string) => {
    if (value === "kyc") {
      dispatch(listPendingKYCSubmissionsThunk())
    } else {
      dispatch(clearSubmissions()) //Clear previous submissions on tab change
    }
  }

  // Handlers for modals

  const handleViewSubmission = async (submission: IKYCSubmission) => {
    setSelectedSubmission(submission)
    setViewSubmissionModalOpen(true)
  }

  const handleCloseViewSubmissionModal = () => {
    setViewSubmissionModalOpen(false)
    setSelectedSubmission(null)
  }


  const handleOpenVerifyModal = (submission: IKYCSubmission) => {
    // Replace `any` with your submission type
    setSelectedSubmission(submission)
    setVerifyKYCModalOpen(true)
  }

  const handleCloseVerifyModal = () => {
    setVerifyKYCModalOpen(false)
    setSelectedSubmission(null)
  }

  // Function to handle KYC verification
  const handleVerifyKYC = async (
    submissionId: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ) => {
    try {
      dispatch(setLoading(true));
      await dispatch(
        verifyKYCSubmissionThunk({ submissionId, status, rejectionReason })
      )
        .unwrap()
      // After successful verification, refresh the pending submissions
      dispatch(listPendingKYCSubmissionsThunk())
      handleCloseVerifyModal()
    } catch (error) {
      // Handle error (e.g., display an error message)
      console.error("KYC verification failed:", error)
    } finally {
      dispatch(setLoading(false))
      handleCloseVerifyModal()
    }
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

      <Tabs defaultValue="users" onValueChange={handleTabChange}>
        <TabsList className="w-full mb-8 flex flex-wrap justify-start">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="kyc">Pending KYC</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <DataTable columns={Columns} data={users} onEdit={handleEditUserOpen} onDelete={handleDeleteUserOpen} />
        </TabsContent>
        <TabsContent value="kyc">
          {kycLoading ? (
            <LoadingTable />
          ) : kycError ? (
            <ErrorState
              title="KYC Error"
              description="Failed to load pending KYC submissions."
              message={kycError}
              onRetry={() => dispatch(listPendingKYCSubmissionsThunk())}
              onCancel={() => {
                dispatch(clearSubmissions())
                dispatch(clearError())
              }}
            />
          ) : submissions && submissions.length > 0 ? (
            <PendingKYCSubmissionsTable
              submissions={submissions as any}
              onViewDocument={handleViewSubmission}
              onVerify={handleOpenVerifyModal}
              isLoading={kycLoading}
            />
          ) : (
            <div className="flex justify-center items-center">No pending KYC submissions.</div>
          )}
        </TabsContent>
      </Tabs>

      <UserModal open={addModalOpen} onClose={handleAddUserClose} />
      <EditUserModal open={editModalOpen} onClose={handleEditUserClose} user={selectedUser} />
      <DeleteUserModal open={deleteModalOpen} onClose={handleDeleteUserClose} user={selectedUser} />

      {/* KYC Modals */}
      <ViewKYCSubmissionModal
        open={viewSubmissionModalOpen}
        onClose={handleCloseViewSubmissionModal}
        submission={selectedSubmission}
        documents={selectedSubmission?.documents || null} //Reflected here too
      />
      <VerifyKYCModal
        open={verifyKYCModalOpen}
        onClose={handleCloseVerifyModal}
        submission={selectedSubmission}
        onVerify={handleVerifyKYC}
        documents={selectedSubmission?.documents || null} //Reflected here too
      />
    </div>
  )
}

