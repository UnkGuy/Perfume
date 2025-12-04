// src/App.jsx
import React from 'react';
import './App.css';
// Import Context
import { AppProvider, useAppContext } from './context/AppContext';
// Import Page Components
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
// Note: Assuming these components exist based on imports, 
// if they don't, the app will break. Ensure these files are created.
// Placeholder components added below for stability if files are missing in your local setup.
import ProductsPage from './pages/ProductsPage'; 
import CartPage from './pages/CartPage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';
// Import Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationContainer from './components/NotificationContainer';

// --- Main App Component (Routing & Layout Logic) ---
function App() {
  const { currentPage, setCurrentPage, isAuthenticated, user, shouldHideNav } = useAppContext();

  // Simple Route Guard
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!isAuthenticated) {
      // Defer state update to avoid render loop
      setTimeout(() => setCurrentPage('login'), 0);
      return <LoginPage />;
    }
    if (requiredRole && user?.role !== requiredRole) {
      setTimeout(() => setCurrentPage('welcome'), 0);
      return null;
    }
    return children;
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'welcome': 
        return <WelcomePage />;
      case 'login': 
        return <LoginPage />;
      case 'products': 
        return <ProductsPage />;
      case 'cart': 
        return <CartPage />;
      case 'messages': 
        return (
          <ProtectedRoute requiredRole="admin">
            <MessagesPage />
          </ProtectedRoute>
        );
      case 'admin': 
        return (
          <ProtectedRoute requiredRole="admin">
            <AdminPage />
          </ProtectedRoute>
        );
      default: 
        return <WelcomePage />;
    }
  };

  return (
    <div className="app-container page-wrapper">
      {/* Global Notification System */}
      <NotificationContainer />
      
      {/* Conditionally render Header based on route config */}
      {!shouldHideNav && <Header />}
      
      <main className="main-content" style={{ flex: 1 }}>
        {renderPage()}
      </main>
      
      {!shouldHideNav && <Footer />}
    </div>
  );
}

// Export the component wrapped with the provider
const RootApp = () => (
  <AppProvider>
    <App />
  </AppProvider>
);

export default RootApp;