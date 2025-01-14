// src/app/users/page.tsx
"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react'
import { RootState, AppDispatch } from "@/lib/store";
import { UserRole, User } from "@/lib/types";


import LayoutLoader from "@/components/layout/loading";
import { ErrorState } from "@/components/ui/error";
import { fetchUsers } from "@/lib/slices/user/user";

export const columns = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "email",
        header: "Email",
    },
    {
        accessorKey: "phoneNumber",
        header: "Phone Number",
    },
    {
        accessorKey: "role",
        header: "Role",
    }
];

export default function UsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
    const { items, loading, error } = useSelector((state: RootState) => state.user);

    useEffect(() => {
        if (user?.role !== UserRole.ADMIN) {
            router.push('/dashboard')
        }
        dispatch(fetchUsers());
    }, [dispatch, router, user])

    const formattedUsers = items.map(user => ({
        ...user,
        id: user.id.toString()
    }));


    if (loading) {
        return <LayoutLoader />
    }

    if (error) {
        return (
            <div className="flex h-full items-center justify-center bg-none">
                <ErrorState message="There was an error fetching user data" onCancel={() => router.push("/dashboard")} onRetry={() => router.refresh()} />
            </div>
        )
    }
    if (user?.role !== UserRole.ADMIN) {
        return (
            <div className="flex h-full items-center justify-center bg-none">
                <ErrorState
                    message="You do not have permission to see this page" onCancel={() => router.push("/dashboard")} onRetry={() => router.refresh()} />
            </div>
        )
    }
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>
            <DataTable columns={columns} data={formattedUsers as any} />
        </div>
    );
}