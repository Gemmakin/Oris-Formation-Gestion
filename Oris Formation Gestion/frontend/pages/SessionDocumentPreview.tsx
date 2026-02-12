import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Printer, Download, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '../components/ui';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function SessionDocumentPreview() {
  const { id, type } = useParams<{ id: string; type: 'attendance' | 'certificate' }>();
  const navigate = useNavigate();
  const { sessions, clients, catalog, company } = useData();
  const [isDownloading, setIsDownloading] = useState(false);

  const session = sessions.find(s => s.id === id);
  const client = session ? clients.find(c => c.id === session.clientId) : null;
  const training = session ? catalog.find(t => t.id === session.trainingId) : null;

  useEffect(() => {
    if (session && training) {
      const docType = type === 'attendance' ? 'EMARGEMENT' : 'ATTESTATIONS';
      window.document.title = `${docType}_${training.reference}_${session.startDate}`;
    }
    return () => {
      window.document.title = 'ORIS FORMATION - Gestion';
    };
  }, [session, training, type]);

  if (!session || !client || !training) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 bg-slate-50">
      <p className="text-slate-500">Session introuvable</p>
      <Button onClick={() => navigate('/sessions')} variant="secondary">Retour</Button>
    </div>
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    const element = document.getElementById('document-content');
    if (!element) {
      alert("Erreur: Impossible de trouver le contenu du document à générer.");
      return;
    }

    setIsDownloading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 210 * 3.7795275591,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // If height exceeds A4, we might need multiple pages, but for now simple scaling
      // For certificates (multiple pages), standard print is better, but here is a simple implementation
      if (imgHeight > 297) {
         // For long documents like multiple certificates, we rely on browser print to PDF for best multi-page support
         // But we can try to add image.
         // A better approach for multi-page HTML to PDF in JS is complex.
         // We will fallback to alerting user for multi-page docs if using this button.
         if (type === 'certificate') {
             alert("Pour les attestations multiples, veuillez utiliser le bouton 'Imprimer' puis choisir 'Enregistrer au format PDF' pour un meilleur résultat.");
             setIsDownloading(false);
             return;
         }
      }

      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${type === 'attendance' ? 'Emargement' : 'Attestations'}-${training.reference}.pdf`);
    } catch (error) {
      console.error("Erreur PDF", error);
      alert("Erreur lors de la génération. Utilisez le bouton Imprimer.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to generate dates between start and end
  const getSessionDates = () => {
    const dates = [];
    const currDate = new Date(session.startDate);
    const lastDate = new Date(session.endDate);
    while (currDate <= lastDate) {
      dates.push(new Date(currDate));
      currDate.setDate(currDate.getDate() + 1);
    }
    return dates;
  };

  const sessionDates = getSessionDates();

  return (
    <div className="min-h-screen bg-slate-800 py-8 px-4 flex flex-col items-center print:p-0 print:bg-white">
      
      {/* Toolbar */}
      <div className="w-full max-w-[210mm] mb-6 flex justify-between items-center print:hidden">
        <Button variant="secondary" className="text-white bg-slate-700 border-slate-600 hover:bg-slate-600" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" className="text-white bg-slate-700 border-slate-600 hover:bg-slate-600" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Imprimer
          </Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-500" disabled={isDownloading}>
            {isDownloading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Télécharger PDF
          </Button>
        </div>
      </div>

      {/* Document Container */}
      <div id="document-content" className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:m-0 relative text-slate-800">
        
        {/* --- FEUILLE D'ÉMARGEMENT --- */}
        {type === 'attendance' && (
          <div className="p-[15mm] h-full flex flex-col">
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
              <h1 className="text-2xl font-bold uppercase text-slate-900">Feuille d'Émargement</h1>
              <p className="text-slate-500 mt-1">{company.name}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 text-sm border border-slate-300 p-4 rounded">
              <div>
                <p><span className="font-bold">Formation :</span> {training.title}</p>
                <p><span className="font-bold">Lieu :</span> {session.location}</p>
                <p><span className="font-bold">Formateur :</span> {session.trainer}</p>
              </div>
              <div>
                <p><span className="font-bold">Client :</span> {client.name}</p>
                <p><span className="font-bold">Dates :</span> Du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}</p>
                <p><span className="font-bold">Durée :</span> {training.durationDays * 7} heures</p>
              </div>
            </div>

            <table className="w-full border-collapse border border-slate-400 text-xs">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-400 p-2 w-1/4">Stagiaire</th>
                  {sessionDates.map((date, i) => (
                    <th key={i} className="border border-slate-400 p-2 text-center" colSpan={2}>
                      {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </th>
                  ))}
                </tr>
                <tr className="bg-slate-50">
                  <th className="border border-slate-400 p-1">Nom Prénom</th>
                  {sessionDates.map((_, i) => (
                    <React.Fragment key={i}>
                      <th className="border border-slate-400 p-1 w-16 text-[10px]">Matin</th>
                      <th className="border border-slate-400 p-1 w-16 text-[10px]">Après-midi</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(session.trainees || []).map((trainee) => (
                  <tr key={trainee.id}>
                    <td className="border border-slate-400 p-3 font-medium">{trainee.name}</td>
                    {sessionDates.map((_, i) => (
                      <React.Fragment key={i}>
                        <td className="border border-slate-400 p-1"></td>
                        <td className="border border-slate-400 p-1"></td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
                {/* Empty rows if few trainees */}
                {Array.from({ length: Math.max(0, 10 - (session.trainees?.length || 0)) }).map((_, idx) => (
                  <tr key={`empty-${idx}`}>
                    <td className="border border-slate-400 p-4"></td>
                    {sessionDates.map((_, i) => (
                      <React.Fragment key={i}>
                        <td className="border border-slate-400 p-1"></td>
                        <td className="border border-slate-400 p-1"></td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-auto pt-8">
              <div className="flex justify-between text-sm">
                <div className="w-1/3 border border-slate-300 h-32 p-2">
                  <p className="font-bold underline mb-2">Signature du Formateur :</p>
                </div>
                <div className="w-1/3 border border-slate-300 h-32 p-2">
                  <p className="font-bold underline mb-2">Cachet de l'entreprise :</p>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-4">
                {company.name} - SIRET {company.siret} - Organisme de formation enregistré.
              </p>
            </div>
          </div>
        )}

        {/* --- ATTESTATIONS --- */}
        {type === 'certificate' && (
          <div className="print:block">
            {(session.trainees && session.trainees.length > 0) ? (
              session.trainees.map((trainee, index) => (
                <div key={trainee.id} className={`p-[20mm] h-[297mm] flex flex-col relative ${index < (session.trainees?.length || 0) - 1 ? 'break-after-page' : ''}`} style={{ pageBreakAfter: 'always' }}>
                  
                  {/* Border Decoration */}
                  <div className="absolute inset-[10mm] border-4 border-double border-blue-900 pointer-events-none"></div>

                  <div className="text-center mt-12 mb-16">
                    <h1 className="text-4xl font-serif font-bold text-blue-900 uppercase tracking-widest mb-4">Attestation</h1>
                    <h2 className="text-xl text-slate-600 uppercase tracking-wide">De Fin de Formation</h2>
                  </div>

                  <div className="flex-grow space-y-8 text-center px-8">
                    <p className="text-lg text-slate-700">Je soussigné, représentant légal de l'organisme de formation :</p>
                    <p className="text-2xl font-bold text-slate-900">{company.name}</p>
                    
                    <p className="text-lg text-slate-700 mt-8">Certifie que le stagiaire :</p>
                    <p className="text-3xl font-serif font-bold text-blue-800 italic border-b border-slate-300 inline-block pb-2 px-8">{trainee.name}</p>

                    <p className="text-lg text-slate-700 mt-8">A suivi avec assiduité l'action de formation suivante :</p>
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mx-auto max-w-2xl">
                      <p className="text-xl font-bold text-blue-900 mb-2">{training.title}</p>
                      <p className="text-slate-600">Du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}</p>
                      <p className="text-slate-600">Durée : {training.durationDays * 7} heures</p>
                    </div>

                    <p className="text-lg text-slate-700 mt-8">Nature de l'action : Action de formation (L.6313-1 du Code du travail).</p>
                    <p className="text-lg text-slate-700">Les objectifs définis au programme ont été atteints.</p>
                  </div>

                  <div className="mt-16 mb-12 flex justify-end px-12">
                    <div className="text-center">
                      <p className="text-sm text-slate-500 mb-2">Fait à {company.city}, le {new Date(session.endDate).toLocaleDateString()}</p>
                      <div className="h-24 w-48 border-b border-slate-300 flex items-end justify-center pb-2">
                        <span className="text-xs text-slate-400">Signature et Cachet</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400">
                    <p>{company.name} - {company.address} {company.zip} {company.city}</p>
                    <p>SIRET {company.siret} - Déclaration d'activité enregistrée.</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-slate-500">Aucun stagiaire enregistré pour cette session.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
