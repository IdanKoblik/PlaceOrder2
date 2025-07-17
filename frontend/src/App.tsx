import React, { useState } from 'react';
import { Calendar, Users, LayoutGrid, BarChart3, Plus, Settings, Clock } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageSwitch } from './components/LanguageSwitch';
import { UserProfile } from './components/UserProfile';
import { LoginPage } from './components/LoginPage';
import { PasswordModal } from './components/PasswordModal';
import { ConfigManagement } from './components/ConfigManagement';
import { Dashboard } from './components/Dashboard';
import { ReservationList } from './components/ReservationList';
import { ReservationForm } from './components/ReservationForm';
import { TableManagement } from './components/TableManagement';
import { useReservations } from './hooks/useReservations';
import { useTables } from './hooks/useTables';
import { useConfig } from './hooks/useConfig';
import type { Reservation } from '../../shared/types';

type ActiveView = 'dashboard' | 'reservations' | 'form' | 'tables' | 'config';

function AppContent() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    reservations, 
    createReservation, 
    updateReservation, 
    deleteReservation 
  } = useReservations();
  
  const { tables, updateTables, isLoading: tablesLoading } = useTables();
  const { config } = useConfig();

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isTableManagementUnlocked, setIsTableManagementUnlocked] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const navigation = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutGrid },
    { id: 'reservations', label: t('nav.reservations'), icon: Calendar },
    { id: 'tables', label: 'Table Management', icon: Settings },
    { id: 'config', label: 'Working Hours', icon: Clock },
  ];

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleSaveReservation = (reservationData: Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingReservation) {
      updateReservation(editingReservation.id, reservationData);
    } else {
      createReservation(reservationData);
    }
    setActiveView('reservations');
    setEditingReservation(undefined);
  };

  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setActiveView('form');
  };

  const handleDeleteReservation = (id: string) => {
    if (confirm('Are you sure you want to delete this reservation?')) {
      deleteReservation(id);
    }
  };

  const handleStatusChange = (id: string, status: Reservation['status']) => {
    updateReservation(id, { status });
  };

  const handleNewReservation = () => {
    setEditingReservation(undefined);
    setActiveView('form');
  };

  const handleCancelForm = () => {
    setEditingReservation(undefined);
    setActiveView('reservations');
  };

  const handleNavigationClick = (viewId: string) => {
    if (viewId === 'tables') {
      // For table management, require password
      if (!isTableManagementUnlocked) {
        setShowPasswordModal(true);
        return;
      }
    } else if (viewId === 'config') {
      // For config management, show modal
      setShowConfigModal(true);
      return;
    }
    setActiveView(viewId as ActiveView);
  };

  const handlePasswordSuccess = () => {
    setIsTableManagementUnlocked(true);
    setShowPasswordModal(false);
    setActiveView('tables');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ReserveFlow</h1>
                  <p className="text-xs text-gray-500">{config.name}</p>
                </div>
              </div>

              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isLocked = item.id === 'tables' && !isTableManagementUnlocked;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigationClick(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeView === item.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      } ${isLocked ? 'relative' : ''}`}
                    >
                      <Icon size={16} />
                      {item.label}
                      {isLocked && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {activeView === 'reservations' && (
                <button
                  onClick={handleNewReservation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={16} />
                  {t('reservation.newReservation')}
                </button>
              )}
              <LanguageSwitch />
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-20 sm:pb-8">
        {activeView === 'dashboard' && (
          <Dashboard reservations={reservations} tables={tables} />
        )}

        {activeView === 'reservations' && (
          <ReservationList
            reservations={reservations}
            onEdit={handleEditReservation}
            onDelete={handleDeleteReservation}
            onStatusChange={handleStatusChange}
          />
        )}

        {activeView === 'form' && (
          <ReservationForm
            reservation={editingReservation}
            onSave={handleSaveReservation}
            onCancel={handleCancelForm}
            tables={tables}
          />
        )}

        {activeView === 'tables' && isTableManagementUnlocked && (
          <TableManagement
            tables={tables}
            onUpdateTables={updateTables}
            isLoading={tablesLoading}
          />
        )}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
        <div className="grid grid-cols-4 gap-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isLocked = item.id === 'tables' && !isTableManagementUnlocked;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigationClick(item.id)}
                className={`flex flex-col items-center gap-1 p-3 relative ${
                  activeView === item.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs font-medium leading-tight">{item.label}</span>
                {isLocked && (
                  <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Password Modal for Table Management */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
        title="Table Management Access"
      />

      {/* Config Management Modal */}
      {showConfigModal && (
        <ConfigManagement
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;