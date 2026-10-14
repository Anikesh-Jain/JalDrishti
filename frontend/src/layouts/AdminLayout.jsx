import React from 'react';
import MainLayout from './MainLayout';

/**
 * JalDrishti AdminLayout Component
 * Backward-compatible wrapper delegating to the unified MainLayout shell.
 */
export default function AdminLayout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
