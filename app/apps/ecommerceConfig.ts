export const ecommerceIntegrations = {
    shopify: {
      name: "Shopify",
      component: () => import("./ShopifyComponent"),
    },
    woocommerce: {
      name: "WooCommerce",
      component: null, // Future integration
    },
    magento: {
      name: "Magento",
      component: null, // Future integration
    },
    bigcommerce: {
      name: "BigCommerce",
      component: null, // Future integration
    },
  };
  