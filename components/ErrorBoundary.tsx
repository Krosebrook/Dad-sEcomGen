import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    if (import.meta.env.PROD) {
      // Log to external service in production
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      console.log('Error logged:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {!import.meta.env.PROD && this.state.error && (
                <details className="text-left mb-6 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
                  <summary className="cursor-pointer font-semibold text-sm text-slate-700 dark:text-slate-300 mb-2">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-red-600 dark:text-red-400 font-mono overflow-auto">
                    <p className="mb-2 font-bold">{this.state.error.message}</p>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    {this.state.errorInfo && (
                      <pre className="mt-4 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={this.handleReset}>
                  Return to Home
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
