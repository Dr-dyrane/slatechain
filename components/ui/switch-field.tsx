import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LucideIcon } from "lucide-react";

interface SwitchFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: () => void;
  icon?: LucideIcon;
}

export const SwitchField: React.FC<SwitchFieldProps> = ({
  id,
  label,
  checked,
  onToggle,
  icon: Icon,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-gray-500" />}
      <Label htmlFor={id}>{label}</Label>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onToggle} />
  </div>
);
