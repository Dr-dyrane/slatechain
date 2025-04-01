"use client"

import { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import { DataTable } from "@/components/table/DataTable"
import { Button } from "@/components/ui/button"
import { CirclePlus, RefreshCcw } from "lucide-react"
import type { RootState, AppDispatch } from "@/lib/store"
import { fetchReturns, fetchReturnById } from "@/lib/slices/returnSlice"
import { ReturnRequest, ReturnRequestStatus, UserRole } from "@/lib/types"
import { Label } from "@/components/ui/label"
import type { ColumnDef } from "@tanstack/react-table"
import DashboardCard from "@/components/dashboard/DashboardCard"
import { AddReturnModal } from "@/components/returns/AddReturnModal"
import { ViewReturnModal } from "@/components/returns/ViewReturnModal"
import { ProcessReturnModal } from "@/components/returns/ProcessReturnModal"

export interface ReturnRow {
    id: string
    name: string
    returnRequestNumber: string
    orderNumber: string
    status: ReturnRequestStatus
    returnReason: string
    preferredReturnType: string
    requestDate: string
}

export const columns = (userRole: UserRole): ColumnDef<ReturnRow>[] => [
    {
        accessorKey: "returnRequestNumber",
        header: "Return #",
    },
    {
        accessorKey: "orderNumber",
        header: "Order #",
    },
    ...(userRole !== UserRole.CUSTOMER
        ? [
            {
                accessorKey: "name",
                header: "Customer",
            } as ColumnDef<ReturnRow>,
        ]
        : []),
    {
        accessorKey: "requestDate",
        header: "Request Date",
        cell: ({ row }) => {
            const date = new Date(row.getValue("requestDate") as string)
            return <div>{date.toLocaleDateString()}</div>
        },
    },
    {
        accessorKey: "returnReason",
        header: "Reason",
    },
    {
        accessorKey: "preferredReturnType",
        header: "Type",
        cell: ({ row }) => {
            const type = row.getValue("preferredReturnType") as string
            return <div>{type}</div>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as ReturnRequestStatus
            const statusColors: Record<ReturnRequestStatus, string> = {
                PendingApproval: "bg-yellow-500/85 text-white",
                Approved: "bg-blue-500/85 text-white",
                Rejected: "bg-red-500/85 text-white",
                ItemsReceived: "bg-indigo-500/85 text-white",
                Processing: "bg-purple-500/85 text-white",
                ResolutionPending: "bg-orange-500/85 text-white",
                Completed: "bg-green-500/85 text-white",
            }
            return <span className={`px-3 py-2 rounded-lg text-xs font-semibold ${statusColors[status]}`}>{status}</span>
        },
    },
]

export default function ReturnsTab() {
    const dispatch = useDispatch<AppDispatch>()
    const returns = useSelector((state: RootState) => state.returns?.items) as ReturnRequest[]
    const user = useSelector((state: RootState) => state.auth.user)
    const userRole = user?.role as UserRole
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [viewModalOpen, setViewModalOpen] = useState(false)
    const [processModalOpen, setProcessModalOpen] = useState(false)
    const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null)
    const [filterStatus, setFilterStatus] = useState<ReturnRequestStatus | null>(null)

    useEffect(() => {
        dispatch(fetchReturns({}))
    }, [dispatch])

    const handleAddModalOpen = () => setAddModalOpen(true)

    const handleViewReturn = (returnRequest: ReturnRequest) => {
        setSelectedReturn(returnRequest)

        // For admin/manager, open the process modal
        if (userRole === UserRole.ADMIN || userRole === UserRole.MANAGER) {
            setViewModalOpen(true)
            // setProcessModalOpen(true)
        } else {
            // For customer/supplier, open the view-only modal
            // setViewModalOpen(true)
            setProcessModalOpen(true)
        }
    }

    const handleRefresh = () => {
        dispatch(fetchReturns({}))
    }

    const filteredReturns = useMemo(() => {
        return filterStatus ? returns.filter((returnReq) => returnReq.status === filterStatus) : returns
    }, [returns, filterStatus])

    const formattedReturns: ReturnRow[] = useMemo(() => {
        return filteredReturns.map((returnReq) => {
            // Handle nested objects from API response
            const orderNumber =
                returnReq.orderId && typeof returnReq.orderId === "object"
                    ? returnReq.orderId.orderNumber
                    : returnReq.order?.orderNumber || returnReq.orderId
            const customerName =
                returnReq.customerId
                    ? returnReq.customerId.email
                    : returnReq.customerId || "unknown"

            const name: string = userRole === UserRole.CUSTOMER ? "" : customerName
            return {
                id: returnReq._id || returnReq.id,
                returnRequestNumber: returnReq.returnRequestNumber,
                orderNumber,
                customerName,
                name,
                status: returnReq.status,
                returnReason: returnReq.returnReason,
                preferredReturnType: returnReq.preferredReturnType,
                requestDate: returnReq.requestDate || returnReq.createdAt,
            }
        })
    }, [filteredReturns])

    // Calculate KPIs
    const totalReturns = formattedReturns.length
    const pendingReturns = formattedReturns.filter((r) => r.status === "PendingApproval").length
    const approvedReturns = formattedReturns.filter((r) =>
        ["Approved", "ItemsReceived", "Processing", "ResolutionPending"].includes(r.status),
    ).length
    const completedReturns = formattedReturns.filter((r) => r.status === "Completed").length

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Returns</h2>
                <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                    {userRole === UserRole.CUSTOMER && (
                        <Button onClick={handleAddModalOpen}>
                            <CirclePlus className="w-4 h-4 mr-2" />
                            Request Return
                        </Button>
                    )}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <DashboardCard
                    card={{
                        title: "Total Returns",
                        value: totalReturns.toString(),
                        type: "number",
                        icon: "RefreshCcw",
                        description: "Total number of returns",
                        sparklineData: [totalReturns],
                    }}
                />
                <DashboardCard
                    card={{
                        title: "Pending Approval",
                        value: pendingReturns.toString(),
                        type: "number",
                        icon: "Clock",
                        description: "Returns awaiting approval",
                        sparklineData: [pendingReturns],
                    }}
                />
                <DashboardCard
                    card={{
                        title: "In Process",
                        value: approvedReturns.toString(),
                        type: "number",
                        icon: "Loader",
                        description: "Returns being processed",
                        sparklineData: [approvedReturns],
                    }}
                />
                <DashboardCard
                    card={{
                        title: "Completed",
                        value: completedReturns.toString(),
                        type: "number",
                        icon: "CheckCircle",
                        description: "Completed returns",
                        sparklineData: [completedReturns],
                    }}
                />
            </div>

            <div className="flex items-center space-x-4">
                <Label>Status Filter:</Label>
                <select
                    className="input-focus input-hover"
                    onChange={(e) => setFilterStatus((e.target.value as ReturnRequestStatus) || null)}
                >
                    <option value="">All Returns</option>
                    <option value="PendingApproval">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="ItemsReceived">Items Received</option>
                    <option value="Processing">Processing</option>
                    <option value="ResolutionPending">Resolution Pending</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <DataTable
                columns={columns(userRole)}
                data={formattedReturns}
                onEdit={handleViewReturn}
            />

            <AddReturnModal
                open={addModalOpen}
                onClose={() => {
                    setAddModalOpen(false)
                    dispatch(fetchReturns({}))
                }}
            />

            <ViewReturnModal open={viewModalOpen} onClose={() => setViewModalOpen(false)} returnRequest={selectedReturn} />

            <ProcessReturnModal
                open={processModalOpen}
                onClose={() => {
                    setProcessModalOpen(false)
                    dispatch(fetchReturns({}))
                }}
                returnRequest={selectedReturn}
            />
        </div>
    )
}

