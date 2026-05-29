import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console for debugging
    console.error("Agent Component Error Caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when an agent crashes
      return (
        <div style={{ padding: '1rem', border: '1px solid red', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#991b1b' }}>
          <h4>⚠️ Failed to load agent UI</h4>
          <p style={{ fontSize: '14px' }}>{this.state.error?.message || "An unexpected rendering error occurred."}</p>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
