import { Package } from "lucide-react";
import { InputField } from "../ui/input-field";

interface RoleSpecificQuestionsProps {
  role: string;
  formData: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const roleFields = {
  supplier: [
    {
      id: "productTypes",
      name: "productTypes",
      label: "What types of products do you supply?",
    },
    {
      id: "paymentMethod",
      name: "paymentMethod",
      label: "What is your preferred payment method?",
    },
  ],
  manager: [
    {
      id: "teamOversight",
      name: "teamOversight",
      label: "Which teams will you oversee?",
    },
  ],
  customer: [
    {
      id: "purchaseFrequency",
      name: "purchaseFrequency",
      label: "How often do you make purchases?",
    },
  ],
  admin: [
    {
      id: "adminTasks",
      name: "adminTasks",
      label: "What administrative tasks will you manage?",
    },
  ],
};

export const RoleSpecificQuestions: React.FC<RoleSpecificQuestionsProps> = ({
  role,
  formData,
  onInputChange,
}) => {
  const fields = roleFields[role as keyof typeof roleFields];

  if (!fields) return null;

  return (
    <>
      {fields.map((field) => (
        <InputField
          key={field.id}
          id={field.id}
          name={field.name}
          label={field.label}
          value={formData[field.name] || ""}
          onChange={onInputChange}
          required
          icon={Package}
        />
      ))}
    </>
  );
};
