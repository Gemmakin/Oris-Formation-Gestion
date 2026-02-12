import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Printer, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { Button, Card, Input, Label, Badge } from '../components/ui';
import { useData } from '../context/DataContext';
import { Quote, QuoteStatus, QuoteLine, InvoiceStatus } from '../types';

export function QuoteList() {
  const { quotes, clients, updateQuoteStatus, deleteQuote, addInvoice } = useData();
  const navigate = useNavigate();

  const handleConvertToInvoice = (quote: Quote) => {
    const newInvoice = {
      id: Math.random().toString(36).substr(2, 9),
      number: quote.number.replace('DEV', 'FAC'),
      quoteId: quote.id,
      clientId: quote.clientId,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: InvoiceStatus.PENDING,
      items: quote.items,
      totalHt: quote.totalHt,
      totalVat: quote.totalVat,
      totalTtc: quote.totalTtc
    };
    addInvoice(newInvoice);
    updateQuoteStatus(quote.id, QuoteStatus.ACCEPTED);
    navigate('/invoices');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Devis</h1>
          <p className="text-slate-500 mt-1">Gérez vos propositions commerciales.</p>
        </div>
        <Link to="/quotes/new">
          <Button><Plus className="w-4 h-4 mr-2" /> Nouveau Devis</Button>
        </Link>
      </div>

      <Card className="overflow-hidden border border-slate-100 shadow-lg shadow-slate-200/50">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Numéro</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Client</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Date</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Montant TTC</th>
              <th className="px-6 py-4 uppercase text-xs tracking-wider">Statut</th>
              <th className="px-6 py-4 text-right uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {quotes.map((quote) => {
              const client = clients.find(c => c.id === quote.clientId);
              return (
                <tr key={quote.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{quote.number}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{client?.name || 'Client inconnu'}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(quote.date).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{quote.totalTtc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="px-6 py-4">
                    <Badge color={quote.status === QuoteStatus.ACCEPTED ? 'green' : quote.status === QuoteStatus.SENT ? 'blue' : quote.status === QuoteStatus.REJECTED ? 'red' : 'gray'}>
                      {quote.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to={`/quotes/${quote.id}/print`}>
                      <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600" title="Imprimer / Télécharger"><Printer className="w-4 h-4" /></Button>
                    </Link>
                    
                    {quote.status === QuoteStatus.SENT && (
                      <>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-green-600 hover:bg-green-50" title="Accepter" onClick={() => updateQuoteStatus(quote.id, QuoteStatus.ACCEPTED)}>
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50" title="Refuser" onClick={() => updateQuoteStatus(quote.id, QuoteStatus.REJECTED)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {quote.status === QuoteStatus.ACCEPTED && (
                      <Button variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50" title="Convertir en Facture" onClick={() => handleConvertToInvoice(quote)}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}

                    <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteQuote(quote.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

export function QuoteBuilder() {
  const navigate = useNavigate();
  const { clients, catalog, addQuote } = useData();
  
  const [clientId, setClientId] = useState('');
  const [items, setItems] = useState<QuoteLine[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [validUntil, setValidUntil] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const addItem = () => {
    const newItem: QuoteLine = {
      id: Math.random().toString(36).substr(2, 9),
      description: '',
      quantity: 1,
      unitPrice: 0,
      vatRate: 20
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof QuoteLine, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'description') {
           const catalogItem = catalog.find(c => c.title === value);
           if (catalogItem) {
             updated.unitPrice = catalogItem.priceHt;
             updated.description = catalogItem.title;
           }
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateTotals = () => {
    const totalHt = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const totalVat = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice * (item.vatRate / 100)), 0);
    return { ht: totalHt, vat: totalVat, ttc: totalHt + totalVat };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    if (!clientId) return alert("Veuillez sélectionner un client");
    if (items.length === 0) return alert("Veuillez ajouter au moins une ligne");

    const newQuote: Quote = {
      id: Math.random().toString(36).substr(2, 9),
      number: `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      clientId,
      date,
      validUntil,
      status: QuoteStatus.SENT,
      items,
      notes: '',
      totalHt: totals.ht,
      totalVat: totals.vat,
      totalTtc: totals.ttc
    };

    addQuote(newQuote);
    navigate('/quotes');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Nouveau Devis</h1>
          <p className="text-slate-500 mt-1">Création d'une proposition commerciale.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/quotes')}>Annuler</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label>Client</Label>
                <select 
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date d'émission</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Validité</Label>
                  <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900">Lignes du devis</h3>
                <Button variant="outline" size="sm" onClick={addItem} type="button"><Plus className="w-4 h-4 mr-2" /> Ajouter ligne</Button>
              </div>

              {items.length === 0 && (
                <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                  <p>Aucune ligne. Ajoutez une formation ou des frais.</p>
                </div>
              )}

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 gap-4 items-start bg-slate-50/30 p-4 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="col-span-5">
                    <Label className="text-[10px] mb-1">Description</Label>
                    <input 
                      list="catalog-options"
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Ex: Habilitation B2V..."
                    />
                    <datalist id="catalog-options">
                      {catalog.map(c => <option key={c.id} value={c.title} />)}
                    </datalist>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] mb-1">Qté</Label>
                    <Input className="h-9" type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] mb-1">Prix U. HT</Label>
                    <Input className="h-9" type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-[10px] mb-1">TVA</Label>
                    <select 
                      className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-1 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={item.vatRate}
                      onChange={(e) => updateItem(item.id, 'vatRate', parseFloat(e.target.value))}
                    >
                      <option value="20">20%</option>
                      <option value="10">10%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-end pt-6">
                    <button className="text-slate-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50" onClick={() => removeItem(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-slate-900 text-white border-slate-800 shadow-xl shadow-slate-900/20">
            <h3 className="font-bold text-lg mb-6">Récapitulatif</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-slate-400 text-sm">
                <span>Total HT</span>
                <span>{totals.ht.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-slate-400 text-sm">
                <span>TVA</span>
                <span>{totals.vat.toFixed(2)} €</span>
              </div>
              <div className="h-px bg-slate-800 my-2"></div>
              <div className="flex justify-between text-2xl font-bold text-white">
                <span>Total TTC</span>
                <span>{totals.ttc.toFixed(2)} €</span>
              </div>
            </div>
            <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white border-none h-12 text-base shadow-lg shadow-blue-900/50" onClick={handleSave}>
              Valider et Créer
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
