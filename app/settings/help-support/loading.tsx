import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Skeleton } from "@/components/ui/skeleton"

export default function HelpSupportLoader() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex items-center justify-between w-full mb-8">
                <Skeleton className="h-8 w-48 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Search Bar */}
            <div className="relative mb-8">
                <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="faq" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 md:mb-8">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-10 w-full rounded-md" />
                    ))}
                </TabsList>

                {/* FAQ Tab Content */}
                <TabsContent value="faq">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                <Skeleton className="h-6 w-64" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full space-y-4">
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <AccordionItem key={idx} value={`item-${idx}`}>
                                        <AccordionTrigger>
                                            <Skeleton className="h-6 w-80" />
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <Skeleton className="h-4 w-full mt-2" />
                                            <Skeleton className="h-4 w-3/4 mt-1" />
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Guides Tab Content */}
                <TabsContent value="guides">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                <Skeleton className="h-6 w-64" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                    <Skeleton key={idx} className="h-24 w-full rounded-lg" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contact Tab Content */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">
                                <Skeleton className="h-6 w-64" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <Skeleton key={idx} className="h-28 w-full rounded-lg" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
