"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/lib/store"; //IMPORT correct types
import { fetchShopifyOrders, fetchShopifyShop } from "@/lib/slices/shopifySlice";

const ShopifyComponent = () => {
    const dispatch = useDispatch<AppDispatch>(); // Add Dispatch!
    const { orders, shop, loading, error } = useSelector((state: RootState) => state.shopify);

    useEffect(() => {
        dispatch(fetchShopifyOrders());
        dispatch(fetchShopifyShop());
    }, [dispatch]);

    if (loading) {
        return <p>Loading Shopify Data...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <div>
            <h2>Shopify Orders</h2>
            {shop && <div>{shop.name} - {shop.domain}</div>}
            {orders && (
                <ul>
                    {orders.map((order) => (
                        <li key={order.id}>Order #{order.order_number} - Total: {order.total_price}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ShopifyComponent;