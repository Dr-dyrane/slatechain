import { Package } from "lucide-react";
import { InputField } from "../ui/input-field";


interface RoleSpecificQuestionsProps {
  role: string;
  formData: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RoleSpecificQuestions: React.FC<RoleSpecificQuestionsProps> = ({
  role,
  formData,
  onInputChange,
}) => {
  switch (role) {
    case "supplier":
      return (
        <>
          <InputField
            id="productTypes"
            name="productTypes"
            label="What types of products do you supply?"
            value={formData.productTypes}
            onChange={onInputChange}
            required
            icon={Package}
          />
          <InputField
            id="paymentMethod"
            name="paymentMethod"
            label="What is your preferred payment method?"
            value={formData.paymentMethod}
            onChange={onInputChange}
            required
            icon={Package}
          />
        </>
      );
    case "manager":
      return (
        <InputField
          id="teamOversight"
          name="teamOversight"
          label="Which teams will you oversee?"
          value={formData.teamOversight}
          onChange={onInputChange}
          required
          icon={Package}
        />
      );
    case "customer":
      return (
        <InputField
          id="purchaseFrequency"
          name="purchaseFrequency"
          label="How often do you make purchases?"
          value={formData.purchaseFrequency}
          onChange={onInputChange}
          required
          icon={Package}
        />
      );
    case "admin":
      return (
        <InputField
          id="adminTasks"
          name="adminTasks"
          label="What administrative tasks will you manage?"
          value={formData.adminTasks}
          onChange={onInputChange}
          required
          icon={Package}
        />
      );
    default:
      return null;
  }
};
