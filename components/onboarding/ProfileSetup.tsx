import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProfileSetupProps {
    role: string;
    onComplete: (data: { [key: string]: string | number | boolean }) => void;
}

export function ProfileSetup({ role, onComplete }: ProfileSetupProps) {
    const [formData, setFormData] = useState({
        companyName: '',
        businessType: '',
        employeeCount: '',
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onComplete(formData)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Setup</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="businessType">Business Type</Label>
                            <Input
                                id="businessType"
                                name="businessType"
                                value={formData.businessType}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="employeeCount">Number of Employees</Label>
                            <Input
                                id="employeeCount"
                                name="employeeCount"
                                type="number"
                                value={formData.employeeCount}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <Button type="submit">Submit</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

