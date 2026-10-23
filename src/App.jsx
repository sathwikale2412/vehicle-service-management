import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { dbService } from './db/database';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Dashboard from './components/Dashboard';
import Vehicles from './components/Vehicles';
import VehicleDetails from './components/VehicleDetails';
import ServiceRecords from './components/ServiceRecords';
import Expenses from './components/Expenses';
import Reminders from './components/Reminders';
import Reports from './components/Reports';
import Profile from './components/Profile';
import AIAssistant from './components/AIAssistant';
import AuthModal from './components/AuthModal';
import {
  AddVehicleModal,
  AddServiceModal,
  AddExpenseModal,
  AddReminderModal,
} from './components/Modals';
import { LogIn, Sparkles, Car, Shield, CheckCircle } from 'lucide-react';

function MainApp() {
  const { user, token, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // User-scoped data states
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Modal states
  const [modalVehicleId, setModalVehicleId] = useState(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Load and hydrate user-scoped data whenever active user session changes
  useEffect(() => {
    async function loadData() {
      setDataLoading(true);
      if (user) {
        const data = await dbService.getUserData(user.id, token);
        setVehicles(data.vehicles || []);
        setServices(data.services || []);
        setExpenses(data.expenses || []);
        setReminders(data.reminders || []);
      } else {
        // Fallback demo/guest view
        const data = await dbService.getUserData('usr-sathwik-default', '');
        setVehicles(data.vehicles || []);
        setServices(data.services || []);
        setExpenses(data.expenses || []);
        setReminders(data.reminders || []);
      }
      setDataLoading(false);
    }
    loadData();
  }, [user, token]);

  // Persist changes to user-scoped storage & backend
  const updateUserData = (newVehicles, newServices, newExpenses, newReminders) => {
    const userId = user?.id || 'usr-sathwik-default';
    dbService.saveLocalUserData(userId, {
      vehicles: newVehicles,
      services: newServices,
      expenses: newExpenses,
      reminders: newReminders,
    });
  };

  const handleAddVehicle = async (newVeh) => {
    const updated = [newVeh, ...vehicles];
    setVehicles(updated);
    updateUserData(updated, services, expenses, reminders);
    if (user) await dbService.addVehicle(user.id, newVeh, token);
  };

  const handleDeleteVehicle = async (id) => {
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    updateUserData(updated, services, expenses, reminders);
    if (selectedVehicle?.id === id) setSelectedVehicle(null);
    if (user) await dbService.deleteVehicle(user.id, id, token);
  };

  const handleAddService = async (newSrv) => {
    const updatedSrv = [newSrv, ...services];
    setServices(updatedSrv);

    const newExp = {
      id: `exp-${Date.now()}`,
      vehicle_id: newSrv.vehicle_id,
      vehicle_name: newSrv.vehicle_name,
      title: newSrv.service_type,
      category: 'Service',
      expense_date: newSrv.service_date,
      cost: newSrv.cost,
    };
    const updatedExp = [newExp, ...expenses];
    setExpenses(updatedExp);

    updateUserData(vehicles, updatedSrv, updatedExp, reminders);
    if (user) {
      await dbService.addService(user.id, newSrv, token);
      await dbService.addExpense(user.id, newExp, token);
    }
  };

  const handleDeleteService = async (id) => {
    const updated = services.filter((s) => s.id !== id);
    setServices(updated);
    updateUserData(vehicles, updated, expenses, reminders);
    if (user) await dbService.deleteService(user.id, id, token);
  };

  const handleAddExpense = async (newExp) => {
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    updateUserData(vehicles, services, updated, reminders);
    if (user) await dbService.addExpense(user.id, newExp, token);
  };

  const handleDeleteExpense = async (id) => {
    const updated = expenses.filter((e) => e.id !== id);
    setExpenses(updated);
    updateUserData(vehicles, services, updated, reminders);
    if (user) await dbService.deleteExpense(user.id, id, token);
  };

  const handleAddReminder = async (newRem) => {
    const updated = [newRem, ...reminders];
    setReminders(updated);
    updateUserData(vehicles, services, expenses, updated);
    if (user) await dbService.addReminder(user.id, newRem, token);
  };

  const handleDeleteReminder = async (id) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    updateUserData(vehicles, services, expenses, updated);
    if (user) await dbService.deleteReminder(user.id, id, token);
  };

  const getPageTitle = () => {
    if (selectedVehicle) return `Vehicle Details: ${selectedVehicle.name}`;
    switch (activeTab) {
      case 'dashboard':
        return 'Fleet Dashboard';
      case 'vehicles':
        return 'My Vehicles';
      case 'services':
        return 'Service Records';
      case 'expenses':
        return 'Expense Tracker';
      case 'reminders':
        return 'Service Reminders';
      case 'reports':
        return 'Reports & Analytics';
      case 'ai-insights':
        return 'AI Vehicle Diagnostics & Insights';
      case 'profile':
        return 'User Profile & Settings';
      default:
        return 'Vehicle Service Record Management System';
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <Car size={36} style={{ color: '#3b82f6', marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />
          <div>Restoring User Session & Fleet Telematics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={selectedVehicle ? 'vehicles' : activeTab}
        setActiveTab={(tab) => {
          setSelectedVehicle(null);
          setActiveTab(tab);
        }}
        remindersCount={reminders.length}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Topbar
          title={getPageTitle()}
          onAddVehicle={() => setIsAddVehicleOpen(true)}
          onAddService={() => {
            setModalVehicleId(null);
            setIsAddServiceOpen(true);
          }}
          onOpenAuth={() => setIsAuthOpen(true)}
          onTabChange={(tab) => {
            setSelectedVehicle(null);
            setActiveTab(tab);
          }}
        />

        <main className="content-area">
          {/* Guest notification banner if not authenticated */}
          {!user && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1.25rem',
                background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '10px',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={18} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
                  Viewing in <strong>Guest Demo Mode</strong>. Login or register to create isolated personal sessions and store custom vehicles.
                </span>
              </div>
              <button
                className="primary-btn"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => setIsAuthOpen(true)}
              >
                <LogIn size={13} />
                <span>Login / Register</span>
              </button>
            </div>
          )}

          {selectedVehicle ? (
            <VehicleDetails
              vehicle={selectedVehicle}
              services={services}
              expenses={expenses}
              reminders={reminders}
              onBack={() => setSelectedVehicle(null)}
              onAddService={(vId) => {
                setModalVehicleId(vId);
                setIsAddServiceOpen(true);
              }}
              onAddExpense={(vId) => {
                setModalVehicleId(vId);
                setIsAddExpenseOpen(true);
              }}
              onAddReminder={(vId) => {
                setModalVehicleId(vId);
                setIsAddReminderOpen(true);
              }}
            />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard
                  vehicles={vehicles}
                  services={services}
                  expenses={expenses}
                  reminders={reminders}
                  onNavigate={(tab) => setActiveTab(tab)}
                  onAddService={() => {
                    setModalVehicleId(null);
                    setIsAddServiceOpen(true);
                  }}
                  onAddVehicle={() => setIsAddVehicleOpen(true)}
                />
              )}

              {activeTab === 'vehicles' && (
                <Vehicles
                  vehicles={vehicles}
                  onAddVehicle={() => setIsAddVehicleOpen(true)}
                  onSelectVehicle={(veh) => setSelectedVehicle(veh)}
                  onDeleteVehicle={handleDeleteVehicle}
                />
              )}

              {activeTab === 'services' && (
                <ServiceRecords
                  services={services}
                  vehicles={vehicles}
                  onAddService={() => {
                    setModalVehicleId(null);
                    setIsAddServiceOpen(true);
                  }}
                  onDeleteService={handleDeleteService}
                />
              )}

              {activeTab === 'expenses' && (
                <Expenses
                  expenses={expenses}
                  vehicles={vehicles}
                  onAddExpense={() => {
                    setModalVehicleId(null);
                    setIsAddExpenseOpen(true);
                  }}
                  onDeleteExpense={handleDeleteExpense}
                />
              )}

              {activeTab === 'reminders' && (
                <Reminders
                  reminders={reminders}
                  vehicles={vehicles}
                  onAddReminder={() => {
                    setModalVehicleId(null);
                    setIsAddReminderOpen(true);
                  }}
                  onDeleteReminder={handleDeleteReminder}
                />
              )}

              {activeTab === 'reports' && (
                <Reports
                  vehicles={vehicles}
                  services={services}
                  expenses={expenses}
                />
              )}

              {activeTab === 'ai-insights' && (
                <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                  <AIAssistant
                    vehicles={vehicles}
                    services={services}
                    expenses={expenses}
                    reminders={reminders}
                  />
                </div>
              )}

              {activeTab === 'profile' && <Profile />}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <AddVehicleModal
        isOpen={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onAdd={handleAddVehicle}
      />

      <AddServiceModal
        isOpen={isAddServiceOpen}
        onClose={() => setIsAddServiceOpen(false)}
        onAdd={handleAddService}
        vehicles={vehicles}
        defaultVehicleId={modalVehicleId}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onAdd={handleAddExpense}
        vehicles={vehicles}
        defaultVehicleId={modalVehicleId}
      />

      <AddReminderModal
        isOpen={isAddReminderOpen}
        onClose={() => setIsAddReminderOpen(false)}
        onAdd={handleAddReminder}
        vehicles={vehicles}
        defaultVehicleId={modalVehicleId}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
