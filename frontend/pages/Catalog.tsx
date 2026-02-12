import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Input, Label } from '../components/ui';
import { useData } from '../context/DataContext';
import { BookOpen, Clock, Euro, Plus, Edit, Trash2 } from 'lucide-react';
import { TrainingCategory, TrainingModule } from '../types';

export default function Catalog() {
  const { catalog, addTraining, updateTraining, deleteTraining } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const defaultFormData = {
    reference: '', title: '', category: TrainingCategory.HABILITATION, durationDays: 1, priceHt: 0, description: ''
  };

  const [formData, setFormData] = useState<Partial<TrainingModule>>(defaultFormData);

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (training: TrainingModule) => {
    setEditingId(training.id);
    setFormData(training);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      deleteTraining(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateTraining({ ...formData, id: editingId } as TrainingModule);
    } else {
      addTraining({ ...formData, id: Math.random().toString(36).substr(2, 9) } as TrainingModule);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Catalogue Formations</h1>
          <p className="text-slate-500">Gérez vos modules et tarifs.</p>
        </div>
        <Button onClick={handleOpenNew}><Plus className="w-4 h-4 mr-2" /> Ajouter une formation</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalog.map((training) => (
          <Card key={training.id} className="flex flex-col h-full hover:border-blue-300 transition-colors group">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <Badge color="blue">{training.category}</Badge>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{training.reference}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{training.title}</h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">{training.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mt-auto">
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{training.durationDays} jours</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                  <Euro className="w-4 h-4 text-slate-400" />
                  <span>{training.priceHt} € HT</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-xl">
              <Button variant="ghost" className="text-sm">Voir programme</Button>
              <div className="flex gap-2">
                <Button variant="secondary" className="text-sm" onClick={() => handleOpenEdit(training)}>
                  <Edit className="w-3 h-3 mr-2" /> Modifier
                </Button>
                <Button variant="ghost" className="text-sm text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(training.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modifier la formation" : "Nouvelle Formation"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Référence</Label>
              <Input required value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} />
            </div>
            <div>
              <Label>Catégorie</Label>
              <select 
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as TrainingCategory})}
              >
                {Object.values(TrainingCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <Label>Intitulé</Label>
            <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Durée (jours)</Label>
              <Input type="number" required value={formData.durationDays} onChange={e => setFormData({...formData, durationDays: parseFloat(e.target.value)})} />
            </div>
            <div>
              <Label>Prix Standard HT</Label>
              <Input type="number" required value={formData.priceHt} onChange={e => setFormData({...formData, priceHt: parseFloat(e.target.value)})} />
            </div>
          </div>
          <div>
            <Label>Description / Objectifs</Label>
            <textarea 
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit">{editingId ? "Enregistrer" : "Ajouter"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
