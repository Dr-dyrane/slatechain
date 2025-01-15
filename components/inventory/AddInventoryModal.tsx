// src/components/inventory/AddInventoryModal.tsx
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
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {  addInventoryItem } from "@/lib/slices/inventorySlice";
import { AppDispatch, RootState } from "@/lib/store";
import { useDispatch, useSelector } from "react-redux";
import { InventoryItem } from "@/lib/types";
import { toast } from "sonner";

const addInventorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().min(1, "SKU is required"),
	quantity: z.number({invalid_type_error: "Quantity must be a number"}).min(0, "Quantity must be a positive number"),
	location: z.string().optional(),
    price:  z.number({invalid_type_error: "Price must be a number"}).min(0, "Price must be a positive number"),
	category: z.string().min(1, "Category is required"),
});

type AddInventoryFormValues = z.infer<typeof addInventorySchema>;


interface AddInventoryModalProps {
    open: boolean;
    onClose: () => void;
}
export function AddInventoryModal({ open, onClose }: AddInventoryModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { loading } = useSelector((state: RootState) => state.inventory);

   const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm<AddInventoryFormValues>({
        resolver: zodResolver(addInventorySchema),
    });


    const onSubmit = async (data: AddInventoryFormValues) => {
         try {
               await dispatch(addInventoryItem(data as Omit<InventoryItem, "id">)).unwrap()
               toast.success('New inventory item created successfully');
              onClose()
               reset()
          } catch (error: any) {
            toast.error('There was an error creating inventory item, please try again later')
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Add New Inventory Item</AlertDialogTitle>
                      <AlertDialogDescription>Please provide details of inventory to be created.</AlertDialogDescription>
                 </AlertDialogHeader>
               <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                 <div className="space-y-2">
                       <Label htmlFor="name">Name</Label>
                       <Input
                           id="name"
                            placeholder="Name"
                            {...register("name")}
                           className="input-focus input-hover"
                        />
                         {errors.name && (
                           <p className="text-sm text-red-500">{errors.name.message}</p>
                           )}
                </div>
                <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                          <Input
                             id="sku"
                             placeholder='SKU'
                           {...register("sku")}
                           className="input-focus input-hover"
                           />
                            {errors.sku && (
                              <p className="text-sm text-red-500">{errors.sku.message}</p>
                             )}
                        </div>
                   <div className="space-y-2">
                       <Label htmlFor="quantity">Quantity</Label>
                           <Input
                                id="quantity"
                               type='number'
                                placeholder='Quantity'
                            {...register("quantity", {valueAsNumber: true})}
                            className="input-focus input-hover"
                         />
                          {errors.quantity && (
                            <p className="text-sm text-red-500">{errors.quantity.message}</p>
                             )}
                   </div>
                   <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                     <Input
                        id="location"
                        placeholder="Location"
                           {...register("location")}
                            className="input-focus input-hover"
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                         <Input
                              id="price"
                              type="number"
                            placeholder="Price"
                           {...register("price", {valueAsNumber: true})}
                            className="input-focus input-hover"
                        />
                            {errors.price && (
                              <p className="text-sm text-red-500">{errors.price.message}</p>
                            )}
                       </div>
                        <div className="space-y-2">
                           <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                               placeholder='Category'
                                {...register("category")}
                                 className="input-focus input-hover"
                            />
                              {errors.category && (
                                   <p className="text-sm text-red-500">{errors.category.message}</p>
                             )}
                       </div>
                       <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || !isValid}>
                             {loading ? "Adding..." : "Add Item"}
                       </Button>
                    </AlertDialogFooter>
               </form>
            </AlertDialogContent>
        </AlertDialog>
    );
};