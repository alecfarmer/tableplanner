import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-coral/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-coral" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-navy mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-500 mb-6">
              An unexpected error occurred. Your data is safely stored in your browser
              — try refreshing to get back on track.
            </p>
            {this.state.error && (
              <details className="text-left bg-gray-50 rounded-xl p-4 mb-6 text-xs text-gray-500">
                <summary className="cursor-pointer font-medium text-gray-600 mb-2">
                  Error details
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.message || String(this.state.error)}
                </pre>
              </details>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn-secondary flex items-center gap-2"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
