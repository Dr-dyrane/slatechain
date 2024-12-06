import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileFields } from "./ProfileFields";
import { UserRole } from "@/lib/types";

interface ProfileSetupProps {
    role: UserRole;
    onComplete: (data: Record<string, any>) => void;
    data?: Record<string, any>;
}

export function ProfileSetup({ role, onComplete, data }: ProfileSetupProps) {
    const [formData, setFormData] = useState(data || {
        companyName: "",
        businessType: "",
        employeeCount: "",
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedData = { ...formData, [e.target.name]: e.target.value };
        setFormData(updatedData);
        onComplete(updatedData);
    };

    useEffect(() => {
        onComplete(formData);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <ProfileFields formData={formData} onInputChange={handleInputChange} />
                </div>
            </CardContent>
        </Card>
    );
}

