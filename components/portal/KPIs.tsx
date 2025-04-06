import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supplier } from "@/lib/types"
import { FileText, Clock, TrendingUp } from "lucide-react"
import { useSelector } from "react-redux"
import type { RootState } from "@/lib/store"
import { isAfter, isBefore, addDays } from "date-fns"

interface KPIsProps {
    supplier: Supplier
}

export function KPIs({ supplier }: KPIsProps) {
    // Get contracts from Redux store
    const contracts = useSelector((state: RootState) => state.contracts.contracts)

    // Filter contracts for this supplier
    const supplierContracts = contracts.filter((contract) => contract.supplierId === supplier.id)

    // Calculate active contracts
    const activeContracts = supplierContracts.filter((contract) => contract.status === "active").length

    // Calculate completed contracts
    const completedContracts = supplierContracts.filter((contract) => contract.status === "completed").length

    // Find contracts expiring soon (within 30 days)
    const today = new Date()
    const expiringContracts = supplierContracts.filter((contract) => {
        const endDate = new Date(contract.endDate)
        const thirtyDaysFromNow = addDays(today, 30)
        return contract.status === "active" && isAfter(endDate, today) && isBefore(endDate, thirtyDaysFromNow)
    }).length

    return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeContracts}</div>
                    <p className="text-xs text-muted-foreground">
                        {activeContracts === 0
                            ? "No active contracts"
                            : activeContracts === 1
                                ? "1 contract in progress"
                                : `${activeContracts} contracts in progress`}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{expiringContracts}</div>
                    <p className="text-xs text-muted-foreground">
                        {expiringContracts === 0
                            ? "No contracts expiring soon"
                            : expiringContracts === 1
                                ? "1 contract expiring in 30 days"
                                : `${expiringContracts} contracts expiring in 30 days`}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Performance Rating</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{supplier.rating}/5</div>
                    <p className="text-xs text-muted-foreground">
                        {supplier.rating >= 4 ? "Excellent" : supplier.rating >= 3 ? "Good" : "Needs improvement"}
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}

