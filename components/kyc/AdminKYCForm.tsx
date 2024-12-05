import { User, Building2, Briefcase } from 'lucide-react';
import { InputField } from '../ui/input-field';

interface AdminKYCFormProps {
  formData: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    department: string;
    employeeId: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AdminKYCForm: React.FC<AdminKYCFormProps> = ({ formData, onChange }) => (
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
      id="employeeId"
      name="employeeId"
      label="Employee ID"
      value={formData.employeeId}
      onChange={onChange}
      required
    />
  </>
);

