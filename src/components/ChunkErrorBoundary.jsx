import React from 'react';

export class ChunkErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '', retryCount: 0 };
    this.maxRetries = 3;
  }

  static getDerivedStateFromError(error) {
    // Check if this is a chunk loading error
    const isChunkError = 
      error.message?.includes('Failed to fetch') ||
      error.message?.includes('dynamically imported module') ||
      error.message?.includes('404') ||
      error.code === 'CHUNK_LOAD_ERROR' ||
      error.statusCode === 404;

    if (isChunkError) {
      return { 
        hasError: true, 
        errorMessage: error.message || 'Failed to load page component. Retrying...' 
      };
    }
    
    // Not a chunk error, re-throw
    throw error;
  }

  componentDidCatch(error, errorInfo) {
    // Log error info for debugging
    console.error('Chunk loading error:', error, errorInfo);

    // Retry logic
    if (this.state.retryCount < this.maxRetries) {
      setTimeout(() => {
        this.setState(prevState => ({
          retryCount: prevState.retryCount + 1,
          hasError: false
        }));
      }, 1000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  }

  handleManualRetry = () => {
    this.setState({ 
      hasError: false, 
      retryCount: 0
    });
    // Force a page reload as last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isMaxRetriesReached = this.state.retryCount >= this.maxRetries;

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              textAlign: 'center',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                marginBottom: '20px',
                color: '#ff6b6b',
              }}
            >
              ⚠️
            </div>
            <h2 style={{ color: '#333', marginBottom: '10px' }}>
              Failed to Load Component
            </h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
              {isMaxRetriesReached
                ? 'The page failed to load after multiple attempts. This may be due to a network issue or deployment problem.'
                : `Attempting to reload component (Attempt ${this.state.retryCount + 1} of ${this.maxRetries})...`}
            </p>

            {isMaxRetriesReached && (
              <div>
                <button
                  onClick={this.handleManualRetry}
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    marginRight: '10px',
                  }}
                >
                  Reload Page
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  style={{
                    backgroundColor: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Go Home
                </button>
              </div>
            )}

            {!isMaxRetriesReached && (
              <div
                style={{
                  marginTop: '20px',
                  display: 'inline-block',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto',
                  }}
                />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            <div style={{ marginTop: '30px', fontSize: '12px', color: '#999' }}>
              <details style={{ cursor: 'pointer' }}>
                <summary>Technical Details</summary>
                <pre
                  style={{
                    textAlign: 'left',
                    backgroundColor: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '150px',
                    marginTop: '10px',
                  }}
                >
                  {this.state.errorMessage}
                </pre>
              </details>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChunkErrorBoundary;
