import { InputField } from '../ui/input-field';
import { User, Building2, Briefcase, FileText } from 'lucide-react';

interface SupplierKYCFormProps {
  formData: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    companyName: string;
    taxId: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const SupplierKYCForm: React.FC<SupplierKYCFormProps> = ({ formData, onChange }) => (
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
      id="companyName"
      name="companyName"
      label="Company Name"
      value={formData.companyName}
      onChange={onChange}
      required
      icon={Briefcase}
    />
    <InputField
      id="taxId"
      name="taxId"
      label="Tax ID"
      value={formData.taxId}
      onChange={onChange}
      required
      icon={FileText}
    />
  </>
);

