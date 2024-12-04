import { Building, Briefcase, Users } from "lucide-react";
import { InputField } from "../ui/input-field";

interface ProfileFieldsProps {
  formData: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProfileFields: React.FC<ProfileFieldsProps> = ({
  formData,
  onInputChange,
}) => (
  <>
    <InputField
      id="companyName"
      name="companyName"
      label="Company Name"
      value={formData.companyName}
      onChange={onInputChange}
      required
      icon={Building}
    />
    <InputField
      id="businessType"
      name="businessType"
      label="Business Type"
      value={formData.businessType}
      onChange={onInputChange}
      required
      icon={Briefcase}
    />
    <InputField
      id="employeeCount"
      name="employeeCount"
      label="Number of Employees"
      type="number"
      value={formData.employeeCount}
      onChange={onInputChange}
      required
      icon={Users}
    />
  </>
);
