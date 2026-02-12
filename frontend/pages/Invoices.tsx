import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, CheckCircle, AlertCircle, Undo2 } from 'lucide-react';
import { Button, Card, Badge, Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import { InvoiceStatus } from '../types';

export default function Invoices() {
  const { invoices, clients, updateInvoiceStatus, createCreditNote } = useData();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const promptCreateCreditNote = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedInvoiceId(id);
    setIsConfirmOpen(true);
  };

  const confirmCreateCreditNote = () => {
    if (selectedInvoiceId) {
      createCreditNote(selectedInvoiceId);
      setIsConfirmOpen(false);
      setSelectedInvoiceId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Factures & Avoirs</h1>
          <p className="text-slate-500">Suivi de la facturation et des paiements.</p>
        </div>
      </div>

      <Card className="overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/50">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Numéro</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Type</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Client</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Date</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Échéance</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Montant TTC</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {invoices.map((invoice) => {
              const client = clients.find(c => c.id === invoice.clientId);
              const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== InvoiceStatus.PAID && invoice.type === 'INVOICE';
              const isCreditNote = invoice.type === 'CREDIT_NOTE';
              
              // Check if this invoice already has a credit note
              const hasCreditNote = invoices.some(i => i.originalInvoiceId === invoice.id);
              
              return (
                <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{invoice.number}</td>
                  <td className="px-6 py-4">
                    {isCreditNote ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                        Avoir
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Facture
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{client?.name || 'Client inconnu'}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(invoice.date).toLocaleDateString('fr-FR')}</td>
                  <td className={`px-6 py-4 ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-500'}`}>
                    {isCreditNote ? '-' : new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className={`px-6 py-4 font-mono font-medium ${isCreditNote ? 'text-purple-700' : 'text-slate-900'}`}>
                    {isCreditNote ? '- ' : ''}{invoice.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={invoice.status === InvoiceStatus.PAID ? 'green' : invoice.status === InvoiceStatus.OVERDUE ? 'red' : 'yellow'}>
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
                    <Link to={`/invoices/${invoice.id}/print`}>
                      <Button type="button" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" title="Imprimer / Télécharger">
                        <Printer className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    {!isCreditNote && invoice.status !== InvoiceStatus.PAID && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" 
                        title="Marquer comme payé" 
                        onClick={() => updateInvoiceStatus(invoice.id, InvoiceStatus.PAID)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {!isCreditNote && !hasCreditNote && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-purple-600 hover:bg-purple-50" 
                        title="Créer un avoir (Annuler)" 
                        onClick={(e) => promptCreateCreditNote(e, invoice.id)}
                      >
                        <Undo2 className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {isOverdue && (
                      <Button type="button" variant="ghost" className="h-8 w-8 p-0 text-orange-600 hover:bg-orange-50" title="Relancer">
                        <AlertCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} title="Création d'un Avoir">
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex gap-3">
            <AlertCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
            <div className="text-sm text-purple-800">
              <p className="font-semibold mb-1">Attention, action irréversible</p>
              <p>Vous êtes sur le point de créer un avoir pour annuler cette facture.</p>
              <ul className="list-disc list-inside mt-2 space-y-1 opacity-90">
                <li>Une nouvelle facture négative (Avoir) sera générée.</li>
                <li>La facture originale restera dans l'historique.</li>
                <li>Le solde du client sera ajusté.</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setIsConfirmOpen(false)}>Annuler</Button>
            <Button onClick={confirmCreateCreditNote} className="bg-purple-600 hover:bg-purple-700 text-white">
              Confirmer et Créer l'Avoir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
