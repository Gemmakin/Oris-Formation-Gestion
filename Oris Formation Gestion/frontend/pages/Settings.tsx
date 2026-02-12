import React, { useState, useRef, useEffect } from 'react';
import { Button, Card, Input, Label } from '../components/ui';
import { useData } from '../context/DataContext';
import { Save, Upload, X, Loader2 } from 'lucide-react';

export default function Settings() {
  const { company, updateCompany } = useData();
  const [formData, setFormData] = useState(company);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with context when company data loads from Firebase
  useEffect(() => {
    if (company) {
      setFormData(prev => ({
        ...prev,
        ...company // Merge to keep local changes if any, but prefer DB source of truth
      }));
    }
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateCompany(formData);
      alert("Paramètres enregistrés avec succès !");
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de l'enregistrement. Vérifiez votre connexion.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 500KB for Firestore storage safety)
      if (file.size > 500 * 1024) {
        alert("L'image est trop volumineuse. Elle sera compressée automatiquement.");
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize image to max 400px width/height to save space
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 400;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG 0.7 quality
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setFormData(prev => ({ ...prev, logoUrl: dataUrl }));
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Paramètres Entreprise</h1>
          <p className="text-slate-500">Ces informations apparaissent sur vos devis et factures.</p>
        </div>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Logo Section */}
          <div className="border-b border-slate-100 pb-8">
            <h3 className="font-semibold text-slate-900 mb-4">Logo de l'entreprise</h3>
            <div className="flex items-start gap-6">
              <div className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative group">
                {formData.logoUrl ? (
                  <>
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button type="button" onClick={removeLogo} className="text-white hover:text-red-400">
                        <X className="w-8 h-8" />
                      </button>
                    </div>
                  </>
                ) : (
                  <span className="text-slate-400 text-xs text-center px-2">Aucun logo</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500 mb-3">
                  Ce logo apparaîtra sur vos documents PDF (Devis, Factures) et dans la barre latérale.
                  <br />Format recommandé : PNG ou JPG, fond transparent.
                </p>
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Télécharger un logo
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleLogoUpload} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <Label>Nom de l'entreprise</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Adresse</Label>
              <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            <div>
              <Label>Code Postal</Label>
              <Input value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
            </div>
            <div>
              <Label>Ville</Label>
              <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div>
              <Label>SIRET</Label>
              <Input value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} />
            </div>
            <div>
              <Label>TVA Intracom</Label>
              <Input value={formData.vat} onChange={e => setFormData({...formData, vat: e.target.value})} />
            </div>
            <div>
              <Label>Email contact</Label>
              <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="col-span-2 border-t border-slate-100 pt-6">
              <h3 className="font-semibold text-slate-900 mb-4">Coordonnées Bancaires</h3>
            </div>
            <div className="col-span-2">
              <Label>IBAN</Label>
              <Input value={formData.iban} onChange={e => setFormData({...formData, iban: e.target.value})} />
            </div>
            <div>
              <Label>BIC</Label>
              <Input value={formData.bic} onChange={e => setFormData({...formData, bic: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
