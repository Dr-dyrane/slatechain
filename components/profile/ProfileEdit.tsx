import { User } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { updateUser } from "@/lib/slices/authSlice";
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Mail, Phone, ArrowRight } from "lucide-react";
import * as Tooltip from '@radix-ui/react-tooltip';
import { Label } from "@/components/ui/label";

const profileFormSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().min(7, "Phone number is invalid"),
    address: z
        .object({
            address1: z.string().min(1, "Address line 1 is required"),
            address2: z.string().optional(),
            city: z.string().min(1, "City is required"),
            state: z.string().optional(),
            country: z.string().min(1, "Country is required"),
            postalCode: z.string().optional(),
            phone: z.string().optional(),
        })
        .optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileEditProps {
    user: User;
    refetch: () => void;
}

export default function ProfileEdit({ user, refetch }: ProfileEditProps) {
    const dispatch = useDispatch<AppDispatch>();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            email: user?.email || "",
            phoneNumber: user?.phoneNumber || "",
            address: user?.address || {
                address1: "",
                address2: "",
                city: "",
                country: "",
                state: "",
                postalCode: "",
                phone: "",
            }
        },
    });

    const onSubmit = async (data: ProfileFormValues) => {
        try {
            await dispatch(updateUser(data)).unwrap();
            toast.success('Profile updated successfully', {
                duration: 5000
            });
            refetch();
        } catch (error: any) {
            toast.error('Failed to update profile, please try again later', {
                duration: 5000
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="firstName" className='flex items-center gap-1'>
                                        <UserIcon className="h-4 w-4 text-muted-foreground" /> First Name
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your first name
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input {...register("firstName")} placeholder="First Name" className='input-focus input-hover' />
                        {errors.firstName && (
                            <p className="text-sm text-red-500">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="lastName" className='flex items-center gap-1'>
                                        <UserIcon className="h-4 w-4 text-muted-foreground" /> Last Name
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your last name
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input  {...register("lastName")} placeholder="Last Name" className='input-focus input-hover' />
                        {errors.lastName && (
                            <p className="text-sm text-red-500">{errors.lastName.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="email" className='flex items-center gap-1'>
                                        <Mail className="h-4 w-4 text-muted-foreground" /> Email
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your email address
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input {...register("email")} placeholder="Email" className='input-focus input-hover' />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Tooltip.Provider>
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Label htmlFor="phoneNumber" className='flex items-center gap-1'>
                                        <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                                    </Label>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content className="z-50 rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md" side="top" align="center" >
                                        Enter your phone number
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </Tooltip.Provider>
                        <Input {...register("phoneNumber")} placeholder="Phone Number" className='input-focus input-hover' />
                        {errors.phoneNumber && (
                            <p className="text-sm text-red-500">{errors.phoneNumber.message}</p>
                        )}
                    </div>

                    {/* Address Section */}
                    <div className="border p-4 rounded-md mt-6">
                        <h3 className="text-lg font-medium mb-4">Shipping Address</h3>

                        <div className="space-y-2">
                            <Label htmlFor="address.address1">Address Line 1</Label>
                            <Input
                                {...register("address.address1")}
                                placeholder="Street address, P.O. box, company name"
                                className="input-focus input-hover"
                            />
                            {errors.address?.address1 && <p className="text-sm text-red-500">{errors.address.address1.message}</p>}
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="address.address2">Address Line 2 (Optional)</Label>
                            <Input
                                {...register("address.address2")}
                                placeholder="Apartment, suite, unit, building, floor, etc."
                                className="input-focus input-hover"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="address.city">City</Label>
                                <Input {...register("address.city")} placeholder="City" className="input-focus input-hover" />
                                {errors.address?.city && <p className="text-sm text-red-500">{errors.address.city.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address.state">State/Province (Optional)</Label>
                                <Input
                                    {...register("address.state")}
                                    placeholder="State/Province"
                                    className="input-focus input-hover"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                            <div className="space-y-2">
                                <Label htmlFor="address.country">Country</Label>
                                <Input {...register("address.country")} placeholder="Country" className="input-focus input-hover" />
                                {errors.address?.country && <p className="text-sm text-red-500">{errors.address.country.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address.postalCode">Postal/ZIP Code (Optional)</Label>
                                <Input
                                    {...register("address.postalCode")}
                                    placeholder="Postal/ZIP Code"
                                    className="input-focus input-hover"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 mt-2">
                            <Label htmlFor="address.phone">Alternative Phone (Optional)</Label>
                            <Input
                                {...register("address.phone")}
                                placeholder="Alternative Phone Number"
                                className="input-focus input-hover"
                            />
                        </div>
                    </div>
                    <Button type="submit" className="w-full mt-4 flex items-center justify-center gap-2">Update Profile <ArrowRight size={16} /></Button>
                </form>
            </CardContent>
        </Card>
    );
}