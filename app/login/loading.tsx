import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";


const AuthLoading = () => {
	return (
		<div className="flex h-full items-center justify-center bg-none">
			<Card className="w-[350px]">
				<CardHeader className="text-center space-y-2">
					<Skeleton className="h-12 w-12 rounded-full mx-auto" />
					<Skeleton className="h-6 w-3/4 mx-auto" />
					<Skeleton className="h-4 w-5/6 mx-auto" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-1/4" />
						<Skeleton className="h-10 w-full" />
					</div>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="flex justify-between w-full">
						<Skeleton className="h-10 w-24" />
						<Skeleton className="h-10 w-24" />
					</div>
					<Skeleton className="h-4 w-3/4 mx-auto" />
					<Skeleton className="h-4 w-2/3 mx-auto" />
				</CardFooter>
			</Card>
		</div>
	);
};

export default AuthLoading;
