import React, { useState, useEffect } from 'react';
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
import {
  initialVehicles,
  initialServices,
  initialExpenses,
  initialReminders,
  initialProfile,
} from './lib/initialData';
import { supabase, isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Data state with localStorage persistence
  const [vehicles, setVehicles] = useState(() => {
    const saved = localStorage.getItem('vsrms_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('vsrms_services');
    return saved ? JSON.parse(saved) : initialServices;
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('vsrms_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [reminders, setReminders] = useState(() => {
    const saved = localStorage.getItem('vsrms_reminders');
    return saved ? JSON.parse(saved) : initialReminders;
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('vsrms_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vsrms_user');
    return saved
      ? JSON.parse(saved)
      : {
          name: 'Ale Sathwik Netha',
          email: 'sathwikale@gmail.com',
          isCloud: false,
          id: 'local-user-1',
        };
  });

  // Modal states
  const [modalVehicleId, setModalVehicleId] = useState(null);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vsrms_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('vsrms_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('vsrms_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('vsrms_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('vsrms_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('vsrms_user', JSON.stringify(user));
  }, [user]);

  // Cloud Supabase sync if logged in with Cloud
  useEffect(() => {
    if (isSupabaseConfigured && supabase && user?.isCloud) {
      loadCloudData();
    }
  }, [user]);

  const loadCloudData = async () => {
    try {
      const { data: vData } = await supabase.from('vsrms_vehicles').select('*');
      if (vData && vData.length > 0) setVehicles(vData);

      const { data: sData } = await supabase.from('vsrms_service_records').select('*');
      if (sData && sData.length > 0) setServices(sData);

      const { data: eData } = await supabase.from('vsrms_expenses').select('*');
      if (eData && eData.length > 0) setExpenses(eData);

      const { data: rData } = await supabase.from('vsrms_reminders').select('*');
      if (rData && rData.length > 0) setReminders(rData);
    } catch (err) {
      console.warn('Cloud sync error:', err);
    }
  };

  // Handlers for Add/Delete operations
  const handleAddVehicle = (newVeh) => {
    setVehicles((prev) => [newVeh, ...prev]);
  };

  const handleDeleteVehicle = (id) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (selectedVehicle?.id === id) setSelectedVehicle(null);
  };

  const handleAddService = (newSrv) => {
    setServices((prev) => [newSrv, ...prev]);
    // Also log automatic corresponding expense
    const newExp = {
      id: `exp-${Date.now()}`,
      vehicle_id: newSrv.vehicle_id,
      vehicle_name: newSrv.vehicle_name,
      title: newSrv.service_type,
      category: 'Service',
      expense_date: newSrv.service_date,
      cost: newSrv.cost,
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddExpense = (newExp) => {
    setExpenses((prev) => [newExp, ...prev]);
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddReminder = (newRem) => {
    setReminders((prev) => [newRem, ...prev]);
  };

  const handleDeleteReminder = (id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    setUser((prev) => ({ ...prev, name: updatedProfile.full_name, email: updatedProfile.email }));
  };

  const handleSignOut = () => {
    setUser({
      name: 'Guest User',
      email: 'guest@vsrms.local',
      isCloud: false,
      id: 'guest',
    });
  };

  // Page title mapping
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
        user={user}
        onSignOut={handleSignOut}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Topbar
          title={getPageTitle()}
          isCloud={user?.isCloud}
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

              {activeTab === 'profile' && (
                <Profile
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
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
        onAuthSuccess={(userData) => setUser(userData)}
      />
    </div>
  );
}
