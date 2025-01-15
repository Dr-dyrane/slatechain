// src/components/supplier/AddSupplierModal.tsx
"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {  addSupplier } from "@/lib/slices/supplierSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { Supplier } from "@/lib/types";
import { toast } from "sonner";


const addSupplierSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contactPerson: z.string().min(1, "Contact Person is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number should be at least 7 characters long"),
    address: z.string().min(1, "Address is required"),
    rating: z.number({invalid_type_error: "Rating must be a number"}).min(0, "Rating must be a positive number").max(5, 'Rating must be between 0 and 5'),
    status: z.string().optional()
});

type AddSupplierFormValues = z.infer<typeof addSupplierSchema>;

interface AddSupplierModalProps {
    open: boolean;
    onClose: () => void;
}
export function AddSupplierModal({ open, onClose }: AddSupplierModalProps) {
  const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.supplier);

  const {
        register,
        handleSubmit,
      reset,
        formState: { errors, isValid },
   } = useForm<AddSupplierFormValues>({
      resolver: zodResolver(addSupplierSchema),
        defaultValues: {
          status: "ACTIVE"
         }
    });

  const onSubmit = async (data: AddSupplierFormValues) => {
        try {
            await dispatch(addSupplier(data as Omit<Supplier, 'id'>)).unwrap();
              toast.success('New supplier added successfully');
               onClose();
             reset()
        } catch (error: any) {
           toast.error('There was an error adding supplier');
         }
    };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
        <AlertDialogContent>
           <AlertDialogHeader>
                <AlertDialogTitle>Add New Supplier</AlertDialogTitle>
                  <AlertDialogDescription>Please provide the required details of the new supplier</AlertDialogDescription>
          </AlertDialogHeader>
         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                  <Input
                      id="name"
                      placeholder='Name'
                     {...register("name")}
                      className="input-focus input-hover"
                   />
                   {errors.name && (
                     <p className="text-sm text-red-500">{errors.name.message}</p>
                   )}
           </div>
            <div className="space-y-2">
                 <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                       id="contactPerson"
                     placeholder='Contact Person'
                      {...register("contactPerson")}
                      className="input-focus input-hover"
                   />
                      {errors.contactPerson && (
                         <p className="text-sm text-red-500">{errors.contactPerson.message}</p>
                        )}
           </div>
            <div className="space-y-2">
               <Label htmlFor="email">Email</Label>
                   <Input
                        id="email"
                     type="email"
                       placeholder='Email'
                      {...register("email")}
                         className="input-focus input-hover"
                     />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                     )}
             </div>
            <div className="space-y-2">
               <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                     id="phoneNumber"
                      placeholder='Phone Number'
                      {...register("phoneNumber")}
                     className="input-focus input-hover"
                    />
                     {errors.phoneNumber && (
                       <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                     )}
              </div>
             <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                   placeholder='Address'
                     {...register("address")}
                      className="input-focus input-hover"
                     />
                     {errors.address && (
                      <p className="text-sm text-red-500">{errors.address.message}</p>
                        )}
             </div>
              <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                   <Input
                       id="rating"
                       type='number'
                      placeholder='Rating'
                      {...register("rating", {valueAsNumber: true})}
                       className="input-focus input-hover"
                       />
                        {errors.rating && (
                            <p className="text-sm text-red-500">{errors.rating.message}</p>
                            )}
                   </div>
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                         <select
                           id="status"
                            className="input-focus input-hover"
                             {...register("status")}
                           >
                               <option value="ACTIVE">ACTIVE</option>
                              <option value="INACTIVE">INACTIVE</option>
                        </select>
                   </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <Button type="submit" disabled={loading || !isValid}>
                             {loading ? "Adding..." : "Add Supplier"}
                        </Button>
                 </AlertDialogFooter>
           </form>
        </AlertDialogContent>
    </AlertDialog>
  )
}