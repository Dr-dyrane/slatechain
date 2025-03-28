"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { addUser } from "@/lib/slices/user/user"
import { type User, UserRole, KYCStatus, OnboardingStatus } from "@/lib/types"
import type { AppDispatch } from "@/lib/store"
import { toast } from "sonner"
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
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff, X } from "lucide-react"


const addUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phoneNumber: z.string().min(7, "Phone number is invalid"),
  role: z.nativeEnum(UserRole),
})

type AddUserFormValues = z.infer<typeof addUserSchema>

interface UserModalProps {
  open: boolean
  onClose: () => void
}

export const UserModal = ({ open, onClose }: UserModalProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)


  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddUserFormValues>({
    resolver: zodResolver(addUserSchema),
    defaultValues: {
      role: UserRole.CUSTOMER,
    },
  })

  const onSubmit = async (data: AddUserFormValues) => {
    setLoading(true)
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim() // Ensures no extra spaces

      const newUser: Omit<User, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        name: fullName, // Add concatenated name
        isEmailVerified: false,
        isPhoneVerified: false,
        kycStatus: KYCStatus.NOT_STARTED,
        onboardingStatus: OnboardingStatus.NOT_STARTED,
        integrations: {},
      }

      await dispatch(addUser(newUser)).unwrap()
      toast.success("User has been successfully created")
      onClose()
      reset()
    } catch (error: any) {
      toast.error(error.message || "There was an error creating the user")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex justify-center items-center relative">
            <AlertDialogTitle>Add New User</AlertDialogTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
            >
              <X className="w-5 h-5 " />
            </button>
          </div>
          <AlertDialogDescription>Please provide the following information to create a user.</AlertDialogDescription>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="First Name"
              {...register("firstName")}
              className="input-focus input-hover"
            />
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Last Name"
              {...register("lastName")}
              className="input-focus input-hover"
            />
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Email"
              {...register("email")}
              className="input-focus input-hover"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2 relative">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              {...register("password")}
              className="input-focus input-hover"
            />
            <Button
              variant="ghost"
              type="button"
              onClick={handlePasswordVisibility}
              size="icon"
              className="absolute right-2 top-[60%] -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={16} className='text-muted-foreground' /> : <Eye size={16} className='text-muted-foreground' />}
            </Button>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="Phone Number"
              type="tel"
              {...register("phoneNumber")}
              className="input-focus input-hover"
            />
            {errors.phoneNumber && <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">User Role</Label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="input-focus input-hover">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(UserRole).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding User..." : "Add User"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}

