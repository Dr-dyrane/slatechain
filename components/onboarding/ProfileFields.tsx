import { Building, Briefcase, Users } from "lucide-react";
import { InputField } from "../ui/input-field";

interface ProfileFieldsProps {
  formData: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const profileFields = [
  {
    id: "companyName",
    name: "companyName",
    label: "Company Name",
    icon: Building,
  },
  {
    id: "businessType",
    name: "businessType",
    label: "Business Type",
    icon: Briefcase,
  },
  {
    id: "employeeCount",
    name: "employeeCount",
    label: "Number of Employees",
    type: "number",
    icon: Users,
  },
];

export const ProfileFields: React.FC<ProfileFieldsProps> = ({
  formData,
  onInputChange,
}) => (
  <>
    {profileFields.map((field) => (
      <InputField
        key={field.id}
        id={field.id}
        name={field.name}
        label={field.label}
        type={field.type || "text"}
        value={formData[field.name] || ""}
        onChange={onInputChange}
        required
        icon={field.icon}
      />
    ))}
  </>
);
