import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { Skeleton } from "@/components/ui/skeleton"
  
  export default function ResetPasswordLoading() {
    return (
      <div className="flex h-full items-center justify-center bg-none">
        <Card className="w-[350px]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mt-2">
              <Skeleton className="h-8 w-3/4 mx-auto" />
            </CardTitle>
            <CardContent>
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-5/6 mt-1" />
            </CardContent>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-8 w-1/4" />
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  