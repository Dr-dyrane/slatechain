"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Supplier } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Search, EyeOff, Eye } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { prepareSupplierData } from "@/lib/utils"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchUsers } from "@/lib/slices/user/user"

const addSupplierSchema = z.object({
  // User fields
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(7, "Phone number should be at least 7 characters long"),

  // Supplier-specific fields
  address: z.string().min(1, "Address is required"),
  rating: z.number().min(0).max(5),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

const existingUserSchema = z.object({
  userId: z.string().min(1, "User is required"),
  address: z.string().min(1, "Address is required"),
  rating: z.number().min(0).max(5),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

type AddSupplierFormValues = z.infer<typeof addSupplierSchema>
type ExistingUserFormValues = z.infer<typeof existingUserSchema>

interface AddSupplierModalProps {
  open: boolean
  onClose: () => void
  onAdd: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => void
}

export function AddSupplierModal({ open, onClose, onAdd }: AddSupplierModalProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("new")
  const dispatch = useDispatch<AppDispatch>()
  const users = useSelector((state: RootState) => state.user.items)
  const [searchTerm, setSearchTerm] = useState("")

  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Filter users to only show non-suppliers
  const filteredUsers = users.filter(
    (user) =>
      user.role !== "supplier" &&
      (searchTerm === "" ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  // Fetch users when the modal opens
  useEffect(() => {
    if (open && activeTab === "existing") {
      dispatch(fetchUsers())
    }
  }, [open, activeTab, dispatch])

  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    reset: resetNew,
    formState: { errors: errorsNew },
  } = useForm<AddSupplierFormValues>({
    resolver: zodResolver(addSupplierSchema),
    defaultValues: {
      rating: 3,
      status: "ACTIVE",
    },
  })

  const {
    register: registerExisting,
    handleSubmit: handleSubmitExisting,
    reset: resetExisting,
    formState: { errors: errorsExisting },
    setValue,
  } = useForm<ExistingUserFormValues>({
    resolver: zodResolver(existingUserSchema),
    defaultValues: {
      rating: 3,
      status: "ACTIVE",
    },
  })

  const onSubmitNew = async (data: AddSupplierFormValues) => {
    setLoading(true)
    try {
      const supplierData = prepareSupplierData(data)
      await onAdd(supplierData)
      resetNew()
      onClose()
    } catch (error) {
      console.error("Error adding supplier:", error)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitExisting = async (data: ExistingUserFormValues) => {
    setLoading(true)
    try {
      // Find the selected user
      const selectedUser = users.find((user) => user.id === data.userId)
      if (!selectedUser) {
        throw new Error("Selected user not found")
      }

      // Prepare data for API
      const supplierData = prepareSupplierData({
        ...selectedUser,
        ...data,
        // No need to set password for existing user
        password: undefined,
      })

      await onAdd(supplierData)
      resetExisting()
      onClose()
    } catch (error) {
      console.error("Error converting user to supplier:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelect = (userId: string) => {
    setValue("userId", userId)

    // Find the selected user to pre-fill form fields if needed
    const selectedUser = users.find((user) => user.id === userId)
    if (selectedUser && selectedUser.phoneNumber) {
      // You could pre-fill other fields here if needed
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Add New Supplier</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <AlertDialogDescription>Enter the details for the new supplier.</AlertDialogDescription>
        </AlertDialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="new" className="flex-1">
              Create New User
            </TabsTrigger>
            <TabsTrigger value="existing" className="flex-1">
              Use Existing User
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            <form onSubmit={handleSubmitNew(onSubmitNew)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...registerNew("firstName")} className="input-focus input-hover" />
                  {errorsNew.firstName && <p className="text-sm text-red-500">{errorsNew.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...registerNew("lastName")} className="input-focus input-hover" />
                  {errorsNew.lastName && <p className="text-sm text-red-500">{errorsNew.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...registerNew("email")} className="input-focus input-hover" />
                {errorsNew.email && <p className="text-sm text-red-500">{errorsNew.email.message}</p>}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type={showPassword ? 'text' : 'password'} {...registerNew("password")} className="input-focus input-hover" />
                <Button
                  variant="ghost"
                  type="button"
                  onClick={handlePasswordVisibility}
                  size="icon"
                  className="absolute right-2 top-[60%] -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} className='text-muted-foreground' /> : <Eye size={16} className='text-muted-foreground' />}
                </Button>
                {errorsNew.password && <p className="text-sm text-red-500">{errorsNew.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" {...registerNew("phoneNumber")} className="input-focus input-hover" />
                {errorsNew.phoneNumber && <p className="text-sm text-red-500">{errorsNew.phoneNumber.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...registerNew("address")} className="input-focus input-hover" />
                {errorsNew.address && <p className="text-sm text-red-500">{errorsNew.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...registerNew("rating", { valueAsNumber: true })}
                    className="input-focus input-hover"
                  />
                  {errorsNew.rating && <p className="text-sm text-red-500">{errorsNew.rating.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" {...registerNew("status")} className="w-full p-2 border rounded">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {errorsNew.status && <p className="text-sm text-red-500">{errorsNew.status.message}</p>}
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={loading}>
                  {loading ? "Adding..." : "Add Supplier"}
                </Button>
              </AlertDialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="existing">
            <form onSubmit={handleSubmitExisting(onSubmitExisting)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userSearch">Search Users</Label>
                <div className="relative">
                  <Input
                    id="userSearch"
                    placeholder="Search by name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-focus input-hover pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Select User</Label>
                <Select onValueChange={handleUserSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" {...registerExisting("userId")} />
                {errorsExisting.userId && <p className="text-sm text-red-500">{errorsExisting.userId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...registerExisting("address")} className="input-focus input-hover" />
                {errorsExisting.address && <p className="text-sm text-red-500">{errorsExisting.address.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    {...registerExisting("rating", { valueAsNumber: true })}
                    className="input-focus input-hover"
                  />
                  {errorsExisting.rating && <p className="text-sm text-red-500">{errorsExisting.rating.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" {...registerExisting("status")} className="w-full p-2 border rounded">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  {errorsExisting.status && <p className="text-sm text-red-500">{errorsExisting.status.message}</p>}
                </div>
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button type="submit" disabled={loading}>
                  {loading ? "Converting..." : "Convert to Supplier"}
                </Button>
              </AlertDialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </AlertDialogContent>
    </AlertDialog>
  )
}

