import { Client, ClientStatus, TrainingCategory, TrainingModule, Quote, QuoteStatus, Invoice, InvoiceStatus, Session, Certification } from './types';

export const COMPANY_INFO = {
  name: "ORIS FORMATION",
  address: "12 Rue de l'Énergie",
  zip: "69000",
  city: "Lyon",
  siret: "123 456 789 00012",
  vat: "FR 12 123456789",
  phone: "04 78 00 00 00",
  email: "contact@oris-formation.fr",
  iban: "FR76 1234 5678 9012 3456 7890 123",
  bic: "ORISFR2L"
};

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'IRTEC Réseaux',
    siret: '987 654 321 00045',
    vatNumber: 'FR 88 987654321',
    address: '45 Avenue des Transformateurs',
    city: 'Grenoble',
    zip: '38000',
    contactName: 'Jean Dupont',
    email: 'j.dupont@irtec-reseaux.fr',
    phone: '06 12 34 56 78',
    status: ClientStatus.CLIENT
  },
  {
    id: 'c2',
    name: 'ElecPro Solutions',
    siret: '456 123 789 00011',
    vatNumber: 'FR 44 456123789',
    address: '12 ZI Nord',
    city: 'Villeurbanne',
    zip: '69100',
    contactName: 'Marie Martin',
    email: 'm.martin@elecpro.com',
    phone: '04 72 00 00 00',
    status: ClientStatus.PROSPECT
  }
];

export const CATALOG: TrainingModule[] = [
  {
    id: 't1',
    reference: 'HAB-B2V',
    title: 'Habilitation Électrique BR/B2V/BC',
    category: TrainingCategory.HABILITATION,
    durationDays: 3,
    priceHt: 850,
    description: 'Habilitation pour chargé d\'intervention et chargé de consignation en basse tension.'
  },
  {
    id: 't2',
    reference: 'TST-BAT',
    title: 'TST Module de Base (Batteries)',
    category: TrainingCategory.TST,
    durationDays: 2,
    priceHt: 1200,
    description: 'Travaux Sous Tension sur batteries d\'accumulateurs stationnaires.'
  },
  {
    id: 't3',
    reference: 'RES-HTA',
    title: 'Confection d\'accessoires HTA',
    category: TrainingCategory.RESEAUX,
    durationDays: 4,
    priceHt: 1600,
    description: 'Raccordement de câbles HTA synthétiques (jonctions, extrémités).'
  }
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'q1',
    number: 'DEV-2024-042',
    clientId: 'c1',
    date: '2024-05-10',
    validUntil: '2024-06-10',
    status: QuoteStatus.SENT,
    items: [
      { id: 'qi1', description: 'Formation Habilitation BR/B2V/BC (6 stagiaires)', quantity: 1, unitPrice: 2500, vatRate: 20 },
      { id: 'qi2', description: 'Frais de déplacement (Forfait)', quantity: 1, unitPrice: 150, vatRate: 20 }
    ],
    notes: 'Formation prévue sur site client.',
    totalHt: 2650,
    totalVat: 530,
    totalTtc: 3180
  },
  {
    id: 'q2',
    number: 'DEV-2024-045',
    clientId: 'c2',
    date: '2024-05-12',
    validUntil: '2024-06-12',
    status: QuoteStatus.DRAFT,
    items: [
      { id: 'qi3', description: 'Formation TST Module Base', quantity: 2, unitPrice: 1200, vatRate: 20 }
    ],
    notes: '',
    totalHt: 2400,
    totalVat: 480,
    totalTtc: 2880
  }
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'i1',
    number: 'FAC-2024-001',
    type: 'INVOICE',
    clientId: 'c1',
    date: '2024-04-01',
    dueDate: '2024-05-01',
    status: InvoiceStatus.PAID,
    items: [
      { id: 'ii1', description: 'Acompte 30% - Formation HTA', quantity: 1, unitPrice: 600, vatRate: 20 }
    ],
    totalHt: 600,
    totalVat: 120,
    totalTtc: 720
  },
  {
    id: 'i2',
    number: 'FAC-2024-002',
    type: 'INVOICE',
    clientId: 'c2',
    date: '2024-04-15',
    dueDate: '2024-05-15',
    status: InvoiceStatus.OVERDUE,
    items: [
      { id: 'ii2', description: 'Formation TST', quantity: 1, unitPrice: 1200, vatRate: 20 }
    ],
    totalHt: 1200,
    totalVat: 240,
    totalTtc: 1440
  }
];

export const MOCK_SESSIONS: Session[] = [
  {
    id: 's1',
    trainingId: 't1',
    clientId: 'c1',
    startDate: '2024-06-10',
    endDate: '2024-06-12',
    trainer: 'Philippe Formateur',
    traineesCount: 6,
    trainees: [
      { id: 'tr1', name: 'Thomas Durand' },
      { id: 'tr2', name: 'Sophie Martin' },
      { id: 'tr3', name: 'Lucas Bernard' }
    ],
    location: 'Grenoble (Site Client)'
  }
];

export const MOCK_CERTIFICATIONS: Certification[] = [
  { id: 'cert1', traineeName: 'Marc Voisin', companyName: 'IRTEC Réseaux', level: 'B2V', expiryDate: '2024-06-15' },
  { id: 'cert2', traineeName: 'Julie Dubois', companyName: 'ElecPro Solutions', level: 'BC', expiryDate: '2024-07-01' },
  { id: 'cert3', traineeName: 'Paul Richard', companyName: 'IRTEC Réseaux', level: 'TST-BAT', expiryDate: '2024-05-20' },
];
