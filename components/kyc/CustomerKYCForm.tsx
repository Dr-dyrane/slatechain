import { InputField } from '../ui/input-field';
import { User, Building2, CreditCard } from 'lucide-react';

interface CustomerKYCFormProps {
  formData: {
    fullName: string;
    dateOfBirth: string;
    address: string;
    customerType: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const CustomerKYCForm: React.FC<CustomerKYCFormProps> = ({ formData, onChange }) => (
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
      id="customerType"
      name="customerType"
      label="Customer Type"
      value={formData.customerType}
      onChange={onChange}
      required
      icon={CreditCard}
    />
  </>
);

