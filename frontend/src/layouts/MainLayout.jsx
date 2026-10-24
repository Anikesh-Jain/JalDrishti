import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import HardwareOnboardingModal from '../components/hardware/HardwareOnboardingModal';
import { useAuth } from '../context/AuthContext';

/**
 * JalDrishti Authenticated Main Layout Shell (REM-05 / REM-06 / REM-11)
 *
 * Implements the global layout matching the reference UI:
 * - Persistent fresh light water-blue left sidebar (w-64 on desktop, drawer on mobile)
 * - Compact top header with search, station dropdown, live pill, and avatar dropdown
 * - Responsive content container
 * - Cohesive application footer
 * - Citizen hardware onboarding prompt for new or unprompted users
 */
export default function MainLayout({ children }) {
  const { user, deviceSetupModal, openDeviceSetup, closeDeviceSetup } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOnboardingDismissed, setIsOnboardingDismissed] = useState(() => {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage.getItem('jaldrishti_onboarding_dismissed') === 'true';
    }
    return false;
  });

  const isCitizen = user?.role === 'Citizen';
  const onboardingStatus = user?.hardwareOnboarding?.status;
  const isPendingOnboarding = !onboardingStatus || onboardingStatus === 'pending';
  // If citizen answered 'yes' but has not claimed a device, setup is incomplete
  const hasIncompleteSetup = onboardingStatus === 'yes' && !user?.assignedNodeId;

  const shouldAutoPrompt = Boolean(
    user && isCitizen && !isOnboardingDismissed && (isPendingOnboarding || hasIncompleteSetup)
  );

  const isModalOpen = Boolean(deviceSetupModal.isOpen || shouldAutoPrompt);
  const modalInitialStep = deviceSetupModal.isOpen
    ? deviceSetupModal.step
    : hasIncompleteSetup
    ? 'resume'
    : 'initial';

  const handleCloseOnboarding = () => {
    closeDeviceSetup();
    setIsOnboardingDismissed(true);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem('jaldrishti_onboarding_dismissed', 'true');
      }
    } catch {
      // Ignore storage errors
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F0FAFF] text-[#163344] font-sans">
      {/* 1. Fresh Water Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* 2. Main Content Column (offset by sidebar width on desktop) */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Dynamic Page View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Global Footer */}
        <Footer />
      </div>

      {/* Citizen Hardware Onboarding & Device Setup Modal */}
      <HardwareOnboardingModal
        isOpen={isModalOpen}
        initialStep={modalInitialStep}
        onClose={handleCloseOnboarding}
      />
    </div>
  );
}
