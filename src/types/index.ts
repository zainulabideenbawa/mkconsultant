import type { Session } from 'next-auth'
export interface SessionData extends Session {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }

}

export interface SubTask {
  id: string;
  taskId: number;
  name: string;
  description: string;
  assingTo: string;
  startDate: string;
  endDate: string;
  cost: number;
  vat: number;
  projectId: string;
  payment: string;
  transactionType: string;
  subContactor: {
    id: string;
    name: string;
    address: string
    email: string
    phone: string
  };
}

export interface Client {
  id: string;
  clientId: number;
  name: string;
  email: string;
  phone: string;
  location: string;
  project: QuotationData[]
}

export interface User {
  firstName: string;
  lastName: string;
}

export interface UserFor2FA {
  email: string;
  id: string;
  role: string;
  password: string;
  twoFactorSecret: string;
  firstName: string | null;
  lastName: string | null;
  designation: string;
  createdAt: Date;
  updatedAt: Date;
  twoFactorEnabled: boolean;
}

export interface Material {
  id: string;
  material: string;
  requireFor: string;
  supplierId: string;
  quantity: number;
  unit: string;
  price: number;
  vat: number;
  totalCost: number;
  projectId: string;
  payment: string;
  transactionType: string;
  supplier: {
    address: string
    email: string
    id: string
    markup: string
    name: string
    notes: string
    phone: string
    supplierType: string
  };
}

export interface QuotationData {
  totalAmount: any
  id: string;
  projectId: number;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  projectManager: string;
  contactPerson: string;
  phone: string;
  clientId: string;
  materialMarkUp: string;
  status: string;
  SubTask: SubTask[];
  client: Client;
  user: User;
  Material: Material[];
  qutationGenerated: boolean
  documents: Document[]
  remainingAmount: number
  Invoice: Invoice[]
}

export interface Document {
  id: string,
  name: string,
  url: string,
  projectId: string
}
export interface Invoice {
  Amount: number
  InvoiceId: number
  clientId: string
  createdDate: string
  dueDate: string
  id: string
  projectId: string
  remarks: string
  status: string
  transactionType: string,
  client: Client,
  Project: QuotationData
}

export enum PROJECTSTATUS {
  ACTIVE,
  PENDING,
  APPROVED,
  COMPLETED,
  REJECTED,
}