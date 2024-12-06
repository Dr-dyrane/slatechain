import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleSpecificQuestions } from "./RoleSpecificQuestions";
import { UserRole } from "@/lib/types";

interface ServiceQuestionsProps {
  role: UserRole;
  onComplete: (data: Record<string, any>) => void;
  data?: Record<string, any>;
}

export function ServiceQuestions({ role, onComplete, data }: ServiceQuestionsProps) {
  const [formData, setFormData] = useState(data || {
    productTypes: "",
    paymentMethod: "",
    teamOversight: "",
    purchaseFrequency: "",
    adminTasks: "",
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
        <CardTitle>Service-Specific Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <RoleSpecificQuestions
            role={role}
            formData={formData}
            onInputChange={handleInputChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}

