import React, { useState } from 'react';
import { Plus, Search, MapPin, Mail, Phone, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button, Card, Input, Label, Badge, Modal } from '../components/ui';
import { useData } from '../context/DataContext';
import { Client, ClientStatus } from '../types';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '', siret: '', vatNumber: '', address: '', city: '', zip: '', contactName: '', email: '', phone: '', status: ClientStatus.PROSPECT
  });

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setFormData(client);
    } else {
      setEditingClient(null);
      setFormData({ status: ClientStatus.PROSPECT });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      updateClient({ ...formData, id: editingClient.id } as Client);
    } else {
      addClient({ ...formData, id: Math.random().toString(36).substr(2, 9) } as Client);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients & Prospects</h1>
          <p className="text-slate-500">Gérez votre base de données clients.</p>
        </div>
        <Button onClick={() => handleOpenModal()}><Plus className="w-4 h-4 mr-2" /> Nouveau Client</Button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Rechercher un client, un contact..." 
          className="flex-1 outline-none text-sm py-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <Card key={client.id} className="flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                  {client.name.charAt(0)}
                </div>
                <Badge color={client.status === ClientStatus.CLIENT ? 'green' : client.status === ClientStatus.PROSPECT ? 'blue' : 'gray'}>
                  {client.status}
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{client.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{client.contactName}</p>
              
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <a href={`mailto:${client.email}`} className="hover:text-blue-600">{client.email}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{client.city} ({client.zip})</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 rounded-b-xl">
              <Button variant="ghost" size="sm" onClick={() => handleOpenModal(client)}><Edit className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => deleteClient(client.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? "Modifier Client" : "Nouveau Client"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Raison Sociale</Label>
              <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <Label>SIRET</Label>
              <Input required value={formData.siret} onChange={e => setFormData({...formData, siret: e.target.value})} />
            </div>
            <div>
              <Label>TVA Intracom</Label>
              <Input value={formData.vatNumber} onChange={e => setFormData({...formData, vatNumber: e.target.value})} />
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
            <div className="col-span-2 border-t border-slate-100 pt-4 mt-2">
              <Label className="text-blue-600">Contact Principal</Label>
            </div>
            <div className="col-span-2">
              <Label>Nom complet</Label>
              <Input required value={formData.contactName} onChange={e => setFormData({...formData, contactName: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="col-span-2">
              <Label>Statut</Label>
              <select 
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as ClientStatus})}
              >
                {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Annuler</Button>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
