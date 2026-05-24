/**
 * ErrorBoundary.tsx
 *
 * Catches React render errors at any level of the tree so a single broken
 * component never causes a blank white screen – critical for Samsung TV
 * browsers that don't display JS console errors to users.
 *
 * Usage:
 *   // Wrap individual lazy-loaded routes for granular recovery:
 *   <RouteErrorBoundary>
 *     <Suspense fallback={<PageLoader />}>
 *       <SomeLazyPage />
 *     </Suspense>
 *   </RouteErrorBoundary>
 *
 *   // Or wrap the whole app (already done in App.tsx):
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  children: ReactNode;
  /** Custom fallback rendered instead of the default error card */
  fallback?: ReactNode;
  /** Called when an error is caught – use for logging / analytics */
  onError?: (error: Error, info: ErrorInfo) => void;
  /** If true, renders a minimal inline error rather than full-page card */
  inline?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateErrorId(): string {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  public componentDidCatch(error: Error, info: ErrorInfo) {
    // Safe console – some Samsung TV builds stub it out
    try {
      console.error('[Texly Error Boundary]', error.message);
      console.error('[Component Stack]', info.componentStack);
    } catch (_) { /* noop */ }

    // Optional external logging
    if (this.props.onError) {
      try {
        this.props.onError(error, info);
      } catch (_) { /* noop */ }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  private handleHardReload = () => {
    try {
      // Clear any stale cached modules that may be causing crashes
      if (typeof window !== 'undefined' && window.location) {
        window.location.reload();
      }
    } catch (_) { /* noop */ }
  };

  // ── Inline variant (for small widgets that break) ────────────────────────
  private renderInlineFallback() {
    return (
      <div
        role="alert"
        style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          fontFamily: 'sans-serif',
          fontSize: '13px',
          color: '#b91c1c',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span>⚠️</span>
        <span>This section failed to load.</span>
        <button
          onClick={this.handleReset}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            color: '#b91c1c',
            fontSize: '12px',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Full-page variant (for major crashes) ────────────────────────────────
  private renderFullPageFallback() {
    const { error, errorId } = this.state;

    return (
      <div
        role="alert"
        style={{
          padding: '40px 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          background: '#f8fafc',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '520px',
            width: '100%',
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            border: '1px solid #fee2e2',
          }}
        >
          {/* Icon */}
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>⚠️</div>

          {/* Heading */}
          <h1
            style={{
              color: '#dc2626',
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            Something went wrong
          </h1>

          {/* Message */}
          <p
            style={{
              color: '#64748b',
              marginBottom: '8px',
              fontSize: '14px',
              lineHeight: '1.6',
            }}
          >
            Texly ran into an unexpected error. Your data has not been lost.
          </p>

          {/* Error ID for support */}
          <p
            style={{
              color: '#94a3b8',
              fontSize: '12px',
              marginBottom: '24px',
              fontFamily: 'monospace',
            }}
          >
            Error ID: {errorId}
          </p>

          {/* Details (collapsed by default) */}
          {error && (
            <details
              style={{
                textAlign: 'left',
                marginBottom: '24px',
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#475569',
                wordBreak: 'break-all',
              }}
            >
              <summary
                style={{ cursor: 'pointer', fontWeight: 700, marginBottom: '6px' }}
              >
                Technical details
              </summary>
              <strong>{error.message}</strong>
              {error.stack && (
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    marginTop: '8px',
                    fontSize: '10px',
                    opacity: 0.8,
                  }}
                >
                  {error.stack.slice(0, 600)}
                </pre>
              )}
            </details>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={this.handleReset}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              Try Again
            </button>
            <button
              onClick={this.handleHardReload}
              style={{
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Reload Page
            </button>
          </div>

          {/* Home link (plain anchor – works even if React Router crashed) */}
          <p style={{ marginTop: '20px', fontSize: '13px', color: '#94a3b8' }}>
            Or{' '}
            <a
              href="/"
              style={{ color: '#2563eb', textDecoration: 'underline' }}
            >
              go back to the homepage
            </a>
          </p>
        </div>
      </div>
    );
  }

  public render() {
    if (this.state.hasError) {
      // Custom fallback takes priority
      if (this.props.fallback) return <>{this.props.fallback}</>;
      if (this.props.inline) return this.renderInlineFallback();
      return this.renderFullPageFallback();
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// ─── Convenience wrapper for lazy-loaded routes ────────────────────────────
// Usage: wrap each <Route element={...}> for isolated error handling.
export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '40px',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            gap: '16px',
          }}
        >
          <div style={{ fontSize: '40px' }}>📄</div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            This page could not be loaded.
          </p>
          <a
            href="/"
            style={{
              background: '#2563eb',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
            }}
          >
            Go Home
          </a>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
