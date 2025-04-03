"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"
import {
    searchAllStores,
    setSearchQuery,
    clearSearch,
    toggleFilter,
    addRecentSearch,
    setSearchDrawerOpen,
    type SearchResult,
} from "@/lib/slices/searchSlice"
import type { AppDispatch, RootState } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
    Search,
    X,
    Package,
    ShoppingCart,
    Truck,
    User,
    RotateCcw,
    FileText,
    Clock,
    Filter,
    ArrowLeft,
} from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

export default function SearchDrawer() {
    const dispatch = useDispatch<AppDispatch>()
    const router = useRouter()
    const inputRef = useRef<HTMLInputElement>(null)

    const { query, results, isSearching, selectedFilters, recentSearches, isSearchDrawerOpen } = useSelector(
        (state: RootState) => state.search,
    )

    // Use custom debounce hook
    const debouncedQuery = useDebounce(query, 300)

    // Handle input change
    const handleSearchChange = (value: string) => {
        dispatch(setSearchQuery(value))
    }

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery.length >= 2) {
            dispatch(searchAllStores(debouncedQuery))
        }
    }, [debouncedQuery, dispatch])

    // Handle result selection
    const handleSelectResult = (result: SearchResult) => {
        if (query) {
            dispatch(addRecentSearch(query))
        }
        dispatch(setSearchDrawerOpen(false))
        router.push(result.url)
    }

    // Handle filter toggle
    const handleFilterToggle = (filter: string) => {
        dispatch(toggleFilter(filter))
        if (query.length >= 2) {
            dispatch(searchAllStores(query))
        }
    }

    // Handle recent search selection
    const handleSelectRecentSearch = (searchTerm: string) => {
        dispatch(setSearchQuery(searchTerm))
        dispatch(searchAllStores(searchTerm))
    }

    // Clear search when drawer closes
    useEffect(() => {
        if (!isSearchDrawerOpen) {
            // Don't clear the query immediately for better UX
            setTimeout(() => {
                if (!isSearchDrawerOpen) {
                    dispatch(clearSearch())
                }
            }, 300)
        }
    }, [isSearchDrawerOpen, dispatch])

    // Focus input when drawer opens
    useEffect(() => {
        if (isSearchDrawerOpen) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [isSearchDrawerOpen])

    // Get icon for result type
    const getIconForType = (type: string) => {
        switch (type) {
            case "inventory":
                return <Package className="h-4 w-4 mr-2" />
            case "order":
                return <ShoppingCart className="h-4 w-4 mr-2" />
            case "supplier":
                return <Truck className="h-4 w-4 mr-2" />
            case "customer":
                return <User className="h-4 w-4 mr-2" />
            case "shipment":
                return <Truck className="h-4 w-4 mr-2" />
            case "return":
                return <RotateCcw className="h-4 w-4 mr-2" />
            case "invoice":
                return <FileText className="h-4 w-4 mr-2" />
            default:
                return <Search className="h-4 w-4 mr-2" />
        }
    }

    // Type labels for display
    const typeLabels: Record<string, string> = {
        inventory: "Inventory",
        order: "Orders",
        supplier: "Suppliers",
        customer: "Customers",
        shipment: "Shipments",
        return: "Returns",
        invoice: "Invoices",
    }

    return (
        <Sheet open={isSearchDrawerOpen} onOpenChange={(open) => dispatch(setSearchDrawerOpen(open))}>
            <SheetContent
                side="left"
                className="sm:max-w-sm overflow-hidden border-none shadow-lg rounded-r-2xl p-0 backdrop-blur-md bg-background/85"
            >
                <SheetHeader className="px-4 pt-4 pb-2">
                    <div className="flex justify-start items-center gap-4 flex-wrap">
                        <SheetTitle className="text-lg text-left font-semibold flex items-center gap-2">
                            {/* <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dispatch(setSearchDrawerOpen(false))}
                                className="h-8 w-8 -ml-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button> */}
                            <span>Global Search</span>
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex items-center px-4 py-2">
                    <Search className="h-4 w-4 mr-2 shrink-0 opacity-50" />
                    <Input
                        ref={inputRef}
                        placeholder="Search across all data..."
                        value={query}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    {query && (
                        <Button variant="ghost" size="icon" onClick={() => dispatch(clearSearch())} className="h-8 w-8 ml-2">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="border-t border-b p-2 mx-4">
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center ml-1">
                            <Filter className="h-3 w-3 mr-1" />
                            Filters:
                        </span>
                        {Object.keys(typeLabels).map((filter) => (
                            <Badge
                                key={filter}
                                variant={selectedFilters.includes(filter) ? "default" : "outline"}
                                className="cursor-pointer"
                                onClick={() => handleFilterToggle(filter)}
                            >
                                {typeLabels[filter]}
                            </Badge>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-border space-y-4 px-4 pb-[3.5rem] mt-2 max-h-[90vh] overflow-y-scroll scrollbar-hide">
                    {isSearching ? (
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-8 w-full" />
                        </div>
                    ) : (
                        <>
                            {query.length < 2 && recentSearches.length > 0 && (
                                <div className="mb-4 pt-2">
                                    <h3 className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Recent Searches</h3>
                                    <div className="space-y-1">
                                        {recentSearches.map((search, index) => (
                                            <Button
                                                key={`recent-${index}`}
                                                variant="ghost"
                                                className="w-full justify-start px-2 py-1.5 h-auto"
                                                onClick={() => handleSelectRecentSearch(search)}
                                            >
                                                <Clock className="h-4 w-4 mr-2 opacity-50" />
                                                <span>{search}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query.length >= 2 && results.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No results found</h3>
                                    <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
                                </div>
                            )}

                            {Object.entries(
                                results.reduce(
                                    (acc, result) => {
                                        if (!acc[result.type]) {
                                            acc[result.type] = []
                                        }
                                        acc[result.type].push(result)
                                        return acc
                                    },
                                    {} as Record<string, SearchResult[]>,
                                ),
                            ).map(([type, typeResults]) => (
                                <div key={type} className="mb-4 pt-2">
                                    <h3 className="px-2 py-1.5 text-sm font-medium text-muted-foreground">{typeLabels[type] || type}</h3>
                                    <div className="space-y-1">
                                        {typeResults.map((result) => (
                                            <Button
                                                key={result.id}
                                                variant="ghost"
                                                className="w-full justify-start px-2 py-2 h-auto"
                                                onClick={() => handleSelectResult(result)}
                                            >
                                                <div className="flex items-start">
                                                    {getIconForType(result.type)}
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-medium">{result.title}</span>
                                                        <span className="text-xs text-muted-foreground">{result.subtitle}</span>
                                                        {result.description && (
                                                            <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                                                {result.description}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                <div className="border-t p-2 absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                        <div>
                            Press <kbd className="px-1 rounded bg-muted">↑</kbd> <kbd className="px-1 rounded bg-muted">↓</kbd> to
                            navigate
                        </div>
                        <div>
                            Press <kbd className="px-1 rounded bg-muted">Enter</kbd> to select
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

