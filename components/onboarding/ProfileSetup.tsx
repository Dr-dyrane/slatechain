import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileFields } from "./ProfileFields";
import { ProfileSetupProps } from "@/lib/types/onboarding";

export function ProfileSetup({ role, onComplete }: ProfileSetupProps) {
    const [formData, setFormData] = useState({
        companyName: "",
        businessType: "",
        employeeCount: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(formData);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <ProfileFields formData={formData} onInputChange={handleInputChange} />
                    <Button type="submit" className="w-full">
                        Submit
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
