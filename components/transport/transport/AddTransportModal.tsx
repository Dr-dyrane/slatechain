// src/components/transport/transport/AddTransportModal.tsx
"use client"

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { AppDispatch, RootState } from "@/lib/store"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "sonner"
import { addTransport, fetchCarriers } from "@/lib/slices/shipmentSlice"
import type { Carrier, Transport } from "@/lib/types"
import { X, MapPin, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Country, State, City } from "country-state-city"

// Define a Zod schema for transport validation
const transportSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    type: z.enum(["TRUCK", "TRAIN", "PLANE", "SHIP", "OTHER"], {
        required_error: "Transport type is required",
    }),
    capacity: z
        .number({
            required_error: "Capacity is required",
            invalid_type_error: "Capacity must be a number",
        })
        .min(0, "Capacity must be a positive number"),
    currentLocation: z.object({
        latitude: z.number({
            required_error: "Latitude is required",
            invalid_type_error: "Latitude must be a number",
        }),
        longitude: z.number({
            required_error: "Longitude is required",
            invalid_type_error: "Longitude must be a number",
        }),
    }),
    status: z.enum(["AVAILABLE", "IN_TRANSIT", "MAINTENANCE"], { required_error: "Status is required" }),
    carrierId: z.string().min(1, "Carrier is required"),
})

type TransportFormValues = z.infer<typeof transportSchema>

interface AddTransportModalProps {
    open: boolean
    onClose: () => void
}

export function AddTransportModal({ open, onClose }: AddTransportModalProps) {
    const dispatch = useDispatch<AppDispatch>()
    const { loading, carriers } = useSelector((state: RootState) => state.shipment)
    const [backendError, setBackendError] = useState<string | null>(null)
    const [adding, setAdding] = useState(false)
    const { location, loading: locationLoading, error: locationError, getLocation } = useGeolocation()
    // Address selection state
    const [street, setStreet] = useState("")
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [selectedState, setSelectedState] = useState<string | null>(null)
    const [selectedCity, setSelectedCity] = useState<string | null>(null)
    const [geocodingLoading, setGeocodingLoading] = useState(false)
    const [addressError, setAddressError] = useState<string | null>(null)
    // Get all countries
    const countries = Country.getAllCountries()
    // Get states for selected country
    const states = selectedCountry ? State.getStatesOfCountry(selectedCountry) : []
    // Get cities for selected state and country
    const cities = selectedCountry && selectedState ? City.getCitiesOfState(selectedCountry, selectedState) : []

    const geocodeAddress = async () => {
        if (!selectedCountry || !selectedState || !selectedCity) {
            setAddressError("Please select a country, state, and city")
            toast.error("Please select a country, state, and city to generate coordinates")
            return
        }

        // Find the country name from the selected country code
        const countryData = countries.find((country) => country.isoCode === selectedCountry)
        if (!countryData) {
            toast.error("Invalid country selection")
            setAddressError("Invalid country selection")
            return
        }

        // Build address components
        const addressComponents = []

        if (street) addressComponents.push(street)

        if (selectedCity) {
            const cityData = cities.find((city) => city.name === selectedCity)
            if (cityData) addressComponents.push(cityData.name)
        }

        if (selectedState) {
            const stateData = states.find((state) => state.isoCode === selectedState)
            if (stateData) addressComponents.push(stateData.name)
        }

        addressComponents.push(countryData.name)

        const addressString = addressComponents.join(", ")

        if (addressComponents.length < 2) {
            toast.error("Please provide more address details")
            return
        }

        setGeocodingLoading(true)
        try {
            const query = encodeURIComponent(addressString)
            console.log("Geocoding query:", addressString)

            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=${selectedCountry}&limit=1`,
            )

            if (!response.ok) {
                throw new Error("Failed to geocode address")
            }

            const data = await response.json()
            console.log("Geocoding response:", data)

            if (data && data.length > 0) {
                const { lat, lon } = data[0];

                setValue("currentLocation.latitude", parseFloat(Number(lat).toFixed(5)), { shouldValidate: true });
                setValue("currentLocation.longitude", parseFloat(Number(lon).toFixed(5)), { shouldValidate: true });

                toast.success("Coordinates generated successfully")
            } else {
                toast.error("Could not find coordinates for this address. Try adding more details.")
            }
        } catch (error) {
            console.error("Geocoding error:", error)
            toast.error("Error generating coordinates: " + (error instanceof Error ? error.message : "Unknown error"))
        } finally {
            setGeocodingLoading(false)
            setAddressError(null)
        }
    }

    // Fetch carriers when the modal opens
    useEffect(() => {
        if (open) {
            if (carriers.length === 0) {
                dispatch(fetchCarriers())
            }
            // Get current location when modal opens
            getLocation()
        }
    }, [open, dispatch, carriers.length, getLocation])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<TransportFormValues>({
        resolver: zodResolver(transportSchema),
        defaultValues: {
            name: "",
            type: "TRUCK",
            capacity: 0,
            currentLocation: {
                latitude: 0,
                longitude: 0,
            },
            status: "AVAILABLE",
            carrierId: "",
        },
    })

    // Update form with current location when available
    useEffect(() => {
        if (location) {
            setValue("currentLocation.latitude", location.latitude, { shouldValidate: true })
            setValue("currentLocation.longitude", location.longitude, { shouldValidate: true })
        }
    }, [location, setValue])

    const onSubmit = async (data: TransportFormValues) => {
        setBackendError(null)
        setAdding(true)
        try {
            await dispatch(addTransport(data as Omit<Transport, "id">)).unwrap()
            toast.success("Transport added successfully!")
            reset()
            onClose()
        } catch (error: any) {
            if (typeof error === "string") {
                setBackendError(error)
            } else {
                toast.error(error?.message || "Failed to add transport. Please try again.")
            }
        } finally {
            setAdding(false)
        }
    }

    const handleClose = () => {
        setBackendError(null)
        reset()
        onClose()
    }

    // Handle carrier selection
    const handleCarrierChange = (value: string) => {
        setValue("carrierId", value, { shouldValidate: true })
    }

    // Handle type selection
    const handleTypeChange = (value: string) => {
        setValue("type", value as Transport["type"], { shouldValidate: true })
    }

    // Handle status selection
    const handleStatusChange = (value: string) => {
        setValue("status", value as Transport["status"], { shouldValidate: true })
    }

    // Handle refresh location
    const handleRefreshLocation = () => {
        getLocation()
    }

    return (
        <AlertDialog open={open} onOpenChange={handleClose}>
            <AlertDialogContent className="w-full max-w-md rounded-2xl sm:max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
                <AlertDialogHeader>
                    <div className="flex justify-center items-center relative">
                        <AlertDialogTitle>Add New Transport</AlertDialogTitle>
                        <button
                            onClick={handleClose}
                            className="text-gray-500 hover:text-gray-700 absolute -top-4 sm:-top-1 -right-4 p-2 bg-muted rounded-full"
                        >
                            <X className="w-5 h-5 " />
                        </button>
                    </div>
                    <AlertDialogDescription>Fill in the details for the new transport.</AlertDialogDescription>
                </AlertDialogHeader>

                {backendError && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{backendError}</AlertDescription>
                    </Alert>
                )}

                {locationError && (
                    <Alert variant="default" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Could not get your location: {locationError}. Please enter coordinates manually.
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Transport Name</Label>
                        <Input id="name" placeholder="Transport Name" {...register("name")} />
                        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="type">Transport Type</Label>
                        <Select onValueChange={handleTypeChange} defaultValue="TRUCK">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="TRUCK">Truck</SelectItem>
                                <SelectItem value="TRAIN">Train</SelectItem>
                                <SelectItem value="PLANE">Plane</SelectItem>
                                <SelectItem value="SHIP">Ship</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("type")} />
                        {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="capacity">Capacity</Label>
                        <Input
                            id="capacity"
                            type="number"
                            placeholder="Capacity"
                            {...register("capacity", { valueAsNumber: true })}
                        />
                        {errors.capacity && <p className="text-sm text-red-500">{errors.capacity.message}</p>}
                    </div>

                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select onValueChange={handleStatusChange} defaultValue="AVAILABLE">
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AVAILABLE">Available</SelectItem>
                                <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("status")} />
                        {errors.status && <p className="text-sm text-red-500">{errors.status.message}</p>}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Current Location</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRefreshLocation}
                                disabled={locationLoading}
                            >
                                {locationLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : (
                                    <MapPin className="h-4 w-4 mr-1" />
                                )}
                                {locationLoading ? "Getting Location..." : "Get Current Location"}
                            </Button>
                        </div>
                        <div className="grid gap-2 my-4">
                            <div className="flex justify-between items-center mb-2">
                                <Label>Or select address (for coordinate generation)</Label>
                            </div>
                            {
                                addressError && (
                                    <Alert variant="destructive" className="">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {addressError}
                                        </AlertDescription>
                                    </Alert>
                                )
                            }
                            <div className="grid gap-2">
                                <div>
                                    <Label htmlFor="country">Country</Label>
                                    <Select
                                        onValueChange={(value) => {
                                            setSelectedCountry(value)
                                            setSelectedState(null)
                                            setSelectedCity(null)
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a country" />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px] overflow-y-auto">
                                            {countries.map((country) => (
                                                <SelectItem key={country.isoCode} value={country.isoCode}>
                                                    {country.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedCountry && states.length > 0 && (
                                    <div>
                                        <Label htmlFor="state">State/Province</Label>
                                        <Select
                                            onValueChange={(value) => {
                                                setSelectedState(value)
                                                setSelectedCity(null)
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a state" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                                {states.map((state) => (
                                                    <SelectItem key={state.isoCode} value={state.isoCode}>
                                                        {state.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {selectedState && cities.length > 0 && (
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Select onValueChange={setSelectedCity}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a city" />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[200px] overflow-y-auto">
                                                {cities.map((city) => (
                                                    <SelectItem key={city.name} value={city.name}>
                                                        {city.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div>
                                    <Label htmlFor="street">Street Address</Label>
                                    <Input
                                        id="street"
                                        placeholder="Street address"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={geocodeAddress}
                                    disabled={geocodingLoading}
                                    className="mt-1"
                                >
                                    {geocodingLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                        <MapPin className="h-4 w-4 mr-1" />
                                    )}
                                    Generate Coordinates from Address
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="0.000001"
                                    placeholder="Latitude"
                                    {...register("currentLocation.latitude", { valueAsNumber: true })}
                                />
                                {errors.currentLocation?.latitude && (
                                    <p className="text-sm text-red-500">{errors.currentLocation.latitude.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="0.000001"
                                    placeholder="Longitude"
                                    {...register("currentLocation.longitude", { valueAsNumber: true })}
                                />
                                {errors.currentLocation?.longitude && (
                                    <p className="text-sm text-red-500">{errors.currentLocation.longitude.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="carrierId">Carrier</Label>
                        <Select onValueChange={handleCarrierChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a carrier" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Loading carriers...
                                    </SelectItem>
                                ) : carriers.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                        No carriers available
                                    </SelectItem>
                                ) : (
                                    carriers.map((carrier: Carrier) => (
                                        <SelectItem key={carrier.id} value={carrier.id}>
                                            {carrier.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <input type="hidden" {...register("carrierId")} />
                        {errors.carrierId && <p className="text-sm text-red-500">{errors.carrierId.message}</p>}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setBackendError(null)}>Cancel</AlertDialogCancel>
                        <Button type="submit" disabled={loading || adding}>
                            {loading || adding ? "Adding..." : "Add Transport"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}

