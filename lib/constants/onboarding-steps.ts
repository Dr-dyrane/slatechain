import { UserRole } from "@/lib/types";

// Add this at the top of the file
export const MAX_STEPS = 6

// Define step IDs as constants to avoid magic numbers
export const ONBOARDING_STEPS = {
	WELCOME: 0,
	PROFILE_SETUP: 1,
	ROLE_SPECIFIC: 2,
	INTEGRATIONS: 3,
	PREFERENCES: 4,
	COMPLETION: 5,
};

// Define step titles and descriptions
export const STEP_DETAILS = {
	[ONBOARDING_STEPS.WELCOME]: {
		title: "Welcome to SupplyCycles",
		description: "Get started with your SupplyCycles account",
		isSkippable: false,
	},
	[ONBOARDING_STEPS.PROFILE_SETUP]: {
		title: "Complete Your Profile",
		description: "Tell us more about yourself",
		isSkippable: false,
	},
	[ONBOARDING_STEPS.ROLE_SPECIFIC]: {
		title: "Role Setup",
		description: "Configure your role-specific settings",
		isSkippable: false,
	},
	[ONBOARDING_STEPS.INTEGRATIONS]: {
		title: "Connect Your Services",
		description: "Integrate with your existing tools",
		isSkippable: true,
	},
	[ONBOARDING_STEPS.PREFERENCES]: {
		title: "Set Your Preferences",
		description: "Customize your SupplyCycles experience",
		isSkippable: true,
	},
	[ONBOARDING_STEPS.COMPLETION]: {
		title: "All Set!",
		description: "You're ready to use SupplyCycles",
		isSkippable: false,
	},
};

// Define role-specific step configurations
export const ROLE_SPECIFIC_STEPS = {
	[UserRole.ADMIN]: {
		title: "Admin Setup",
		description: "Configure your admin settings",
		fields: [
			{
				name: "adminRole",
				label: "Admin Role",
				type: "select",
				required: true,
			},
			{ name: "department", label: "Department", type: "text", required: true },
		],
	},
	[UserRole.SUPPLIER]: {
		title: "Supplier Setup",
		description: "Configure your supplier settings",
		fields: [
			{
				name: "companyName",
				label: "Company Name",
				type: "text",
				required: true,
			},
			{
				name: "productCategories",
				label: "Product Categories",
				type: "multiselect",
				required: true,
			},
			{
				name: "shippingMethods",
				label: "Shipping Methods",
				type: "multiselect",
				required: true,
			},
			{
				name: "paymentTerms",
				label: "Payment Terms",
				type: "select",
				required: true,
			},
		],
	},
	[UserRole.MANAGER]: {
		title: "Manager Setup",
		description: "Configure your manager settings",
		fields: [
			{ name: "teamName", label: "Team Name", type: "text", required: true },
			{ name: "teamSize", label: "Team Size", type: "number", required: true },
			{
				name: "managedDepartments",
				label: "Managed Departments",
				type: "multiselect",
				required: true,
			},
		],
	},
	[UserRole.CUSTOMER]: {
		title: "Customer Setup",
		description: "Configure your customer settings",
		fields: [
			{
				name: "preferredCategories",
				label: "Preferred Categories",
				type: "multiselect",
				required: false,
			},
			{
				name: "communicationPreference",
				label: "Communication Preference",
				type: "select",
				required: true,
			},
			{
				name: "shippingPreference",
				label: "Shipping Preference",
				type: "select",
				required: true,
			},
		],
	},
};

// Define integration options by role
export const INTEGRATION_OPTIONS = {
	[UserRole.ADMIN]: ["erp_crm", "bi_tools"],
	[UserRole.SUPPLIER]: ["ecommerce", "erp_crm", "iot"],
	[UserRole.MANAGER]: ["erp_crm", "bi_tools"],
	[UserRole.CUSTOMER]: ["ecommerce"],
};
