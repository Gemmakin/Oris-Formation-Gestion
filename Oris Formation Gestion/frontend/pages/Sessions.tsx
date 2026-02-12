import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, MapPin, Users, FileCheck, FileText, Trash2, UserPlus } from 'lucide-react';
import { Button, Card, Input, Label, Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import { Session, Trainee } from '../types';

export default function Sessions() {
  const { sessions, clients, catalog, addSession, updateSession, deleteSession } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTraineeModalOpen, setIsTraineeModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [newTraineeName, setNewTraineeName] = useState('');
  
  const [formData, setFormData] = useState<Partial<Session>>({
    trainingId: '', clientId: '', startDate: '', endDate: '', trainer: '', traineesCount: 1, location: '', trainees: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({ ...formData, id: Math.random().toString(36).substr(2, 9), trainees: [] } as Session);
    setIsModalOpen(false);
  };

  const openTraineeModal = (session: Session) => {
    setSelectedSession(session);
    setIsTraineeModalOpen(true);
  };

  const handleAddTrainee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !newTraineeName.trim()) return;

    const newTrainee: Trainee = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTraineeName.trim()
    };

    const updatedSession = {
      ...selectedSession,
      trainees: [...(selectedSession.trainees || []), newTrainee],
      traineesCount: (selectedSession.trainees?.length || 0) + 1
    };

    updateSession(updatedSession);
    setSelectedSession(updatedSession);
    setNewTraineeName('');
  };

  const removeTrainee = (traineeId: string) => {
    if (!selectedSession) return;
    const updatedSession = {
      ...selectedSession,
      trainees: selectedSession.trainees.filter(t => t.id !== traineeId),
      traineesCount: selectedSession.trainees.length - 1
    };
    updateSession(updatedSession);
    setSelectedSession(updatedSession);
  };

  const handleDeleteSession = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.')) {
      deleteSession(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sessions de Formation</h1>
          <p className="text-slate-500">Planning des interventions à venir.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Planifier Session</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.map(session => {
          const client = clients.find(c => c.id === session.clientId);
          const training = catalog.find(t => t.id === session.trainingId);
          const traineeCount = session.trainees?.length || session.traineesCount || 0;
          
          return (
            <Card key={session.id} className="p-6 flex flex-col gap-4 border-l-4 border-l-blue-500 relative group">
              <div className="flex justify-between items-start">
                <div className="pr-12">
                  <h3 className="font-bold text-lg text-slate-900">{training?.title || 'Formation inconnue'}</h3>
                  <p className="text-blue-600 font-medium">{client?.name}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="bg-slate-100 p-2 rounded-lg text-center min-w-[60px]">
                    <span className="block text-xs text-slate-500 uppercase font-bold">{new Date(session.startDate).toLocaleString('fr-FR', { month: 'short' })}</span>
                    <span className="block text-xl font-bold text-slate-900">{new Date(session.startDate).getDate()}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteSession(session.id)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    title="Supprimer la session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mt-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-400" />
                  <span>Du {new Date(session.startDate).toLocaleDateString()} au {new Date(session.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{traineeCount} stagiaires</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">F</span>
                  <span>{session.trainer}</span>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-col gap-3">
                <Button variant="outline" size="sm" className="w-full" onClick={() => openTraineeModal(session)}>
                  <Users className="w-4 h-4 mr-2" /> Gérer les stagiaires ({traineeCount})
                </Button>
                <div className="flex gap-3">
                  <Link to={`/sessions/${session.id}/print/attendance`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <FileText className="w-4 h-4 mr-2" /> Émargement
                    </Button>
                  </Link>
                  <Link to={`/sessions/${session.id}/print/certificate`} className="flex-1">
                    <Button variant="secondary" size="sm" className="w-full">
                      <FileCheck className="w-4 h-4 mr-2" /> Attestations
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Planification */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Planifier une session">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Formation</Label>
            <select 
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              required
              value={formData.trainingId}
              onChange={e => setFormData({...formData, trainingId: e.target.value})}
            >
              <option value="">Choisir...</option>
              {catalog.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <Label>Client</Label>
            <select 
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              required
              value={formData.clientId}
              onChange={e => setFormData({...formData, clientId: e.target.value})}
            >
              <option value="">Choisir...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Début</Label>
              <Input type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
            </div>
            <div>
              <Label>Fin</Label>
              <Input type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Formateur</Label>
              <Input required value={formData.trainer} onChange={e => setFormData({...formData, trainer: e.target.value})} />
            </div>
            <div>
              <Label>Nb Stagiaires (Prévu)</Label>
              <Input type="number" required value={formData.traineesCount} onChange={e => setFormData({...formData, traineesCount: parseInt(e.target.value)})} />
            </div>
          </div>
          <div>
            <Label>Lieu</Label>
            <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit">Planifier</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Gestion Stagiaires */}
      <Modal isOpen={isTraineeModalOpen} onClose={() => setIsTraineeModalOpen(false)} title="Gérer les stagiaires">
        <div className="space-y-6">
          <form onSubmit={handleAddTrainee} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Nom du stagiaire</Label>
              <Input 
                value={newTraineeName} 
                onChange={e => setNewTraineeName(e.target.value)} 
                placeholder="Ex: Jean Dupont"
                autoFocus
              />
            </div>
            <Button type="submit" disabled={!newTraineeName.trim()}>
              <UserPlus className="w-4 h-4" />
            </Button>
          </form>

          <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
            {selectedSession?.trainees && selectedSession.trainees.length > 0 ? (
              <ul className="divide-y divide-slate-200">
                {selectedSession.trainees.map(trainee => (
                  <li key={trainee.id} className="flex justify-between items-center p-3 text-sm">
                    <span className="font-medium text-slate-700">{trainee.name}</span>
                    <button 
                      onClick={() => removeTrainee(trainee.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm">
                Aucun stagiaire inscrit pour le moment.
              </div>
            )}
          </div>
          
          <div className="flex justify-end">
            <Button onClick={() => setIsTraineeModalOpen(false)}>Terminer</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
