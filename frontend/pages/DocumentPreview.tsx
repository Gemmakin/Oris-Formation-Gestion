import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Printer, Download, ArrowLeft, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '../components/ui';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DocumentPreview() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { quotes, invoices, clients, company } = useData();
  const [isDownloading, setIsDownloading] = useState(false);

  const isInvoice = location.pathname.includes('invoices');
  
  const docData = isInvoice 
    ? invoices.find(i => i.id === id) 
    : quotes.find(q => q.id === id);
    
  const client = docData ? clients.find(c => c.id === docData.clientId) : null;
  const isCreditNote = isInvoice && docData && 'type' in docData && docData.type === 'CREDIT_NOTE';

  // Change page title for cleaner filename when saving as PDF via Print Dialog
  useEffect(() => {
    if (docData) {
      const typeLabel = isCreditNote ? 'AVOIR' : isInvoice ? 'FACTURE' : 'DEVIS';
      window.document.title = `${typeLabel}_${docData.number}_${client?.name || 'Client'}`;
    }
    return () => {
      window.document.title = 'ORIS FORMATION - Gestion';
    };
  }, [docData, isInvoice, client, isCreditNote]);

  if (!docData || !client) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50">
      <p className="text-slate-500">Document introuvable</p>
      <Button onClick={() => navigate(isInvoice ? '/invoices' : '/quotes')} variant="secondary">Retour</Button>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('document-content');
    if (!element) return;

    setIsDownloading(true);

    try {
      // Wait a bit for any rendering to finish
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 210 * 3.7795275591, // A4 width in pixels (approx)
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      const typeLabel = isCreditNote ? 'Avoir' : isInvoice ? 'Facture' : 'Devis';
      pdf.save(`${typeLabel}-${docData.number}.pdf`);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      alert("Une erreur est survenue lors de la génération du PDF. Veuillez essayer l'option 'Imprimer' > 'Enregistrer au format PDF'.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBack = () => {
    navigate(isInvoice ? '/invoices' : '/quotes');
  };

  return (
    <div className="min-h-screen bg-slate-800 py-8 px-4 flex flex-col items-center print:p-0 print:bg-white">
      
      {/* Toolbar (Hidden in Print) */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center print:hidden">
        <Button variant="secondary" className="text-white bg-slate-700 border-slate-600 hover:bg-slate-600" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" className="text-white bg-slate-700 border-slate-600 hover:bg-slate-600" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-500" disabled={isDownloading}>
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Génération...' : 'Télécharger PDF'}
          </Button>
        </div>
      </div>

      {/* A4 Page Container */}
      <div 
        id="document-content"
        className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:m-0 relative text-slate-800 overflow-hidden"
      >
        
        {/* Decorative Top Bar */}
        <div className={`h-2 w-full ${isCreditNote ? 'bg-purple-600' : 'bg-blue-600'}`}></div>

        <div className="p-[15mm] pb-[20mm] flex flex-col h-full min-h-[290mm]">
          
          {/* Header Section */}
          <header className="flex justify-between items-start mb-12">
            <div className="w-1/2">
              <div className="flex items-center gap-3 mb-4">
                {company.logoUrl ? (
                  <img src={company.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />
                ) : (
                  <div className={`w-12 h-12 text-white rounded-lg flex items-center justify-center font-bold text-2xl ${isCreditNote ? 'bg-purple-600' : 'bg-blue-600'}`}>O</div>
                )}
                <div>
                  <h1 className="font-bold text-xl leading-none tracking-tight text-slate-900">{company.name}</h1>
                  <span className="text-xs text-slate-500 font-medium tracking-wider uppercase">Formation</span>
                </div>
              </div>
              <div className="text-sm text-slate-500 space-y-1">
                <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> {company.address}, {company.zip} {company.city}</div>
                <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {company.phone}</div>
                <div className="flex items-center gap-2"><Mail className="w-3 h-3" /> {company.email}</div>
              </div>
            </div>

            <div className="w-1/2 text-right">
              <div className="inline-block bg-slate-50 px-6 py-3 rounded-lg border border-slate-100 mb-4">
                <h2 className={`text-2xl font-bold uppercase tracking-wide ${isCreditNote ? 'text-purple-900' : 'text-blue-900'}`}>
                  {isCreditNote ? 'AVOIR' : isInvoice ? 'FACTURE' : 'DEVIS'}
                </h2>
                <p className="text-slate-500 font-mono text-sm mt-1">{docData.number}</p>
              </div>
              <div className="text-sm space-y-1">
                <p><span className="text-slate-400">Date d'émission :</span> <span className="font-medium">{new Date(docData.date).toLocaleDateString('fr-FR')}</span></p>
                {!isInvoice && 'validUntil' in docData && (
                  <p><span className="text-slate-400">Valable jusqu'au :</span> <span className="font-medium">{new Date(docData.validUntil).toLocaleDateString('fr-FR')}</span></p>
                )}
                {/* Date d'échéance supprimée pour les factures */}
                {isCreditNote && 'originalInvoiceNumber' in docData && (
                  <p className="text-purple-600 font-medium mt-2">Annule la facture N° {docData.originalInvoiceNumber}</p>
                )}
              </div>
            </div>
          </header>

          {/* Addresses Section */}
          <section className="flex justify-end mb-16">
            <div className="w-[45%]">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-wider">Facturer à</p>
              <div className={`bg-slate-50 p-5 rounded-lg border-l-4 ${isCreditNote ? 'border-purple-600' : 'border-blue-600'}`}>
                <h3 className="font-bold text-lg text-slate-900 mb-1">{client.name}</h3>
                <p className="text-slate-600 text-sm whitespace-pre-line">{client.address}</p>
                <p className="text-slate-600 text-sm">{client.zip} {client.city}</p>
                {client.vatNumber && <p className="text-xs text-slate-400 mt-3">TVA: {client.vatNumber}</p>}
                <p className={`text-sm mt-2 font-medium ${isCreditNote ? 'text-purple-600' : 'text-blue-600'}`}>{client.contactName}</p>
              </div>
            </div>
          </section>

          {/* Items Table */}
          <section className="mb-8 flex-grow">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-slate-900">
                  <th className="py-3 text-left text-xs font-bold text-slate-900 uppercase tracking-wider w-[50%]">Désignation</th>
                  <th className="py-3 text-center text-xs font-bold text-slate-900 uppercase tracking-wider">Qté</th>
                  <th className="py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">Prix U. HT</th>
                  <th className="py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">TVA</th>
                  <th className="py-3 text-right text-xs font-bold text-slate-900 uppercase tracking-wider">Total HT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docData.items.map((item) => (
                  <tr key={item.id} className="group">
                    <td className="py-4 pr-4 align-top">
                      <p className="font-semibold text-slate-800 text-sm">{item.description}</p>
                      <p className="text-xs text-slate-500 mt-1">Formation professionnelle continue</p>
                    </td>
                    <td className="py-4 text-center align-top text-sm text-slate-600">{item.quantity}</td>
                    <td className="py-4 text-right align-top text-sm text-slate-600">{item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                    <td className="py-4 text-right align-top text-sm text-slate-400">{item.vatRate}%</td>
                    <td className="py-4 text-right align-top font-medium text-slate-900 text-sm">{(item.quantity * item.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Footer Section: Bank & Totals */}
          <section className="flex justify-between items-end border-t border-slate-200 pt-8 mb-12 break-inside-avoid">
            
            {/* Bank Details (Left) */}
            <div className="w-[45%]">
              {isInvoice ? (
                <div className="bg-slate-50 p-4 rounded border border-slate-100 text-xs">
                  <p className="font-bold text-slate-700 mb-2 uppercase">Coordonnées Bancaires</p>
                  <div className="grid grid-cols-[60px_1fr] gap-y-1 text-slate-600">
                    <span className="font-medium">Banque</span>
                    <span>LCL</span>
                    <span className="font-medium">IBAN</span>
                    <span className="font-mono">{company.iban}</span>
                    <span className="font-medium">BIC</span>
                    <span className="font-mono">{company.bic}</span>
                  </div>
                  <p className="mt-3 text-slate-400 italic">Merci d'indiquer le n° de {isCreditNote ? "l'avoir" : "facture"} en référence de virement.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded p-4 h-32 flex flex-col justify-between">
                  <p className="text-xs font-bold text-slate-900 uppercase">Bon pour accord</p>
                  <div className="flex justify-between items-end text-xs text-slate-400">
                    <span>Date : _________________</span>
                    <span>Signature :</span>
                  </div>
                </div>
              )}
            </div>

            {/* Totals (Right) */}
            <div className="w-[40%]">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total HT</span>
                  <span className="font-medium">{docData.totalHt.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Total TVA</span>
                  <span className="font-medium">{docData.totalVat.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                </div>
                <div className="h-px bg-slate-200 my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-900 uppercase">
                    {isCreditNote ? 'Net à déduire' : 'Net à payer'}
                  </span>
                  <span className={`text-2xl font-bold ${isCreditNote ? 'text-purple-600' : 'text-blue-600'}`}>
                    {docData.totalTtc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Legal Footer */}
          <footer className="mt-auto pt-6 border-t border-slate-100 text-center text-[10px] text-slate-400 leading-relaxed">
            <p className="font-medium text-slate-500 mb-1">{company.name} — Organisme de formation professionnelle</p>
            <p>SIRET : {company.siret} — TVA Intracommunautaire : {company.vat}</p>
            <p>Siège social : {company.address}, {company.zip} {company.city}</p>
            <p>Déclaration d'activité enregistrée sous le numéro XX XX XXXXX XX auprès du préfet de région. Cet enregistrement ne vaut pas agrément de l'État.</p>
          </footer>

        </div>
      </div>
    </div>
  );
}
