import React, { useState } from 'react'
import { ColumnDef } from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronRight } from 'lucide-react'
import { TouchableOpacity } from "@/components/ui/touchable-opacity"
import { Modal } from "@/components/ui/modal"
import { Avatar } from "@/components/ui/avatar"

interface ListCardProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function ListCard<TData extends Record<string, any>, TValue>({
    columns,
    data,
}: ListCardProps<TData, TValue>) {
    const [selectedItem, setSelectedItem] = useState<TData | null>(null)

    const handleItemClick = (item: TData) => {
        setSelectedItem(item)
    }

    const closeModal = () => {
        setSelectedItem(null)
    }

    const getAvatarContent = (item: TData) => {
        const firstColumn = columns[0]
        const value = firstColumn.accessorKey ? item[firstColumn.accessorKey as string] : ''
        return typeof value === 'string' ? value.charAt(0).toUpperCase() : '?'
    }

    const renderValue = (column: ColumnDef<TData, TValue>, item: TData) => {
        if (column.cell && typeof column.cell === 'function') {
            return column.cell({ row: { original: item, getValue: (key: string) => item[key] } })
        }
        return column.accessorKey ? item[column.accessorKey as string] : ''
    }

    return (
        <>
            <ScrollArea className="">
                {data.map((item, index) => (
                    <TouchableOpacity key={index} onClick={() => handleItemClick(item)}>
                        <Card className="mb-2">
                            <CardContent className="p-4 flex items-center justify-between">
                                <Avatar className="mr-2">
                                    {getAvatarContent(item)}
                                </Avatar>
                                <div className="flex-grow">
                                    <div className="font-semibold">
                                        {renderValue(columns[0], item)}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {renderValue(columns[1], item)}
                                    </div>
                                </div>
                                {columns.slice(2, 4).map((column, colIndex) => (
                                    <div key={colIndex} className="text-sm text-right mr-4">
                                        {renderValue(column, item)}
                                    </div>
                                ))}
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </CardContent>
                        </Card>
                    </TouchableOpacity>
                ))}
            </ScrollArea>

            <Modal isOpen={!!selectedItem} onClose={closeModal}>
                {selectedItem && (
                    <div className="space-y-4">
                        {columns.map((column, index) => (
                            <div key={index} className="flex flex-col">
                                <span className="font-semibold">{column.header as string}:</span>
                                <span>{renderValue(column, selectedItem)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </>
    )
}

