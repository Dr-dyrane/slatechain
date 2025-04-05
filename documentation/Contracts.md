# ✅ CONTRACT MANAGEMENT MODULE DOCUMENTATION

---

## 🧩 MODULE PURPOSE

To manage and track **contracts between your company and suppliers**. Contracts include metadata, versions, statuses, and are visible from both the supplier side and the admin side. Bids can now be linked to contracts to ensure traceability from proposal to agreement.

---

## 1. 🧾 DATABASE MODEL (Mongoose + TypeScript)

```ts
// models/contract.model.ts

import mongoose, { Schema, Document } from "mongoose";
import { addIdSupport } from "@/lib/mongo";

export type ContractStatus =
	| "draft"
	| "open"
	| "active"
	| "completed"
	| "expired"
	| "terminated";

export interface IContract extends Document {
	title: string;
	description?: string;
	contractNumber: string;
	status: ContractStatus;
	startDate: Date;
	endDate: Date;
	renewalDate?: Date;
	supplierId: mongoose.Types.ObjectId;
	version: number;
	notes?: string;
	tags?: string[];
	bidId?: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
	signedBySupplier?: boolean;
	signedByAdmin?: boolean;
	isTerminated?: boolean;
	terminationReason?: string;
	createdAt?: Date;
	updatedAt?: Date;
}

const contractSchema = new Schema<IContract>(
	{
		title: { type: String, required: true },
		description: { type: String },
		contractNumber: { type: String, required: true, unique: true },
		status: {
			type: String,
			enum: ["active", "expired", "terminated", "pending", "draft", "open"],
			default: "draft",
		},
		startDate: { type: Date, required: true },
		endDate: { type: Date, required: true },
		renewalDate: { type: Date },
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Supplier",
			required: true,
			index: true,
		},
		version: { type: Number, default: 1 },
		notes: { type: String },
		tags: [{ type: String }],
		bidId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Bid",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		signedBySupplier: { type: Boolean, default: false },
		signedByAdmin: { type: Boolean, default: false },
		isTerminated: { type: Boolean, default: false },
		terminationReason: { type: String },
	},
	{ timestamps: true }
);

addIdSupport(contractSchema);

contractSchema.index({ contractNumber: 1 }, { unique: true });
contractSchema.index({ supplierId: 1 });

export default mongoose.models.Contract ||
	mongoose.model<IContract>("Contract", contractSchema);
```

---

## 2. 🔌 API ROUTES (Example Endpoints)

```
GET     /api/contracts                 => Get all contracts (admin)
GET     /api/contracts/:id            => Get single contract
GET     /api/contracts/supplier/:id   => Get contracts for a supplier
POST    /api/contracts                => Create new contract
PUT     /api/contracts/:id            => Update contract
DELETE  /api/contracts/:id            => Delete/terminate contract
```

---

## 3. 💻 UI FLOW

### 🔹 SUPPLIER PORTAL (Tab: `Contracts`)

- **List of contracts**
  - Status (active/expired/draft)
  - Version
  - Start & End Date
  - Linked Bid (optional)
- **Actions (Supplier-side)**:
  - View details
  - Sign contract (if unsigned)
  - View termination reason (if terminated)

---

### 🔹 ADMIN/MANAGER PANEL (Tab per supplier: `Contracts`)

- **List of contracts per supplier**
  - Status
  - Version
  - Linked Bid (view details)
- **Actions (Admin-side)**:
  - Create contract
  - Edit contract metadata
  - Terminate contract
  - Mark as signed
  - Link to Bid
  - Renew version (duplicate and increment `version`)

---

## 4. 🧠 FRONTEND STATE SHAPE (Zustand or React Context)

```ts
type Contract = {
	_id: string;
	title: string;
	contractNumber: string;
	description?: string;
	status: ContractStatus;
	version: number;
	startDate: string;
	endDate: string;
	renewalDate?: string;
	supplierId: string;
	bidId?: string;
	createdBy: string;
	signedBySupplier?: boolean;
	signedByAdmin?: boolean;
	isTerminated?: boolean;
	terminationReason?: string;
	tags?: string[];
	notes?: string;
	createdAt: string;
	updatedAt: string;
};
```

---

## 5. 📦 COMPONENTS (Frontend UI)

### 🧱 Components to Reuse

- `ContractCard`: Compact display
- `ContractTable`: Full list with filters
- `ContractFormModal`: Create or edit contract (admin only)
- `ContractViewer`: Display contract metadata + linked bid
- `ContractStatusBadge`: Color-coded badge
- `ContractSignButton`: Conditional render for signing
- `ContractTerminateModal`: For termination reason

---

## 6. 🧪 VALIDATION

### Server-side

- Check unique `contractNumber`
- Validate date logic: `startDate < endDate`
- If status is `terminated`, `terminationReason` is required
- Only admin can create/edit/delete contracts

### Frontend

- End date must be after start date
- Tags optional, limit to 5
- Must select a valid bid if linking to a bid

---

## 7. 🔐 ROLE-BASED ACCESS

| Action               | Supplier | Admin |
| -------------------- | -------- | ----- |
| View contracts       | ✅       | ✅    |
| Download (external)  | ✅       | ✅    |
| Sign contract        | ✅       | ❌    |
| Create/edit contract | ❌       | ✅    |
| Terminate contract   | ❌       | ✅    |
| Link to Bid          | ❌       | ✅    |

---

## 8. 🔁 RENEWAL / VERSIONING FLOW

- When renewing a contract:
  - Create a **new record**
  - Link to same `supplierId`
  - `version = previousVersion + 1`
  - Copy most fields, allow updates

---

## 9. 🔗 BID INTEGRATION

- Each contract can be linked to an approved bid:
  - One-to-one relationship (`bidId`)
  - When selecting bid in contract form, only show accepted/awarded bids
- On contract details page:
  - Show bid reference
  - Allow navigation to the full bid details

---

## 10. ✨ FUTURE SCALABILITY

- eSignature integration (DocuSign, HelloSign)
- Comments/Notes section per contract
- Full audit log (who created, updated, signed, etc.)
- Contract reminders via email
- Multi-language support

---

# ✅ BID MANAGEMENT MODULE DOCUMENTATION

---

## 🧩 MODULE PURPOSE

To handle and track **bids submitted by suppliers** in response to a request for proposals (RFPs), tenders, or procurement opportunities. Bids can include pricing, timelines, supplier metadata, and status. Bids can be **linked to contracts** when approved.

---

## 1. 🧾 DATABASE MODEL (Mongoose + TypeScript)

```ts
// models/bid.model.ts

import mongoose, { Schema, Document } from "mongoose";
import { addIdSupport } from "@/lib/mongo";

export type BidStatus = "submitted" | "under_review" | "accepted" | "rejected";

export interface IBid extends Document {
	title: string;
	referenceNumber: string;
	description?: string;
	status: BidStatus;
	submissionDate: Date;
	validUntil: Date;
	proposedAmount: number;
	durationInDays: number;
	supplierId: mongoose.Types.ObjectId;
	notes?: string;
	tags?: string[];
	linkedContractId?: mongoose.Types.ObjectId;
	createdBy: mongoose.Types.ObjectId;
	createdAt?: Date;
	updatedAt?: Date;
}

const bidSchema = new Schema<IBid>(
	{
		title: { type: String, required: true },
		referenceNumber: { type: String, required: true, unique: true },
		description: { type: String },
		status: {
			type: String,
			enum: ["submitted", "under_review", "accepted", "rejected"],
			default: "submitted",
		},
		submissionDate: { type: Date, required: true },
		validUntil: { type: Date, required: true },
		proposedAmount: { type: Number, required: true },
		durationInDays: { type: Number, required: true },
		supplierId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Supplier",
			required: true,
		},
		tags: [{ type: String }],
		notes: { type: String },
		linkedContractId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Contract",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{ timestamps: true }
);

addIdSupport(bidSchema);

bidSchema.index({ referenceNumber: 1 }, { unique: true });
bidSchema.index({ supplierId: 1 });

export default mongoose.models.Bid || mongoose.model<IBid>("Bid", bidSchema);
```

---

## 2. 🔌 API ROUTES (REST, for thunk usage)

```http
POST /api/contracts/bid/[contractId]: Create a new bid.

PUT /api/contracts/bid/[bidId]: Update an existing bid.

GET /api/contracts/bid/[contractId]: Get a list of bids for a contract.

GET /api/contracts/bid/[bidId]: Get a specific bid.

DELETE /api/contracts/bid/[bidId]: Delete a bid.
```

---

## 3. ⚙️ REDUX SLICE (bidSlice.ts)

### `src/redux/slices/bidSlice.ts`

```ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchBids = createAsyncThunk("bids/fetchAll", async () => {
	const res = await axios.get("/api/bids");
	return res.data;
});

export const createBid = createAsyncThunk("bids/create", async (payload) => {
	const res = await axios.post("/api/bids", payload);
	return res.data;
});

export const updateBid = createAsyncThunk(
	"bids/update",
	async ({ id, data }) => {
		const res = await axios.put(`/api/bids/${id}`, data);
		return res.data;
	}
);

export const deleteBid = createAsyncThunk("bids/delete", async (id) => {
	await axios.delete(`/api/bids/${id}`);
	return id;
});

const bidSlice = createSlice({
	name: "bids",
	initialState: {
		items: [],
		status: "idle",
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchBids.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchBids.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.items = action.payload;
			})
			.addCase(fetchBids.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})
			.addCase(createBid.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(updateBid.fulfilled, (state, action) => {
				const index = state.items.findIndex(
					(b) => b._id === action.payload._id
				);
				if (index !== -1) state.items[index] = action.payload;
			})
			.addCase(deleteBid.fulfilled, (state, action) => {
				state.items = state.items.filter((b) => b._id !== action.payload);
			});
	},
});

export default bidSlice.reducer;
```

---

## 4. 🧠 STATE SHAPE

1. **Bid creation** should use the `userId` from the logged-in supplier.
2. **Fetching bids** will only retrieve the bids relevant to the supplier (if needed).
3. **State shape** will be updated to reflect additional information, such as the supplier's userId.


### 1. `bidSlice.ts`**

We will adjust the actions and reducers to include the `supplierId` and ensure that only the bids relevant to the current supplier are fetched or created.

```ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch all bids (for admin or managers, with proper access control)
export const fetchBids = createAsyncThunk("bids/fetchAll", async (userId: string) => {
  const res = await axios.get(`/api/bids?userId=${userId}`);
  return res.data;
});

// Create a new bid linked to the supplier
export const createBid = createAsyncThunk("bids/create", async (payload: { userId: string, bidData: any }) => {
  const res = await axios.post("/api/bids", { ...payload.bidData, userId: payload.userId });
  return res.data;
});

// Update an existing bid
export const updateBid = createAsyncThunk("bids/update", async ({ id, data }: { id: string, data: any }) => {
  const res = await axios.put(`/api/bids/${id}`, data);
  return res.data;
});

// Delete a bid
export const deleteBid = createAsyncThunk("bids/delete", async (id: string) => {
  await axios.delete(`/api/bids/${id}`);
  return id;
});

const bidSlice = createSlice({
  name: "bids",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBids.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBids.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createBid.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBid.fulfilled, (state, action) => {
        const index = state.items.findIndex((b) => b._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteBid.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload);
      });
  },
});

export default bidSlice.reducer;
```

### 2. **Updated `BidState` Interface**

Update the `BidState` interface to account for supplier-specific data if needed.

```ts
interface Bid {
  _id: string;
  title: string;
  referenceNumber: string;
  status: "submitted" | "under_review" | "accepted" | "rejected";
  submissionDate: string;
  validUntil: string;
  proposedAmount: number;
  durationInDays: number;
  supplierId: string;  // Linked to the Supplier
  linkedContractId?: string;  // Optional, linked to a contract
  tags?: string[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface BidState {
  items: Bid[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
```

### 3. **Modifying the API Call (`/api/bids`)**

If you need to filter the bids based on the supplier (`userId`), you can modify the `/api/bids` API endpoint. You can either send the `userId` as a query parameter or include it in the request body (for POST requests).

For example, in the `fetchBids` thunk, we’re passing the `userId` to filter the bids relevant to that supplier:

```ts
export const fetchBids = createAsyncThunk("bids/fetchAll", async (userId: string) => {
  const res = await axios.get(`/api/bids?userId=${userId}`); // Fetch bids for the specific supplier
  return res.data;
});
```

On the backend, the logic to filter bids by `userId` would look something like this:

```ts
export async function GET(req: NextRequest) {
  const { userId } = req.query;

  if (userId) {
    const bids = await Bid.find({ supplierId: userId });  // Filter bids by supplierId
    return NextResponse.json(bids);
  } else {
    const bids = await Bid.find();  // Fetch all bids (admin or manager can access all)
    return NextResponse.json(bids);
  }
}
```

### 4. **Supplier Role Validation**

Ensure that your API checks the role of the user and restricts bid access to the correct user (i.e., a supplier should only see their own bids, while admins or managers might see multiple suppliers' bids).

Here's an example of the backend code for checking the role of the user and verifying that they only modify their own bid:

```ts
// Backend validation for bid update
if (user.role === UserRole.SUPPLIER && user._id.toString() !== bid.supplierId.toString()) {
  return NextResponse.json(
    { code: "UNAUTHORIZED", message: "You cannot modify this bid" },
    { status: 403 }
  );
}
```

### Summary of Changes:
- **Redux Thunks**: Modify the `createBid` and `fetchBids` thunks to use the `userId` to link bids to the supplier.
- **Backend**: Ensure the `GET` API fetches bids based on the logged-in supplier's `userId`, while admins and managers can see all bids.
- **State Shape**: Update the `Bid` interface to link each bid to a specific supplier, using `supplierId`.

With these changes, the **Bid** functionality should be correctly linked to a **Supplier**, and only the appropriate bids will be fetched, created, updated, or deleted by the supplier who owns them.

---

## 5. 🔧 COMPONENT FLOW

**For Supplier**

- `SubmitBidForm`
- `MyBidsList`
- `BidStatusTag`

**For Admin**

- `AllBidsTable`
- `BidDetailsDrawer`
- `AcceptRejectBidModal`
- `ConvertToContractButton`

---

## 6. 🔒 PERMISSION MATRIX

| Action             | Supplier | Admin |
| ------------------ | -------- | ----- |
| Submit bid         | ✅       | ❌    |
| View own bids      | ✅       | ✅    |
| Edit before review | ✅       | ✅    |
| Accept/Reject      | ❌       | ✅    |
| Link to Contract   | ❌       | ✅    |

---

## ⚙️ REDUX SLICE (contractSlice.ts)

```ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const fetchContracts = createAsyncThunk(
	"contracts/fetchAll",
	async () => {
		const res = await axios.get("/api/contracts");
		return res.data;
	}
);

export const createContract = createAsyncThunk(
	"contracts/create",
	async (payload) => {
		const res = await axios.post("/api/contracts", payload);
		return res.data;
	}
);

export const updateContract = createAsyncThunk(
	"contracts/update",
	async ({ id, data }) => {
		const res = await axios.put(`/api/contracts/${id}`, data);
		return res.data;
	}
);

export const deleteContract = createAsyncThunk(
	"contracts/delete",
	async (id) => {
		await axios.delete(`/api/contracts/${id}`);
		return id;
	}
);

const contractSlice = createSlice({
	name: "contracts",
	initialState: {
		items: [],
		status: "idle",
		error: null,
	},
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchContracts.pending, (state) => {
				state.status = "loading";
			})
			.addCase(fetchContracts.fulfilled, (state, action) => {
				state.status = "succeeded";
				state.items = action.payload;
			})
			.addCase(fetchContracts.rejected, (state, action) => {
				state.status = "failed";
				state.error = action.error.message;
			})
			.addCase(createContract.fulfilled, (state, action) => {
				state.items.push(action.payload);
			})
			.addCase(updateContract.fulfilled, (state, action) => {
				const index = state.items.findIndex(
					(c) => c._id === action.payload._id
				);
				if (index !== -1) state.items[index] = action.payload;
			})
			.addCase(deleteContract.fulfilled, (state, action) => {
				state.items = state.items.filter((c) => c._id !== action.payload);
			});
	},
});

export default contractSlice.reducer;
```

---

## 🔁 LINKING BID TO CONTRACT

When creating a contract from a bid:

1. Pass the bid ID to the contract creation API.
2. Store it as `linkedBidId` in the contract.
3. Update the bid's `linkedContractId` with the contract ID.

---
