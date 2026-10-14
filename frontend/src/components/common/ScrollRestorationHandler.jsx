import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * JalDrishti Centralized Scroll Restoration Handler
 *
 * Implements route-aware scroll management:
 * 1. Resets window scroll position to { top: 0, left: 0 } when navigating to a new pathname.
 * 2. Smoothly scrolls to target element when navigating with a hash anchor (#overview, #contact, #inquiries, etc.).
 * 3. Accounts for sticky header offset via standard CSS scroll-margin-top (scroll-mt-16 / scroll-mt-20).
 * 4. Preserves browser Back/Forward (popstate) behavior where appropriate without resetting on unrelated re-renders.
 */
export default function ScrollRestorationHandler() {
  const { pathname, hash } = useLocation();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    // If hash is present (e.g. #overview, #inquiries, #contact)
    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const timer = setTimeout(() => {
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      prevPathnameRef.current = pathname;
      return () => clearTimeout(timer);
    }

    // Pathname changed without a hash anchor -> reset scroll to top
    if (prevPathnameRef.current !== pathname) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      prevPathnameRef.current = pathname;
    }
  }, [pathname, hash]);

  return null;
}
