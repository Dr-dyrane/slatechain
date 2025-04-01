// lib/types/returns.ts

export interface Product {
    _id: string;
    name: string;
    sku: string;
    supplierId?: string;
  }
  
  export interface OrderItem {
    _id: string;
    productId: Product;
    quantity: number;
    price: number;
  }
  
  export interface Order {
    _id: string;
    orderNumber: string;
    customerId: string;
    items: OrderItem[];
  }
  
  export interface Customer {
    _id: string;
    email: string;
    role: string;
  }
  
  export interface ReturnItem {
    _id?: string;
    returnRequestId: string;
    orderItemId: string;
    productId: Product | string;
    quantityRequested: number;
    quantityReceived?: number;
    disposition?: string;
    itemCondition?: string;
  }
  
  export interface ReturnResolution {
    _id?: string;
    returnRequestId?: string;
    orderId?: string;
    status?: string;
    resolutionType?: string;
    resolvedBy?: string;
    resolutionDate?: string;
    notes?: string;
    refundAmount?: number;
    refundTransactionId?: string;
    replacementOrderId?: string;
    storeCreditAmount?: number;
    storeCreditCode?: string;
    exchangeNotes?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface ReturnRequest {
    _id: string;
    returnRequestNumber: string;
    orderId: Order;
    customerId: Customer;
    requestDate: string;
    status: string;
    returnReason: string;
    reasonDetails?: string;
    proofImages: string[];
    preferredReturnType: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    resolution?: ReturnResolution | null;
    returnItems: ReturnItem[];
  }
  