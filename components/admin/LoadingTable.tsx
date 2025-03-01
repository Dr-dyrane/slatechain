import { Skeleton } from "@/components/ui/skeleton";

const LoadingTable: React.FC = () => {
    return (
        <div className="w-full">
            {/* Mobile List View */}
            <div className="block md:hidden space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-muted p-4 rounded-lg shadow-sm border">
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-28 mb-2" />
                        <div className="flex justify-end space-x-2 mt-2">
                            <Skeleton className="h-8 w-16 rounded-lg" />
                            <Skeleton className="h-8 w-16 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table View for Medium Screens and Above */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full border border-muted rounded-lg">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                                User ID
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                                Full Name
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase hidden lg:table-cell">
                                Status
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                                Submitted At
                            </th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, index) => (
                            <tr key={index} className="border-b">
                                <td className="px-4 py-2">
                                    <Skeleton className="h-6 w-24 rounded-lg" />
                                </td>
                                <td className="px-4 py-2">
                                    <Skeleton className="h-6 w-32 rounded-lg" />
                                </td>
                                <td className="px-4 py-2 hidden lg:table-cell">
                                    <Skeleton className="h-6 w-20 rounded-lg" />
                                </td>
                                <td className="px-4 py-2">
                                    <Skeleton className="h-6 w-28 rounded-lg" />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <Skeleton className="h-6 w-16 rounded-lg" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LoadingTable;
