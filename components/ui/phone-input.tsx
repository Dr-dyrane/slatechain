"use client"

import type * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn, isValidPhoneNumber } from "@/lib/utils"
import { countries, findCountryByCode, getDefaultCountry, type Country } from "@/lib/data/countries"

import type { CountryCode } from "libphonenumber-js"
import { useUserLocation } from "@/hooks/use-geolocation"


interface PhoneInputProps {
    value: string
    onChange: (value: string) => void
    onCountryChange?: (country: Country) => void
    defaultCountry?: CountryCode
    disabled?: boolean
    className?: string
    placeholder?: string
    error?: string
}

export function PhoneInput({
    value,
    onChange,
    onCountryChange,
    defaultCountry,
    disabled = false,
    className,
    placeholder = "Phone number",
    error,
}: PhoneInputProps) {
    const { country: detectedCountry, loading: locationLoading } = useUserLocation()
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [nationalNumber, setNationalNumber] = useState("")
    const [isValid, setIsValid] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)

    // Initialize with default country or detected country
    useEffect(() => {
        if (defaultCountry) {
            const country = findCountryByCode(defaultCountry)
            if (country) {
                setSelectedCountry(country)
                if (onCountryChange) onCountryChange(country)
            }
        } else if (detectedCountry && !selectedCountry) {
            const country = findCountryByCode(detectedCountry)
            if (country) {
                setSelectedCountry(country)
                if (onCountryChange) onCountryChange(country)
            }
        } else if (!selectedCountry && !locationLoading) {
            // Fallback to default country
            const defaultCountryObj = getDefaultCountry()
            setSelectedCountry(defaultCountryObj)
            if (onCountryChange) onCountryChange(defaultCountryObj)
        }
    }, [defaultCountry, detectedCountry, locationLoading, selectedCountry, onCountryChange])

    // When value changes externally
    useEffect(() => {
        if (value && selectedCountry) {
            // Try to extract the national number from the full phone number
            const fullNumber = value.startsWith("+") ? value : `+${value}`
            const dialCodeWithoutPlus = selectedCountry.dialCode.replace("+", "")

            // Check if the number starts with the dial code
            if (fullNumber.startsWith(selectedCountry.dialCode)) {
                setNationalNumber(fullNumber.substring(selectedCountry.dialCode.length))
            } else if (fullNumber.startsWith(`+${dialCodeWithoutPlus}`)) {
                setNationalNumber(fullNumber.substring(dialCodeWithoutPlus.length + 1))
            } else {
                // If it doesn't start with the dial code, just use it as is
                setNationalNumber(value)
            }
        } else {
            setNationalNumber("")
        }
    }, [value, selectedCountry])

    // When national number or country changes, update the full number
    useEffect(() => {
        if (selectedCountry) {
            // Only update if we have a country selected
            const formattedNationalNumber = nationalNumber.startsWith("0") ? nationalNumber.substring(1) : nationalNumber

            const fullNumber = nationalNumber ? `${selectedCountry.dialCode}${formattedNationalNumber}` : ""

            // Check if the number is valid
            if (nationalNumber) {
                const valid = isValidPhoneNumber(fullNumber, selectedCountry.code)
                setIsValid(valid)
            } else {
                setIsValid(true) // Empty is considered valid
            }

            // IMPORTANT: Compare with the expected full number format to prevent loops
            const expectedFullNumber = value && value.startsWith("+") ? value : value ? `+${value}` : ""

            // Only call onChange if the value is meaningfully different
            if (fullNumber && fullNumber !== expectedFullNumber && fullNumber !== value) {
                onChange(fullNumber)
            }
        }
    }, [nationalNumber, selectedCountry])

    const handleCountrySelect = (country: Country) => {
        setSelectedCountry(country)
        if (onCountryChange) onCountryChange(country)
        setOpen(false)

        // Focus the input after selecting a country
        setTimeout(() => {
            inputRef.current?.focus()
        }, 0)
    }

    const handleNationalNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Allow only digits, spaces, and dashes
        const sanitizedValue = e.target.value.replace(/[^\d\s-]/g, "")
        setNationalNumber(sanitizedValue)
    }

    const filteredCountries = searchQuery
        ? countries.filter(
            (country) =>
                country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                country.dialCode.includes(searchQuery) ||
                country.code.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        : countries

    return (
        <div className={cn("flex space-x-1", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        disabled={disabled}
                        className="w-[110px] justify-between px-3"
                    >
                        {selectedCountry ? (
                            <span className="flex items-center gap-1 text-sm">
                                <span className="text-base">{selectedCountry.flag}</span>
                                <span>{selectedCountry.dialCode}</span>
                            </span>
                        ) : (
                            <span>Select</span>
                        )}
                        <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[250px] p-0">
                    <Command>
                        <CommandInput placeholder="Search country..." value={searchQuery} onValueChange={setSearchQuery} />
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                            <CommandList>
                                {filteredCountries.map((country) => (
                                    <CommandItem
                                        key={country.code}
                                        value={`${country.name} ${country.dialCode}`}
                                        onSelect={() => handleCountrySelect(country)}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="text-base">{country.flag}</span>
                                        <span className="flex-1 truncate">{country.name}</span>
                                        <span className="text-sm text-muted-foreground">{country.dialCode}</span>
                                        <Check
                                            className={cn("h-4 w-4", selectedCountry?.code === country.code ? "opacity-100" : "opacity-0")}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>

            <div className="relative flex-1">
                <Input
                    ref={inputRef}
                    type="tel"
                    value={nationalNumber}
                    onChange={handleNationalNumberChange}
                    disabled={disabled || !selectedCountry}
                    placeholder={placeholder}
                    className={cn(
                        "pl-3",
                        !isValid && nationalNumber ? "border-destructive" : "",
                        error ? "border-destructive" : "",
                    )}
                />
                {((!isValid && nationalNumber) || error) && (
                    <p className="text-xs text-destructive mt-1">{error || "Please enter a valid phone number"}</p>
                )}
            </div>
        </div>
    )
}

