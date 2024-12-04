
import { Mail, Smartphone, Moon } from "lucide-react";
import { SwitchField } from "../ui/switch-field";

interface PreferenceFieldsProps {
  preferences: Record<string, boolean>;
  onToggle: (key: string) => void;
}

export const PreferenceFields: React.FC<PreferenceFieldsProps> = ({
  preferences,
  onToggle,
}) => (
  <>
    <SwitchField
      id="emailNotifications"
      label="Email Notifications"
      checked={preferences.emailNotifications}
      onToggle={() => onToggle("emailNotifications")}
      icon={Mail}
    />
    <SwitchField
      id="smsNotifications"
      label="SMS Notifications"
      checked={preferences.smsNotifications}
      onToggle={() => onToggle("smsNotifications")}
      icon={Smartphone}
    />
    <SwitchField
      id="darkMode"
      label="Dark Mode"
      checked={preferences.darkMode}
      onToggle={() => onToggle("darkMode")}
      icon={Moon}
    />
  </>
);
