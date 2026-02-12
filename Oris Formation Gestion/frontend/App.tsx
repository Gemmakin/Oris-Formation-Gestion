import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, BookOpen, Settings, Receipt, Calendar, LogOut, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from './components/ui';
import { DataProvider, useData } from './context/DataContext';

// Pages
import Dashboard from './pages/Dashboard';
import { QuoteList, QuoteBuilder } from './pages/Quotes';
import Invoices from './pages/Invoices';
import Clients from './pages/Clients';
import Sessions from './pages/Sessions';
import Catalog from './pages/Catalog';
import SettingsPage from './pages/Settings';
import DocumentPreview from './pages/DocumentPreview';
import SessionDocumentPreview from './pages/SessionDocumentPreview';

function Sidebar() {
  const location = useLocation();
  const { company } = useData();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
    { icon: Users, label: 'Clients', path: '/clients' },
    { icon: FileText, label: 'Devis', path: '/quotes' },
    { icon: Receipt, label: 'Factures', path: '/invoices' },
    { icon: Calendar, label: 'Sessions', path: '/sessions' },
    { icon: BookOpen, label: 'Catalogue', path: '/catalog' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className="w-72 bg-[#0f172a] text-white h-screen fixed left-0 top-0 flex flex-col print:hidden shadow-2xl z-20 border-r border-slate-800">
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3 mb-8">
          {company.logoUrl ? (
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-blue-500/20 bg-transparent">
              <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30 text-white">
              {company.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg leading-none tracking-tight text-white truncate max-w-[140px]">{company.name}</h1>
            <span className="text-[10px] text-blue-400 font-bold tracking-[0.2em] uppercase">Formation</span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-slate-800 to-transparent"></div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400")} />
                {item.label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-blue-300 opacity-50" />}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 m-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-bold border-2 border-slate-700 shadow-sm group-hover:border-blue-500 transition-colors">OA</div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate text-slate-200 group-hover:text-white">Oris Admin</p>
          </div>
          <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400 transition-colors" />
        </div>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const { loading } = useData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900">
      <Sidebar />
      <main className="pl-72 min-h-screen transition-all duration-300">
        <div className="p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          {/* Print Routes (No Layout) */}
          <Route path="/quotes/:id/print" element={<DocumentPreview />} />
          <Route path="/invoices/:id/print" element={<DocumentPreview />} />
          <Route path="/sessions/:id/print/:type" element={<SessionDocumentPreview />} />
          
          {/* Main App Routes */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
          <Route path="/quotes" element={<Layout><QuoteList /></Layout>} />
          <Route path="/quotes/new" element={<Layout><QuoteBuilder /></Layout>} />
          <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
          <Route path="/sessions" element={<Layout><Sessions /></Layout>} />
          <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}
