import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Quote, Invoice, Session, TrainingModule, CompanySettings, QuoteStatus, InvoiceStatus, Certification } from '../types';
import { COMPANY_INFO, MOCK_CLIENTS, MOCK_QUOTES, MOCK_INVOICES, MOCK_SESSIONS, CATALOG, MOCK_CERTIFICATIONS } from '../constants';
import { db } from '../firebaseConfig';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore';

interface DataContextType {
  clients: Client[];
  quotes: Quote[];
  invoices: Invoice[];
  sessions: Session[];
  catalog: TrainingModule[];
  company: CompanySettings;
  certifications: Certification[];
  loading: boolean;
  
  // Actions
  addClient: (client: Client) => Promise<void>;
  updateClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addQuote: (quote: Quote) => Promise<void>;
  updateQuoteStatus: (id: string, status: QuoteStatus) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  
  addInvoice: (invoice: Invoice) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  createCreditNote: (invoiceId: string) => Promise<void>;
  
  addSession: (session: Session) => Promise<void>;
  updateSession: (session: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  
  addTraining: (training: TrainingModule) => Promise<void>;
  updateTraining: (training: TrainingModule) => Promise<void>;
  deleteTraining: (id: string) => Promise<void>;
  
  updateCompany: (settings: CompanySettings) => Promise<void>;
  seedDatabase: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [catalog, setCatalog] = useState<TrainingModule[]>([]);
  const [company, setCompany] = useState<CompanySettings>(COMPANY_INFO);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  // --- SYNCHRONISATION FIREBASE (REAL-TIME) ---

  useEffect(() => {
    // Helper pour gérer les erreurs de snapshot silencieusement
    const handleError = (source: string) => (error: any) => {
      console.error(`Erreur de synchronisation (${source}):`, error);
      if (error.code === 'permission-denied') {
        alert(`Erreur de permission Firebase (${source}). Vérifiez vos règles de sécurité dans la console Firebase.`);
      }
    };

    // 1. Clients
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      setClients(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    }, handleError('Clients'));

    // 2. Devis (Triés par date)
    const qQuotes = query(collection(db, 'quotes'), orderBy('date', 'desc'));
    const unsubQuotes = onSnapshot(qQuotes, (snapshot) => {
      setQuotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Quote)));
    }, handleError('Quotes'));

    // 3. Factures (Triées par date)
    const qInvoices = query(collection(db, 'invoices'), orderBy('date', 'desc'));
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      setInvoices(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
    }, handleError('Invoices'));

    // 4. Sessions
    const qSessions = query(collection(db, 'sessions'), orderBy('startDate', 'asc'));
    const unsubSessions = onSnapshot(qSessions, (snapshot) => {
      setSessions(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Session)));
    }, handleError('Sessions'));

    // 5. Catalogue
    const unsubCatalog = onSnapshot(collection(db, 'catalog'), (snapshot) => {
      setCatalog(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as TrainingModule)));
    }, handleError('Catalog'));

    // 6. Certifications (Simulées ou stockées, ici on va les stocker)
    const unsubCerts = onSnapshot(collection(db, 'certifications'), (snapshot) => {
      setCertifications(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Certification)));
    }, handleError('Certifications'));

    // 7. Company Settings (Document unique - Real-time)
    const docRef = doc(db, 'settings', 'company');
    const unsubCompany = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as CompanySettings;
        console.log("Settings loaded from Firebase:", data); // DEBUG
        setCompany(data);
      } else {
        console.log("Settings document not found, creating default..."); // DEBUG
        // Initialiser si n'existe pas (une seule fois)
        setDoc(docRef, COMPANY_INFO).catch(err => console.error("Init settings failed", err));
      }
      setLoading(false);
    }, (error) => {
      console.error("Erreur settings:", error);
      if (error.code === 'permission-denied') {
        alert("Erreur de permission pour les paramètres. Vérifiez vos règles Firebase.");
      }
      setLoading(false);
    });

    return () => {
      unsubClients();
      unsubQuotes();
      unsubInvoices();
      unsubSessions();
      unsubCatalog();
      unsubCerts();
      unsubCompany();
    };
  }, []);

  // --- ACTIONS (CRUD) ---

  // Clients
  const addClient = async (client: Client) => {
    const { id, ...data } = client;
    await addDoc(collection(db, 'clients'), data);
  };
  const updateClient = async (client: Client) => {
    const { id, ...data } = client;
    await updateDoc(doc(db, 'clients', id), data as any);
  };
  const deleteClient = async (id: string) => {
    await deleteDoc(doc(db, 'clients', id));
  };

  // Devis
  const addQuote = async (quote: Quote) => {
    const { id, ...data } = quote;
    await addDoc(collection(db, 'quotes'), data);
  };
  const updateQuoteStatus = async (id: string, status: QuoteStatus) => {
    await updateDoc(doc(db, 'quotes', id), { status });
  };
  const deleteQuote = async (id: string) => {
    await deleteDoc(doc(db, 'quotes', id));
  };

  // Factures
  const addInvoice = async (invoice: Invoice) => {
    const { id, ...data } = invoice;
    await addDoc(collection(db, 'invoices'), data);
  };
  const updateInvoiceStatus = async (id: string, status: InvoiceStatus) => {
    await updateDoc(doc(db, 'invoices', id), { status });
  };

  const createCreditNote = async (invoiceId: string) => {
    const originalInvoice = invoices.find(i => i.id === invoiceId);
    if (!originalInvoice) {
      console.error("Facture introuvable");
      return;
    }

    const exists = invoices.some(i => i.originalInvoiceId === invoiceId);
    if (exists) {
      alert("Un avoir existe déjà pour cette facture.");
      return;
    }

    let newNumber = originalInvoice.number.replace('FAC', 'AVR');
    if (newNumber === originalInvoice.number) {
      newNumber = `${originalInvoice.number}-AVR`;
    }

    const creditNoteData = {
      ...originalInvoice,
      number: newNumber,
      type: 'CREDIT_NOTE',
      originalInvoiceId: originalInvoice.id,
      originalInvoiceNumber: originalInvoice.number,
      date: new Date().toISOString().split('T')[0],
      status: InvoiceStatus.PAID,
    };
    
    const { id, ...dataToSend } = creditNoteData;

    await addDoc(collection(db, 'invoices'), dataToSend);
    alert(`Avoir ${newNumber} créé avec succès !`);
  };

  // Sessions
  const addSession = async (session: Session) => {
    const { id, ...data } = session;
    await addDoc(collection(db, 'sessions'), data);
  };
  const updateSession = async (session: Session) => {
    const { id, ...data } = session;
    await updateDoc(doc(db, 'sessions', id), data as any);
  };
  const deleteSession = async (id: string) => {
    await deleteDoc(doc(db, 'sessions', id));
  };

  // Catalogue
  const addTraining = async (training: TrainingModule) => {
    const { id, ...data } = training;
    await addDoc(collection(db, 'catalog'), data);
  };
  const updateTraining = async (training: TrainingModule) => {
    const { id, ...data } = training;
    await updateDoc(doc(db, 'catalog', id), data as any);
  };
  const deleteTraining = async (id: string) => {
    await deleteDoc(doc(db, 'catalog', id));
  };

  // Paramètres
  const updateCompany = async (settings: CompanySettings) => {
    console.log("Updating company settings in Firebase...", settings); // DEBUG
    try {
      await setDoc(doc(db, 'settings', 'company'), settings, { merge: true });
      console.log("Company settings updated successfully!"); // DEBUG
    } catch (error: any) {
      console.error("Failed to update company settings:", error); // DEBUG
      if (error.code === 'permission-denied') {
        alert("Erreur : Permission refusée. Vérifiez les règles Firebase.");
      } else {
        alert(`Erreur lors de la sauvegarde : ${error.message}`);
      }
      throw error;
    }
  };

  // SEED DATA
  const seedDatabase = async () => {
    const batch = writeBatch(db);

    // Clients
    MOCK_CLIENTS.forEach(c => {
      const { id, ...data } = c;
      const ref = doc(collection(db, 'clients'));
      batch.set(ref, data);
    });

    // Catalog
    CATALOG.forEach(c => {
      const { id, ...data } = c;
      const ref = doc(collection(db, 'catalog'));
      batch.set(ref, data);
    });

    // Quotes
    MOCK_QUOTES.forEach(c => {
      const { id, ...data } = c;
      const ref = doc(collection(db, 'quotes'));
      batch.set(ref, data);
    });

    // Invoices
    MOCK_INVOICES.forEach(c => {
      const { id, ...data } = c;
      const ref = doc(collection(db, 'invoices'));
      batch.set(ref, data);
    });

    // Sessions
    MOCK_SESSIONS.forEach(c => {
      const { id, ...data } = c;
      const ref = doc(collection(db, 'sessions'));
      batch.set(ref, data);
    });

    // Certifications
    MOCK_CERTIFICATIONS.forEach(c => {
      const { id, ...data } = c;
      const ref = doc(collection(db, 'certifications'));
      batch.set(ref, data);
    });

    // Settings (Company Info)
    const settingsRef = doc(db, 'settings', 'company');
    batch.set(settingsRef, COMPANY_INFO);

    await batch.commit();
    alert("Base de données initialisée avec les données de démo !");
  };

  return (
    <DataContext.Provider value={{
      clients, quotes, invoices, sessions, catalog, company, certifications, loading,
      addClient, updateClient, deleteClient,
      addQuote, updateQuoteStatus, deleteQuote,
      addInvoice, updateInvoiceStatus, createCreditNote,
      addSession, updateSession, deleteSession,
      addTraining, updateTraining, deleteTraining,
      updateCompany, seedDatabase
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
