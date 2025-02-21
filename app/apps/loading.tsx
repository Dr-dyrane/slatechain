import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-4 pt-6">
      <h1 className="text-3xl font-bold tracking-tight">Apps & Integrations</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-[100px] bg-muted animate-pulse rounded"></div>
              </CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <div className="h-7 w-[80px] bg-muted animate-pulse rounded"></div>
              </div>
              <div className="text-xs text-muted-foreground">
                <div className="h-3 w-[120px] bg-muted animate-pulse rounded mt-1"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>
              <div className="h-6 w-[150px] bg-muted animate-pulse rounded"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] bg-muted animate-pulse rounded"></div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>
              <div className="h-6 w-[120px] bg-muted animate-pulse rounded"></div>
            </CardTitle>
            <CardContent>
              <div className="space-y-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-9 w-9 bg-muted animate-pulse rounded-full"></div>
                    <div className="ml-4 space-y-1">
                      <div className="h-4 w-[200px] bg-muted animate-pulse rounded"></div>
                      <div className="h-3 w-[100px] bg-muted animate-pulse rounded"></div>
                    </div>
                    <div className="ml-auto font-medium">
                      <div className="h-4 w-[50px] bg-muted animate-pulse rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}

