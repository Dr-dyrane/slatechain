# KPI API Documentation

This document outlines the API endpoint related to fetching Key Performance Indicator (KPI) data for the dashboard. It provides details on the request methods, request bodies, response formats, and expected behavior for the endpoint.

## Base URL

All endpoints are relative to the base URL (example):

```
https://your-api-base-url/api/v1
```

## Endpoints

### 1. Get KPI Data

*   **Endpoint:** `/kpis`
*   **Method:** `GET`
*   **Description:** Retrieves the KPI data for the dashboard.
*   **Request Body:** None
*   **Response (200 OK):**

    ```json
    {
         "cardData": [
              {
                 "title": "Total Revenue",
                 "icon": "DollarSign",
                 "value": "$45,231.89",
                 "description": "+20.1% from last month",
                 "type": "revenue",
                 "sparklineData": [10, 15, 12, 18, 20, 25, 22, 28, 30, 35, 32, 40]
               },
               {
                  "title": "Inventory Items",
                   "icon": "CreditCard",
                  "value": "+2,350",
                  "description": "+180.1% from last month",
                   "type": "number",
                   "sparklineData": null
               },
             {
                   "title": "Active Orders",
                    "icon": "Activity",
                     "value": "+573",
                     "description": "+201 since last hour",
                    "type": "orders",
                      "sparklineData": [50, 60, 55, 65, 70, 75, 80, 78, 85, 90, 92, 95]
                },
               {
                 "title": "Shipments in Transit",
                    "icon": "Users",
                  "value": "+989",
                     "description": "+18 since last hour",
                     "type": "number",
                    "sparklineData": null
              },
           ],
           "otherChartData": [
                {
                    "title": "Order Fulfillment",
                     "icon": "Package",
                       "type": "progress",
                       "progress": 75,
                       "label": "75% Complete"
                   },
                   {
                    "title": "Inventory by Category",
                      "icon": "CreditCard",
                       "type": "donut",
                     "donutData": [30, 40, 20, 10],
                      "donutLabels": ["Electronics", "Clothing", "Books", "Other"]
                   }
                    ,
                    {
                        "title": "Shipment Status",
                       "icon": "Truck",
                     "type": "donut",
                        "donutData": [45, 30, 25],
                      "donutLabels": ["In Transit", "Pending", "Delivered"],
                       "colors": ["#38bdf8", "#f97316", "#4ade80"]
                 }
           ]
        }
    ```

    *   `cardData`: An array of objects representing data for the card components.
        *   `title`: Title of the card (String).
        *   `icon`: Icon name (String)
        *   `value`: The main value to display (String).
        *   `description`: Description or additional information (String).
        *   `type`: Type of card ("revenue", "number", or "orders") (String).
        *   `sparklineData`: An array of numbers for the sparkline chart (Number Array, or null).

    *  `otherChartData`: An array of objects representing chart data.
        *   `title`: Title of the chart(String).
        *   `icon`:  Icon name (String)
        *   `type`: Type of chart ("progress" or "donut") (String).
        *   `progress`: Value for progress chart (Number, Optional)
        *   `label`: Label for progress chart (String, Optional).
        *   `donutData`:  Data array for donut chart (Number Array, Optional).
        *   `donutLabels`: Labels for donut chart slices (String Array, Optional).
        * `colors`: Array of colors for donut chart (String array, optional)

*   **Error Responses:**
    *   **404 Not Found:** If no KPI data is found.
    *   **500 Internal Server Error:** For other server-related errors.

## Data Types

### `CardData`
```typescript
export interface CardData {
    title: string;
    icon: string;
    value: string;
    description: string;
    type: "revenue" | "number" | "orders";
    sparklineData: number[] | null;
}
```
### `OtherChartData`
```typescript
export interface OtherChartData {
    title: string;
    icon: string;
    type: "progress" | "donut";
    progress?: number;
    label?: string;
    donutData?: number[];
    donutLabels?: string[];
   colors?: string[]
}
```
## Notes

*   All requests requiring authentication should include the JWT token in the `Authorization` header: `Bearer <your_token>`.
*   Error responses will include a `message` field describing the error.