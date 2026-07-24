import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { ToastContainer } from './components/Toast';

import { DashboardView } from './components/views/DashboardView';
import { InputErrorView } from './components/views/InputErrorView';
import { DataErrorView } from './components/views/DataErrorView';
import { DataStaffView } from './components/views/DataStaffView';
import { DataSitusView } from './components/views/DataSitusView';
import { KategoriKesalahanView } from './components/views/KategoriKesalahanView';
import { RekapKesalahanView } from './components/views/RekapKesalahanView';
import { RekapPerStaffView } from './components/views/RekapPerStaffView';
import { RekapPerSitusView } from './components/views/RekapPerSitusView';
import { StatistikView } from './components/views/StatistikView';
import { ExportDataView } from './components/views/ExportDataView';
import { PengaturanView } from './components/views/PengaturanView';

import {
  ErrorReport,
  Staff,
  Site,
  ErrorCategory,
  User,
  ViewType,
  ToastMessage
} from './types';
import { storage } from './services/storage';

export default function App() {
  // User & Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(storage.getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(!storage.getCurrentUser());

  // Navigation State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App Data Collections
  const [reports, setReports] = useState<ErrorReport[]>(storage.getReports());
  const [staffList, setStaffList] = useState<Staff[]>(storage.getStaff());
  const [sitesList, setSitesList] = useState<Site[]>(storage.getSites());
  const [categoriesList, setCategoriesList] = useState<ErrorCategory[]>(storage.getCategories());
  const [usersList, setUsersList] = useState<User[]>(storage.getUsers());

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Selected report for detail view
  const [selectedReportDetail, setSelectedReportDetail] = useState<ErrorReport | null>(null);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Subscribe to storage changes for real-time local sync
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setReports(storage.getReports());
      setStaffList(storage.getStaff());
      setSitesList(storage.getSites());
      setCategoriesList(storage.getCategories());
      setUsersList(storage.getUsers());
      setCurrentUser(storage.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    addToast(`Selamat datang kembali, ${user.nama} (${user.role.toUpperCase()})!`, 'success');
  };

  const handleLogout = () => {
    storage.logout();
    setCurrentUser(null);
    setIsLoginModalOpen(true);
    addToast('Anda telah keluar dari sistem.', 'info');
  };

  const handleOpenDetailFromDashboard = (report: ErrorReport) => {
    setSelectedReportDetail(report);
    setCurrentView('data-error');
  };

  return (
    <div className="min-h-screen bg-[#08110A] text-[#F5E6C8] font-sans antialiased flex flex-col selection:bg-[#D4AF37] selection:text-[#08110A] relative overflow-x-hidden">
      {/* Frosted Glass Ambient Glows */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-950/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Toast Notifications Overlay */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Main Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex pt-16">
        {/* Sidebar Navigation */}
        <Sidebar
          currentView={currentView}
          onSelectView={(v) => {
            setCurrentView(v);
            setIsSidebarOpen(false);
          }}
          currentUser={currentUser}
          isOpenMobile={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all">
          {currentView === 'dashboard' && (
            <DashboardView
              reports={reports}
              staffList={staffList}
              sitesList={sitesList}
              currentUser={currentUser}
              onNavigate={setCurrentView}
              onOpenDetail={handleOpenDetailFromDashboard}
            />
          )}

          {(currentView === 'input-error' || currentView === 'input_kesalahan') && (
            <InputErrorView
              staffList={staffList}
              sitesList={sitesList}
              categoriesList={categoriesList}
              currentUser={currentUser}
              onSuccess={(msg) => {
                addToast(msg, 'success');
                setCurrentView('data_kesalahan');
              }}
            />
          )}

          {(currentView === 'data-error' || currentView === 'data_kesalahan') && (
            <DataErrorView
              reports={reports}
              staffList={staffList}
              sitesList={sitesList}
              categoriesList={categoriesList}
              currentUser={currentUser}
              selectedReportDetail={selectedReportDetail}
              onClearReportDetail={() => setSelectedReportDetail(null)}
              onSuccess={(msg) => addToast(msg, 'success')}
            />
          )}

          {(currentView === 'data-staff' || currentView === 'data_staff') && (
            <DataStaffView
              staffList={staffList}
              sitesList={sitesList}
              currentUser={currentUser}
              onSuccess={(msg) => addToast(msg, 'success')}
            />
          )}

          {(currentView === 'data-situs' || currentView === 'data_situs') && (
            <DataSitusView
              sitesList={sitesList}
              currentUser={currentUser}
              onSuccess={(msg) => addToast(msg, 'success')}
            />
          )}

          {(currentView === 'kategori-kesalahan' || currentView === 'kategori_kesalahan') && (
            <KategoriKesalahanView
              categoriesList={categoriesList}
              currentUser={currentUser}
              onSuccess={(msg) => addToast(msg, 'success')}
            />
          )}

          {(currentView === 'rekap-kesalahan' || currentView === 'rekap_kesalahan') && (
            <RekapKesalahanView
              reports={reports}
              staffList={staffList}
              sitesList={sitesList}
              categoriesList={categoriesList}
            />
          )}

          {(currentView === 'rekap-staff' || currentView === 'rekap_per_staff') && (
            <RekapPerStaffView reports={reports} staffList={staffList} />
          )}

          {(currentView === 'rekap-situs' || currentView === 'rekap_per_situs') && (
            <RekapPerSitusView reports={reports} sitesList={sitesList} staffList={staffList} />
          )}

          {currentView === 'statistik' && (
            <StatistikView reports={reports} staffList={staffList} />
          )}

          {(currentView === 'export-data' || currentView === 'export_data') && (
            <ExportDataView reports={reports} staffList={staffList} sitesList={sitesList} />
          )}

          {currentView === 'pengaturan' && (
            <PengaturanView
              currentUser={currentUser}
              usersList={usersList}
              onSuccess={(msg) => addToast(msg, 'success')}
            />
          )}
        </main>
      </div>

      {/* Authentication Login Modal */}
      {isLoginModalOpen && (
        <LoginModal
          users={usersList}
          onLogin={handleLogin}
          onClose={() => {
            if (currentUser) setIsLoginModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
