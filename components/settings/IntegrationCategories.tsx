"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ShoppingCart, Database, Network, BarChart3 } from "lucide-react"
import { motion } from "framer-motion"

interface IntegrationCategoryProps {
    selected: string | null
    onSelect: (category: string) => void
}

const categories = [
    {
        id: "ecommerce",
        name: "E-commerce",
        icon: ShoppingCart,
        description: "Connect your online store",
        color: "text-blue-500",
    },
    {
        id: "erp_crm",
        name: "ERP & CRM",
        icon: Database,
        description: "Enterprise resource planning",
        color: "text-green-500",
    },
    {
        id: "iot",
        name: "IoT",
        icon: Network,
        description: "Internet of Things monitoring",
        color: "text-purple-500",
    },
    {
        id: "bi_tools",
        name: "BI Tools",
        icon: BarChart3,
        description: "Business intelligence tools",
        color: "text-orange-500",
    },
]

export function IntegrationCategories({ selected, onSelect }: IntegrationCategoryProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((category) => {
                const Icon = category.icon
                const isSelected = selected === category.id

                return (
                    <motion.div key={category.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card
                            className={cn("relative cursor-pointer h-full transition-all duration-200", isSelected && "ring-2 ring-primary")}
                            onClick={() => onSelect(category.id)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start space-x-4">
                                    <div className={cn("p-2 rounded-lg bg-primary/10", category.color)}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-semibold">{category.name}</h3>
                                        <p className="text-sm text-muted-foreground">{category.description}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}

