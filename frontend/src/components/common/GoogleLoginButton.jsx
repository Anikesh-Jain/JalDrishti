import React, { useEffect, useRef, useState } from 'react';

/**
 * JalDrishti Google Login Button Component
 *
 * Integrates directly with official Google Identity Services (GIS).
 * Reads VITE_GOOGLE_CLIENT_ID from environment.
 * If credentials are not configured, renders a clear informational notice.
 * Strictly avoids logging tokens or faking authentication.
 */
export default function GoogleLoginButton({ onSuccess, onError, disabled = false }) {
  const containerRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [initError, setInitError] = useState(null);

  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!clientId) {
      return;
    }

    // Check if GIS script already exists
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const scriptId = 'google-gsi-client';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setInitError('Failed to load Google Identity Services SDK');
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => setScriptLoaded(true), { once: true });
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId || !scriptLoaded || !containerRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response?.credential) {
            onSuccessRef.current?.(response.credential);
          } else {
            onErrorRef.current?.(new Error('Google sign-in did not return a credential'));
          }
        },
        error_callback: (error) => {
          const detail = error?.type || error?.message || 'Google Sign-In failed or popup was closed';
          console.warn('[Google Identity Services Warning]:', detail);
          if (detail.includes('origin_mismatch') || detail.includes('unregistered_origin')) {
            const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
            onErrorRef.current?.(new Error(`Google OAuth Error: Origin not authorized in Google Cloud Console. Add ${currentOrigin} to Authorized JavaScript origins.`));
          } else {
            onErrorRef.current?.(new Error(detail));
          }
        }
      });

      // Render button once container is mounted
      containerRef.current.innerHTML = '';

      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left'
      });
    } catch (err) {
      setInitError('Failed to initialize Google Sign-In button: ' + (err.message || 'unknown error'));
    }
  }, [clientId, scriptLoaded]);

  if (!clientId) {
    return (
      <div className="w-full">
        <button
          type="button"
          disabled
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 text-sm font-medium cursor-not-allowed"
          title="Google OAuth requires VITE_GOOGLE_CLIENT_ID in frontend/.env"
        >
          <svg className="w-4 h-4 opacity-50" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Sign in with Google (Config Required)
        </button>
        <p className="mt-1 text-center text-xs text-slate-400">
          Configure <code className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">VITE_GOOGLE_CLIENT_ID</code> to enable
        </p>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="w-full text-center text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
        {initError}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full flex justify-center ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    />
  );
}
