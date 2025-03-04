# KPI API Documentation

This document outlines the API endpoint related to fetching Key Performance Indicator (KPI) data for the dashboard. It provides details on the request methods, request bodies, response formats, and expected behavior for the endpoint.

## Base URL

All endpoints are relative to the base URL (example):

```
https://your-api-base-url/api/v1
```

## Endpoints

### 1. Get KPI Data

- **Endpoint:** `/kpis`
- **Method:** `GET`
- **Description:** Retrieves the KPI data for the dashboard.
- **Request Body:** None
- **Response (200 OK):**

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
  		}
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
  		},
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

  - `cardData`: An array of objects representing data for the card components.

    - `title`: Title of the card (String).
    - `icon`: Icon name (String)
    - `value`: The main value to display (String).
    - `description`: Description or additional information (String).
    - `type`: Type of card ("revenue", "number", or "orders") (String).
    - `sparklineData`: An array of numbers for the sparkline chart (Number Array, or null).

  - `otherChartData`: An array of objects representing chart data.
    - `title`: Title of the chart(String).
    - `icon`: Icon name (String)
    - `type`: Type of chart ("progress" or "donut") (String).
    - `progress`: Value for progress chart (Number, Optional)
    - `label`: Label for progress chart (String, Optional).
    - `donutData`: Data array for donut chart (Number Array, Optional).
    - `donutLabels`: Labels for donut chart slices (String Array, Optional).
    - `colors`: Array of colors for donut chart (String array, optional)

- **Error Responses:**
  - **404 Not Found:** If no KPI data is found.
  - **500 Internal Server Error:** For other server-related errors.

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
	colors?: string[];
}
```

## Notes

- All requests requiring authentication should include the JWT token in the `Authorization` header: `Bearer <your_token>`.
- Error responses will include a `message` field describing the error.

# Backend Implementation Request for KPI Dashboard

## Overview

This document outlines the backend implementation requirements for the KPI Dashboard, ensuring accurate alignment with the frontend mock data structure.

---

## Endpoints Specification

### 1. **Fetch KPI Metrics**

**Endpoint:** `GET /api/kpis`

**Response Format:**

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
		}
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
		},
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

### 2. **Fetch Demand Forecast Data**

**Endpoint:** `GET /api/demand-forecasts`

**Response Format:**

```json
{
	"forecasts": [
		{
			"id": "forecast-1",
			"name": "Product A - August Forecast",
			"inventoryItemId": "1",
			"forecastDate": "2024-08-01T00:00:00Z",
			"quantity": 120,
			"confidenceIntervalUpper": 150,
			"confidenceIntervalLower": 90,
			"algorithmUsed": "ARIMA",
			"parameters": [{ "name": "Seasonality", "value": "High" }],
			"notes": "High promotional activity expected."
		},
		{
			"id": "forecast-2",
			"name": "Product B - September Forecast",
			"inventoryItemId": "2",
			"forecastDate": "2024-09-01T00:00:00Z",
			"quantity": 180,
			"confidenceIntervalUpper": 220,
			"confidenceIntervalLower": 140,
			"algorithmUsed": "Exponential Smoothing",
			"parameters": [{ "name": "Trend", "value": "Upward" }],
			"notes": "Sustained growth trend observed."
		}
	]
}
```

### 3. **Fetch Demand Planning KPIs**

**Endpoint:** `GET /api/demand-planning`

**Response Format:**

```json
{
	"forecastAccuracy": 0.85,
	"meanAbsoluteDeviation": 25,
	"bias": 5,
	"serviceLevel": 0.95
}
```

### 4. **Fetch Area Chart Data**

**Endpoint:** `GET /api/area-chart`

**Response Format:**

```json
{
	"title": "Monthly Demand Forecast",
	"xAxisKey": "date",
	"yAxisKey": "quantity",
	"upperKey": "confidenceIntervalUpper",
	"lowerKey": "confidenceIntervalLower",
	"data": [
		{
			"date": "2024-08-01",
			"quantity": 120,
			"confidenceIntervalUpper": 150,
			"confidenceIntervalLower": 90
		},
		{
			"date": "2024-09-01",
			"quantity": 180,
			"confidenceIntervalUpper": 220,
			"confidenceIntervalLower": 140
		}
	]
}
```

---

## Additional Considerations

1. **Filtering & Query Parameters:**

   - `/api/demand-forecasts?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` (Filter by date range)
   - `/api/kpis?timeframe=last_30_days` (Filter by time period)

2. **Real-Time Updates:**

   - Consider WebSockets for live updates on orders and shipments.

3. **Authentication & Authorization:**
   - Ensure endpoints are protected with role-based access control (RBAC).

---

## Summary

This backend implementation request ensures:
✅ Accurate data retrieval for KPIs, demand forecasts, and charts.
✅ Structured endpoints with appropriate filtering options.
✅ Potential for real-time updates on critical metrics.

Let me know if any modifications are needed! 🚀

Thought for 6 secondsThe user is requesting backend API endpoints for a KPI dashboard in their inventory/logistics system. They've provided the expected response formats for several endpoints and mentioned that these would involve calculations using existing models. They've also attached a Redux slice file that will consume these API endpoints.

Let's analyze what we need to implement:

1. **GET /api/kpis** - Returns card data and other chart data for the dashboard
2. **GET /api/demand-forecasts** - Returns forecast data for inventory items
3. **GET /api/demand-planning** - Returns KPIs related to demand planning
4. **GET /api/area-chart** - Returns data for an area chart showing monthly demand forecasts


These endpoints will need to perform calculations based on data from existing models like:

- Orders
- Inventory
- Shipments
- Manufacturing orders
- Stock movements


I'll need to create these API endpoints and implement the necessary calculations to generate the required data. The calculations will involve aggregating data, computing statistics, and formatting the results according to the specified response formats.

Let's start by implementing these endpoints one by one.

### Backend Implementation for KPI Dashboard

I'll implement the backend API endpoints for your KPI dashboard. These endpoints will perform calculations using your existing models to generate the required KPI data.

```typescriptreact project="auth-routes"
...
```

## Implementation Details

I've created the backend API endpoints for your KPI dashboard with the following features:

### 1. `/api/kpis` Endpoint

- Calculates total revenue from orders
- Computes revenue percentage change from previous month
- Counts inventory items and calculates growth
- Tracks active orders and recent order activity
- Monitors shipments in transit and recent shipment activity
- Generates sparkline data for revenue and orders trends
- Calculates order fulfillment rate
- Analyzes inventory by category
- Tracks shipment status distribution


### 2. `/api/demand-forecasts` Endpoint

- Identifies top inventory items by order frequency
- Generates forecasts for these items using historical data
- Calculates confidence intervals for each forecast
- Simulates different forecasting algorithms (ARIMA, Exponential Smoothing, etc.)
- Provides relevant parameters for each forecast
- Includes notes about demand patterns and potential impacts


### 3. `/api/demand-planning` Endpoint

- Calculates key demand planning KPIs:

- Forecast accuracy
- Mean absolute deviation (MAD)
- Bias
- Service level



- Generates detailed forecasts for top inventory items
- Includes algorithm details and confidence intervals


### 4. `/api/area-chart` Endpoint

- Generates time-series forecast data for area charts
- Supports filtering by specific inventory item
- Configurable forecast horizon (number of months)
- Incorporates seasonal patterns and trends
- Includes confidence intervals for better decision-making
- Adjusts forecast uncertainty based on time horizon


## Implementation Notes

1. **Data Calculations**:

1. All endpoints perform calculations based on your existing data models (Orders, Inventory, Shipments, etc.)
2. Where historical data is limited, the system uses realistic simulations to provide meaningful insights



2. **Performance Considerations**:

1. Endpoints use aggregation pipelines for efficient data processing
2. Rate limiting is implemented to prevent API abuse
3. Results are formatted according to your frontend requirements



3. **Integration with Redux**:

1. The implemented endpoints align perfectly with your provided Redux slice
2. The response formats match the expected data structures



4. **Extensibility**:

1. The `DemandForecast` model is included to support future persistence of forecasts
2. The code is structured to allow for more sophisticated forecasting algorithms in the future





## Next Steps

1. **Refine Algorithms**: As you collect more data, you can enhance the forecasting algorithms with more sophisticated statistical methods
2. **Add Machine Learning**: Consider implementing ML-based forecasting for improved accuracy
3. **Real-time Updates**: Add WebSocket support for real-time dashboard updates
4. **Historical Comparisons**: Extend the API to provide year-over-year comparisons


These endpoints provide a solid foundation for your KPI dashboard, delivering meaningful insights into your inventory and logistics operations.