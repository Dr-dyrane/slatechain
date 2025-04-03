### **SupplyCycles**  
A modern, responsive, and fully functional **supply chain management platform** with real-time inventory tracking, order management, and logistics, designed with **Slate, Gray, and Black** as the core UI colors. The app will feature **light and dark modes**, implement **state management** for seamless user experience, and follow a modular, scalable design inspired by **Apple’s UI philosophy**.

---

### **Objective**  
To develop a **supply chain platform frontend** with a sleek, minimalist design and powerful functionality that meets the requirements in the provided document while ensuring excellent user experience, responsiveness, and accessibility.

---

### **Features**  
1. **Dashboard**:  
   - Displays KPIs such as inventory levels, order statuses, and shipment tracking.  
   - Includes data cards for quick insights, dynamic charts, and actionable buttons.  

2. **Inventory Management**:  
   - Real-time inventory tracking with filters for stock levels, locations, and categories.  
   - Add, update, and remove inventory items via modal forms.  

3. **Order Management**:  
   - Manage purchase orders with status tracking (pending, shipped, completed).  
   - Create new orders with supplier selection and product details.  

4. **Logistics and Shipment Tracking**:  
   - Visual tracking of shipments on a map with route optimization details.  
   - Notifications for delays and estimated delivery times.  

5. **Supplier Collaboration**:  
   - Supplier profiles with performance metrics and communication tools.  
   - Contract upload and document sharing capabilities.  

6. **Settings and Customization**:  
   - User preferences, light/dark mode toggle, and role-based permissions.  
   - ERP and CRM integrations for streamlined workflows.  

---

### **UI Design**  

#### **Color Palette**:  
- **Light Mode**: Slate (#708090), Light Gray (#D3D3D3), and White (#FFFFFF).  
- **Dark Mode**: Slate (#708090), Dark Gray (#2F4F4F), and Black (#000000).  

#### **Typography**:  
- Primary font: **SF Pro Display** (Apple-inspired).  

#### **Apple UI Philosophy**:  
- **Clarity**: Clean, spacious layouts with clear typography.  
- **Simplicity**: Prioritize essential content, minimize distractions.  
- **Depth**: Subtle animations for navigation transitions and hover effects.  

---

### **Tech Stack**  

1. **Frontend Framework**: **Next.js** for server-side rendering and client-side interactivity.  
2. **Styling**: **Tailwind CSS**, customized with light/dark mode themes.  
3. **State Management**: **Redux Toolkit** for global state (user data, inventory, orders).  
4. **TypeScript**: Strict type checking for components, API responses, and models.  
5. **Radix UI**: For accessible, responsive components (modals, dropdowns, and tooltips).  
6. **API Integration**: Fetch and send data to a backend API (referenced in the document).  

---

### **Development Workflow**  

#### **1. Initial Setup**:  
- Set up **Next.js** with **TypeScript** and **Tailwind CSS**.  
- Configure Tailwind for light/dark mode using `@tailwindcss/forms` and `@tailwindcss/typography`.

#### **2. State Management**:  
- Use **Redux Toolkit** to manage app-wide states for:  
  - User authentication.  
  - Inventory, orders, and shipments.  
  - Dark/light mode preferences.  

#### **3. Reusable Components**:  
Develop core UI components using **Radix UI** and **Tailwind CSS**:  
- **Navbar**: Sticky navigation bar with branding, search, and profile dropdown.  
- **Sidebar**: Collapsible menu for dashboard navigation.  
- **Data Cards**: Display KPIs with icons, values, and labels.  
- **Forms**: Accessible, modular forms for inventory and order management.  
- **Modals**: For adding/editing inventory and orders.  

#### **4. Page Development**:  
- **Dashboard**: Display key metrics with interactive charts and quick actions.  
- **Inventory**: Dynamic tables with sorting, filtering, and pagination.  
- **Orders**: Order tracking interface with visual timelines.  
- **Suppliers**: Profiles and collaborative tools for supplier management.  
- **Settings**: User preferences and ERP/CRM integration settings.  

#### **5. Theming**:  
- Implement light/dark mode using Tailwind’s `dark` class.  
- Use localStorage to persist theme preference.  

#### **6. Integration with Backend**:  
- Fetch real-time data from APIs for inventory, orders, and logistics.  
- Implement error handling and loading states for API interactions.  

#### **7. Testing**:  
- Test accessibility using Lighthouse.  
- Perform unit tests for components and integration tests for API calls.  

---

### **Example Component: Data Card**  
```tsx
import React from 'react';

interface DataCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  onClick?: () => void;
}

const DataCard: React.FC<DataCardProps> = ({ icon, value, label, onClick }) => (
  <div
    className="p-4 bg-slate-100 dark:bg-gray-800 shadow-md rounded-lg flex items-center hover:shadow-lg transition cursor-pointer"
    onClick={onClick}
  >
    <div className="text-slate-600 dark:text-gray-400">{icon}</div>
    <div className="ml-4">
      <p className="text-2xl font-bold text-black dark:text-white">{value}</p>
      <p className="text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  </div>
);

export default DataCard;
```

---

### **Deliverables**  
1. **Fully Functional App**:
   - Responsive UI with light/dark mode toggle.  
   - State management using Redux Toolkit.  
   - Dynamic pages for dashboard, inventory, orders, and settings.  
2. **Integration**:
   - APIs for real-time data fetching (e.g., inventory updates, order statuses).  
3. **Accessibility**:
   - WCAG-compliant components using Radix UI.  