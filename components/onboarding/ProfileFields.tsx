import { useFormContext, Controller } from "react-hook-form";
import { Building, Briefcase, Users } from "lucide-react";
import { InputField } from "../ui/input-field";

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
    icon: Users,
  },
];

export const ProfileFields: React.FC = () => {
  const { control } = useFormContext(); // ✅ Get control from form context

  return (
    <>
      {profileFields.map((field) => (
        <Controller
          key={field.id}
          name={field.name}
          control={control}
          render={({ field: { onChange, value } }) => (
            <InputField
              id={field.id}
              name={field.name}
              label={field.label}
              type={"text"}
              value={value || ""}
              onChange={onChange} // ✅ Updates react-hook-form state
              required
              icon={field.icon}
            />
          )}
        />
      ))}
    </>
  );
};
