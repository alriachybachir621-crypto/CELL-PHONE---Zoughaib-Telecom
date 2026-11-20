import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Something went wrong.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('App ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-white p-6 text-center">
          <div className="max-w-md rounded-3xl bg-[#F3F5F8] p-8 border border-[#26286B]/10">
            <img
              src="/logo.png"
              alt="CELL PHONE - Zoughaib Telecom"
              className="mx-auto mb-4 h-16 w-auto"
            />
            <h1 className="font-display text-xl font-bold text-[#26286B]">
              Unable to load storefront
            </h1>
            <p className="mt-2 text-xs text-[#26286B]/70 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#26286B] px-6 text-sm font-semibold text-white hover:bg-[#1b1d52] cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
