// src/app/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { PlusIcon } from 'lucide-react'
import { RootState, AppDispatch } from "@/lib/store";
import {  UserRole, User } from "@/lib/types";
import {  fetchUsers} from "@/lib/slices/user/user";

import  UsersPageSkeleton from "./loading";
import { UserModal } from "@/components/user/UserModal";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { Columns } from "@/components/user/UserColumns";
import 'aos/dist/aos.css'
import AOS from 'aos'
import { ErrorState } from "@/components/ui/error";
import { useToast } from "@/hooks/use-toast";


export default function UsersPage() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.auth.user);
     const { items, loading, error } = useSelector((state: RootState) => state.user);
    const [addUserOpen, setAddUserOpen] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const { toast } = useToast();
    useEffect(() => {
        AOS.init({
            once: true,
        });
    }, [])
    useEffect(() => {
        if(user?.role !== UserRole.ADMIN) {
            router.push('/dashboard')
        }
         dispatch(fetchUsers());
     }, [dispatch, router, user]);

    const table = useReactTable({
        data: items || [],
        columns: Columns,
        getCoreRowModel: getCoreRowModel(),
        initialState: {
            pagination: {
                pageIndex,
                pageSize,
            },
        },
        onStateChange: (updater) => {
            if (typeof updater === 'function') {
                const updated = updater(table.getState());
                if (updated.pagination) {
                    setPageIndex(updated.pagination.pageIndex);
                    setPageSize(updated.pagination.pageSize);
                }
            }
        }
    });

    const formattedUsers = table.getRowModel().rows.map(row => ({
        ...row.original,
         id: row.original.id?.toString() || '',
        }));

    const handleAddUserOpen = () => {
       setAddUserOpen(true)
    }
      const handleAddUserClose = () => {
          setAddUserOpen(false)
      };

    if(loading) {
        return <UsersPageSkeleton />
     }

    if(error) {
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
                message="You do not have permission to see this page" onCancel={() => router.push("/dashboard")} onRetry={() => router.refresh()}/>
           </div>
        )
    }

    return (
        <div className="space-y-4"  data-aos="fade-in" data-aos-duration="500" >
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">User Management</h1>
                <Button onClick={handleAddUserOpen}>
                    <PlusIcon className="mr-2 h-4 w-4" /> Add User
                </Button>
            </div>
            <DataTable columns={Columns} data={formattedUsers} />
            <UserModal open={addUserOpen} onClose={handleAddUserClose}/>
        </div>
    );
}