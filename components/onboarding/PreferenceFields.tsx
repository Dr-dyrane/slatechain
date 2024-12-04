import { Mail, Smartphone, Moon } from "lucide-react";
import { SwitchField } from "../ui/switch-field";

interface PreferenceFieldsProps {
  preferences: Record<string, boolean>;
  onToggle: (key: string) => void;
}

const preferenceFields = [
  {
    id: "emailNotifications",
    label: "Email Notifications",
    icon: Mail,
  },
  {
    id: "smsNotifications",
    label: "SMS Notifications",
    icon: Smartphone,
  },
  {
    id: "darkMode",
    label: "Dark Mode",
    icon: Moon,
  },
];

export const PreferenceFields: React.FC<PreferenceFieldsProps> = ({
  preferences,
  onToggle,
}) => (
  <>
    {preferenceFields.map((field) => (
      <SwitchField
        key={field.id}
        id={field.id}
        label={field.label}
        checked={preferences[field.id]}
        onToggle={() => onToggle(field.id)}
        icon={field.icon}
      />
    ))}
  </>
);
