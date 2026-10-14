import React from 'react';
import MainLayout from './MainLayout';

/**
 * JalDrishti CitizenLayout Component
 * Backward-compatible wrapper delegating to the unified MainLayout shell.
 */
export default function CitizenLayout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
