import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, cn, Badge, Button } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Euro, FileText, Users, Calendar, ArrowRight, AlertTriangle, CheckCircle, Clock, Phone, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from '../context/DataContext';
import { InvoiceStatus } from '../types';

const StatCard = ({ title, value, icon: Icon, trend, trendDirection = 'neutral', color = "blue" }: { title: string, value: string, icon: any, trend?: string, trendDirection?: 'up' | 'down' | 'neutral', color?: string }) => {
  const colorStyles: Record<string, { bg: string, icon: string, text: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600", text: "text-blue-600" },
    green: { bg: "bg-emerald-50", icon: "text-emerald-600", text: "text-emerald-600" },
    purple: { bg: "bg-violet-50", icon: "text-violet-600", text: "text-violet-600" },
    orange: { bg: "bg-amber-50", icon: "text-amber-600", text: "text-amber-600" },
    red: { bg: "bg-rose-50", icon: "text-rose-600", text: "text-rose-600" }
  };

  const style = colorStyles[color];

  return (
    <Card className="p-6 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-3 tracking-tight">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {trendDirection === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
              {trendDirection === 'down' && <TrendingDown className="w-3 h-3 text-rose-500" />}
              {trendDirection === 'neutral' && <Minus className="w-3 h-3 text-slate-400" />}
              <p className={cn("text-xs font-medium", 
                trendDirection === 'up' ? "text-emerald-600" : 
                trendDirection === 'down' ? "text-rose-600" : "text-slate-500"
              )}>
                {trend}
              </p>
            </div>
          )}
        </div>
        <div className={cn("p-3.5 rounded-2xl shadow-sm transition-colors", style.bg)}>
          <Icon className={cn("w-6 h-6", style.icon)} />
        </div>
      </div>
      {/* Decorative background blob */}
      <div className={cn("absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:scale-150 transition-transform duration-500", style.text.replace('text-', 'bg-'))}></div>
    </Card>
  );
};

export default function Dashboard() {
  const { quotes, invoices, clients, sessions, certifications } = useData();
  const currentYear = new Date().getFullYear();

  // --- Calculs des Données Réelles ---
  const { chartData, currentYearRevenue, trendLabel, trendDirection } = useMemo(() => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    // Initialiser les données du graphique
    const data = months.map(name => ({ name, ca: 0 }));
    
    let caN = 0; // CA Année en cours
    let caN_1 = 0; // CA Année précédente

    invoices.forEach(invoice => {
      // On ne prend que les factures payées (ou avoirs)
      if (invoice.status !== InvoiceStatus.PAID) return;
      
      const date = new Date(invoice.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Montant (négatif si avoir)
      const amount = invoice.type === 'CREDIT_NOTE' ? -invoice.totalHt : invoice.totalHt;

      if (year === currentYear) {
        data[month].ca += amount;
        caN += amount;
      } else if (year === currentYear - 1) {
        caN_1 += amount;
      }
    });

    // Calcul de la tendance
    let label = "";
    let direction: 'up' | 'down' | 'neutral' = 'neutral';

    if (caN_1 > 0) {
      const percent = ((caN - caN_1) / caN_1) * 100;
      label = `${percent > 0 ? '+' : ''}${percent.toFixed(0)}% vs N-1`;
      direction = percent >= 0 ? 'up' : 'down';
    } else if (caN > 0) {
      label = "Démarrage activité";
      direction = 'up';
    } else {
      label = "Pas de données N-1";
      direction = 'neutral';
    }

    return { 
      chartData: data, 
      currentYearRevenue: caN, 
      trendLabel: label,
      trendDirection: direction 
    };
  }, [invoices, currentYear]);

  // --- Autres KPIs ---
  
  const pendingRevenue = invoices
    .filter(i => i.status === InvoiceStatus.PENDING && i.type === 'INVOICE')
    .reduce((acc, curr) => acc + curr.totalHt, 0);

  const overdueRevenue = invoices
    .filter(i => i.status === InvoiceStatus.OVERDUE && i.type === 'INVOICE')
    .reduce((acc, curr) => acc + curr.totalHt, 0);
  
  const pendingQuotes = quotes.filter(q => q.status === 'Envoyé').length;
  const upcomingSessions = sessions.length;

  // Données pour le Pie Chart (Santé Financière Globale)
  // On recalcule le total payé global pour le camembert
  const totalPaidGlobal = invoices
    .filter(i => i.status === InvoiceStatus.PAID)
    .reduce((acc, curr) => acc + (curr.type === 'CREDIT_NOTE' ? -curr.totalHt : curr.totalHt), 0);

  const invoiceStatusData = [
    { name: 'Payé (Global)', value: Math.max(0, totalPaidGlobal), color: '#10b981' },
    { name: 'À venir', value: pendingRevenue, color: '#3b82f6' },
    { name: 'En retard', value: overdueRevenue, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const handleContactClient = (companyName: string) => {
    const client = clients.find(c => c.name === companyName);
    if (client) {
      alert(`Entreprise : ${client.name}\nTéléphone : ${client.phone}\nContact : ${client.contactName}`);
    } else {
      alert(`Coordonnées introuvables pour l'entreprise : "${companyName}".\nVérifiez que le client existe dans la base.`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
          <p className="text-slate-500 mt-1 font-medium">Pilotage de l'activité et suivi commercial.</p>
        </div>
        <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
      
      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={`CA Encaissé (${currentYear})`} 
          value={`${currentYearRevenue.toLocaleString('fr-FR')} €`} 
          icon={Euro} 
          trend={trendLabel}
          trendDirection={trendDirection}
          color="blue" 
        />
        <StatCard title="Factures en retard" value={`${overdueRevenue.toLocaleString('fr-FR')} €`} icon={AlertTriangle} color="red" />
        <StatCard title="Devis en attente" value={pendingQuotes.toString()} icon={FileText} color="orange" />
        <StatCard title="Sessions planifiées" value={upcomingSessions.toString()} icon={Calendar} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Graphique CA */}
        <Card className="lg:col-span-2 p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Évolution du Chiffre d'Affaires</h3>
              <p className="text-sm text-slate-500">Encaissements mensuels {currentYear}</p>
            </div>
            <select className="text-sm border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 text-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none">
              <option>Cette année</option>
              {/* L'option année précédente est statique ici pour l'UI, la logique complète nécessiterait un state */}
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 500}} tickFormatter={(value) => `${value}€`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                  formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, 'CA HT']}
                />
                <Bar dataKey="ca" fill="url(#colorCa)" radius={[6, 6, 0, 0]} barSize={50} />
                <defs>
                  <linearGradient id="colorCa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Répartition Facturation */}
        <Card className="p-8 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-1">Santé Financière</h3>
          <p className="text-sm text-slate-500 mb-8">Répartition des montants facturés</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {invoiceStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value.toLocaleString('fr-FR')} €`} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* MODULE RECYCLAGE (Business Generator) */}
        <Card className="p-0 overflow-hidden border-l-4 border-l-amber-500">
          <div className="p-6 border-b border-amber-100 bg-amber-50/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Renouvellements à prévoir
              </h3>
              <p className="text-sm text-slate-500 mt-1">Habilitations arrivant à échéance (Opportunités)</p>
            </div>
            <Badge color="yellow" className="bg-white shadow-sm">{certifications.length} alertes</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {certifications.map((cert) => (
              <div key={cert.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                <div>
                  <p className="font-bold text-slate-900">{cert.traineeName}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{cert.companyName} — <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs">{cert.level}</span></p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div className="text-sm">
                    <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">Expire le</p>
                    <p className="font-bold text-amber-600">{new Date(cert.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-9 w-9 p-0 rounded-full border-amber-200 text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700" 
                    title="Contacter le client"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleContactClient(cert.companyName);
                    }}
                  >
                    <Phone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {certifications.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                <p>Aucun renouvellement urgent.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-amber-700 hover:text-amber-800 hover:bg-amber-50 w-full font-semibold"
              onClick={() => alert("L'historique complet sera disponible dans la version V2.")}
            >
              Voir tout l'historique
            </Button>
          </div>
        </Card>

        {/* Actions Rapides */}
        <Card className="p-8 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Actions rapides</h3>
          <div className="space-y-4 flex-1">
            <Link to="/quotes/new" className="group w-full text-left px-5 py-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md transition-all flex items-center gap-5">
              <div className="bg-white p-3.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 text-blue-600"><FileText className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-base">Créer un devis</p>
                <p className="text-sm text-slate-500 mt-0.5">Nouvelle proposition commerciale</p>
              </div>
              <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </div>
            </Link>
            <Link to="/clients" className="group w-full text-left px-5 py-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-md transition-all flex items-center gap-5">
              <div className="bg-white p-3.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 text-emerald-600"><Users className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-base">Ajouter un client</p>
                <p className="text-sm text-slate-500 mt-0.5">Fiche prospect ou client</p>
              </div>
              <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-emerald-600" />
              </div>
            </Link>
            <Link to="/sessions" className="group w-full text-left px-5 py-5 rounded-2xl border border-slate-100 bg-slate-50/30 hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-md transition-all flex items-center gap-5">
              <div className="bg-white p-3.5 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-300 text-violet-600"><Calendar className="w-6 h-6" /></div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 text-base">Planifier session</p>
                <p className="text-sm text-slate-500 mt-0.5">Organiser une formation</p>
              </div>
              <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-4 h-4 text-violet-600" />
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
