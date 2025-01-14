// src/components/user/UserColumns.tsx

import { ColumnDef } from "@tanstack/react-table";

export const Columns: ColumnDef<any>[] = [
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
    },
]