import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleSpecificQuestions } from "./RoleSpecificQuestions";
import { ServiceQuestionsProps } from "@/lib/types/onboarding";

export function ServiceQuestions({ role, onComplete }: ServiceQuestionsProps) {
  const [formData, setFormData] = useState({
    productTypes: "",
    paymentMethod: "",
    teamOversight: "",
    purchaseFrequency: "",
    adminTasks: "",
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
        <CardTitle>Service-Specific Questions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <RoleSpecificQuestions
            role={role}
            formData={formData}
            onInputChange={handleInputChange}
          />
          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
