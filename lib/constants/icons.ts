import { Services } from "@/components/settings/ServiceSelector";


export const services: Services = {
    ecommerce: [{ id: "shopify", name: "Shopify", logo: "/icons/shopify.svg" }],
    erp_crm: [{ id: "sap", name: "SAP", logo: "/icons/sap.svg" }],
    iot: [{ id: "iot_monitoring", name: "IoT Monitoring", logo: "/icons/iot.svg" }],
    bi_tools: [{ id: "power_bi", name: "Power BI", logo: "/icons/powerbi.svg" }],
    auth: [], // Initialize auth, even if empty
};