import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LucideIcon } from "lucide-react";

interface InputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: LucideIcon;
}

export const InputField: React.FC<InputFieldProps> = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  icon: Icon,
}) => (
  <div>
    <Label htmlFor={id} className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      {label}
    </Label>
    <Input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1"
    />
  </div>
);
