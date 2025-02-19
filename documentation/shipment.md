

# **Logistics & Shipment Tracking System - Technical Documentation**

## **Overview**
The Logistics and Shipment Tracking System is designed to help businesses monitor shipments, track their progress in real time, and manage logistics operations efficiently. The system includes:
- **KPI Cards:** Quick statistics on shipment statuses.
- **Tabs:** For switching between shipment list, tracking, and analytics.
- **Shipment Details:** View and update the status of shipments.
- **Real-time Updates:** Fetch shipment details and update UI dynamically.

---

## **1. Features**
### **Dashboard Components**
1. **KPIs Section**
   - Total Shipments
   - Shipments In Transit
   - Delivered Shipments
   - Pending Shipments

2. **Tabs Section**
   - **All Shipments**: Displays the list of shipments.
   - **In Transit**: Shows shipments currently being transported.
   - **Delivered**: Displays successfully delivered shipments.
   - **Analytics**: Provides graphical insights on shipment data.

3. **Shipment Details**
   - Tracking Number
   - Carrier
   - Status (Preparing, In Transit, Delivered)
   - Estimated Delivery Date
   - Actual Delivery Date (if delivered)
   - Destination

4. **Shipment Progress**
   - A progress bar showing shipment status visually.

---

## **2. UI Implementation**
### **KPIs Cards**
Example of how KPI cards will be structured:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Total Shipments</CardTitle>
  </CardHeader>
  <CardContent>
    <h2 className="text-3xl font-bold">{shipments.length}</h2>
  </CardContent>
</Card>
```
Other KPI cards will follow a similar structure with different values.

### **Responsive Tabs**
```tsx
<Tabs defaultValue="all">
  <TabsList className="w-full mb-8 flex flex-wrap justify-start">
    <TabsTrigger value="all">All Shipments</TabsTrigger>
    <TabsTrigger value="in-transit">In Transit</TabsTrigger>
    <TabsTrigger value="delivered">Delivered</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
  </TabsList>

  <TabsContent value="all">
    <ShipmentList />
  </TabsContent>
  <TabsContent value="in-transit">
    <ShipmentList filter="IN_TRANSIT" />
  </TabsContent>
  <TabsContent value="delivered">
    <ShipmentList filter="DELIVERED" />
  </TabsContent>
  <TabsContent value="analytics">
    <ShipmentAnalytics />
  </TabsContent>
</Tabs>
```
This structure ensures a smooth UI experience.

### **Shipment List**
```tsx
<ul>
  {shipments.map((shipment) => (
    <li key={shipment.id} onClick={() => setSelectedShipment(shipment)}>
      <div className="font-medium text-sm">{shipment.trackingNumber}</div>
      <div className="text-xs text-muted-foreground">{shipment.status}</div>
    </li>
  ))}
</ul>
```

### **Shipment Details**
```tsx
{selectedShipment && (
  <Card>
    <CardHeader>
      <CardTitle>Shipment Details</CardTitle>
      <CardDescription>Order #{selectedShipment.orderId}</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex justify-between">
        <div>
          <MapPin className="mr-2" />
          <span>{selectedShipment.carrier}</span>
        </div>
        <div>
          <Truck className="mr-2" />
          <span>{selectedShipment.destination}</span>
        </div>
      </div>
      <Progress value={selectedShipment.status === "DELIVERED" ? 100 : selectedShipment.status === "IN_TRANSIT" ? 65 : 10} />
      <p>Status: {selectedShipment.status}</p>
    </CardContent>
  </Card>
)}
```

---

## **3. State Management**
Redux is used for managing shipments:
```tsx
const shipments = useSelector((state: RootState) => state.shipment.items);
const dispatch = useDispatch();
useEffect(() => {
  dispatch(fetchShipments());
}, []);
```
This ensures that shipments are dynamically fetched and updated.

### **Redux Slice for Shipments**
```tsx
export const fetchShipments = createAsyncThunk("shipment/fetchShipments", async (_, thunkAPI) => {
  try {
    const response = await apiClient.get<Shipment[]>("/shipments");
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message || "Failed to fetch shipments");
  }
});
```

---

## **4. API Endpoints**
| Method | Endpoint        | Description |
|--------|---------------|-------------|
| GET    | `/shipments`   | Get all shipments |
| POST   | `/shipments`   | Add a new shipment |
| PUT    | `/shipments/:id` | Update a shipment |
| DELETE | `/shipments/:id` | Remove a shipment |

Example API Call:
```tsx
const response = await apiClient.get<Shipment[]>("/shipments");
```

---

## **5. User Roles & Permissions**
| Role       | Access Level |
|------------|-------------|
| Admin      | Full CRUD access |
| Supplier   | Can update shipments |
| Manager    | Can view shipments |
| Customer   | Can track their shipments |

---

## **6. Future Enhancements**
- **Live Tracking:** Integrate real-time location tracking for shipments.
- **Notifications:** Notify customers about shipment status changes.
- **AI Insights:** Predict delivery delays based on shipment history.

---
