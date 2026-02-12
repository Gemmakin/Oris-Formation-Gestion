export enum ClientStatus {
  PROSPECT = 'Prospect',
  CLIENT = 'Client',
  INACTIF = 'Inactif'
}

export interface Client {
  id: string;
  name: string; // Raison sociale
  siret: string;
  vatNumber: string; // TVA Intracom
  address: string;
  city: string;
  zip: string;
  contactName: string;
  email: string;
  phone: string;
  status: ClientStatus;
}

export enum TrainingCategory {
  HABILITATION = 'Habilitation Électrique',
  TST = 'Travaux Sous Tension',
  RESEAUX = 'Réseaux (BT/HTA)',
  INSTALLATION = 'Installations'
}

export interface TrainingModule {
  id: string;
  reference: string;
  title: string;
  category: TrainingCategory;
  durationDays: number;
  priceHt: number;
  description: string;
}

export enum QuoteStatus {
  DRAFT = 'Brouillon',
  SENT = 'Envoyé',
  ACCEPTED = 'Accepté',
  REJECTED = 'Refusé',
  EXPIRED = 'Expiré'
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number; // 0, 10, 20
}

export interface Quote {
  id: string;
  number: string; // e.g., DEV-2024-001
  clientId: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  items: QuoteLine[];
  notes: string;
  totalHt: number;
  totalVat: number;
  totalTtc: number;
}

export enum InvoiceStatus {
  PENDING = 'À payer',
  PAID = 'Payé',
  OVERDUE = 'En retard',
  CANCELLED = 'Annulé' // Gardé pour historique, mais l'avoir est la méthode légale
}

export type InvoiceType = 'INVOICE' | 'CREDIT_NOTE';

export interface Invoice {
  id: string;
  number: string; // e.g., FAC-2024-001 ou AVR-2024-001
  type: InvoiceType;
  quoteId?: string;
  originalInvoiceId?: string; // Pour les avoirs : ID de la facture annulée
  originalInvoiceNumber?: string; // Pour les avoirs : Numéro de la facture annulée
  clientId: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  items: QuoteLine[];
  totalHt: number;
  totalVat: number;
  totalTtc: number;
}

export interface Trainee {
  id: string;
  name: string; // Prénom Nom
}

export interface Session {
  id: string;
  trainingId: string;
  clientId: string;
  startDate: string;
  endDate: string;
  trainer: string;
  traineesCount: number;
  trainees: Trainee[];
  location: string;
}

export interface Certification {
  id: string;
  traineeName: string;
  companyName: string;
  level: string; // ex: B2V, BC
  expiryDate: string;
}

export interface CompanySettings {
  name: string;
  address: string;
  zip: string;
  city: string;
  siret: string;
  vat: string;
  phone: string;
  email: string;
  iban: string;
  bic: string;
  logoUrl?: string; // Base64 string or URL
}
