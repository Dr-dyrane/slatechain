import { InputField } from '../ui/input-field';
import { User, Building2, Briefcase, Users } from 'lucide-react';

interface ManagerKYCFormProps {
  formData: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    department: string;
    teamSize: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ManagerKYCForm: React.FC<ManagerKYCFormProps> = ({ formData, onChange }) => (
  <>
    <InputField
      id="fullName"
      name="fullName"
      label="Full Name"
      value={formData.fullName}
      onChange={onChange}
      required
      icon={User}
    />
    <InputField
      id="dateOfBirth"
      name="dateOfBirth"
      label="Date of Birth"
      type="date"
      value={formData.dateOfBirth}
      onChange={onChange}
      required
    />
    <InputField
      id="address"
      name="address"
      label="Address"
      value={formData.address}
      onChange={onChange}
      required
      icon={Building2}
    />
    <InputField
      id="department"
      name="department"
      label="Department"
      value={formData.department}
      onChange={onChange}
      required
      icon={Briefcase}
    />
    <InputField
      id="teamSize"
      name="teamSize"
      label="Team Size"
      type="number"
      value={formData.teamSize}
      onChange={onChange}
      required
      icon={Users}
    />
  </>
);

