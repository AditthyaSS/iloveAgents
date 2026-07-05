import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl my-4 text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h3 className="text-xl font-bold text-red-400 mb-2">Failed to render output</h3>
          <p className="dark:text-text-secondary text-gray-600 text-sm mb-4">
            The AI generated content that our renderer could not process.
          </p>
          <pre className="text-left dark:bg-surface-card bg-white p-4 rounded-lg text-xs text-red-300 overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.toString() || 'Unknown rendering error'}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
