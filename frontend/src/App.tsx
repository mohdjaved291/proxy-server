import { UnifiedProxyComponent } from './components/UnifiedProxyComponent';

/**
 * App Component
 * 
 * Root component of the application that provides:
 * - Responsive container layout
 * - Background styling
 * - Central content positioning
 * 
 * Features:
 * - Full-height background
 * - Centered content container
 * - Responsive padding
 * - Vertical spacing management
**/

function App() {
  return (
    // Full-height container with light background
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Centered content container with max width */}
      <div className="container max-w-4xl mx-auto px-4">
        {/* Vertical spacing for content */}
        <div className="space-y-8">
          {/* Main proxy interface component */}
          <UnifiedProxyComponent />
        </div>
      </div>
    </div>
  );
}

export default App;
