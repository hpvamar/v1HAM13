import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StatsMarquee from './components/StatsMarquee';
import FoundersSection from './components/FoundersSection';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import { getUserFromToken, isAuthenticated, logout } from './utils/auth';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);

  useEffect(() => {
    // Check for stored redirect path
    const redirectPath = sessionStorage.getItem('redirectPath');
    if (redirectPath) {
      sessionStorage.removeItem('redirectPath');
      setCurrentRoute(redirectPath);
      window.history.replaceState({}, '', redirectPath);
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const userData = await getUserFromToken();
        if (userData) {
          setUser(userData);
          // Only redirect to dashboard if user is already on dashboard route
          if (window.location.pathname === '/v1/ham/userDashboard') {
            setCurrentRoute('/v1/ham/userDashboard');
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for browser back/forward navigation
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(path);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Handle route protection
  useEffect(() => {
    if (!user && currentRoute === '/v1/ham/userDashboard') {
      setCurrentRoute('/');
      window.history.pushState({}, '', '/');
    }
  }, [user, currentRoute]);

  // Update route when URL changes
  useEffect(() => {
    const handleRouteChange = () => {
      const path = window.location.pathname;
      if (path !== currentRoute) {
        setCurrentRoute(path);
      }
    };

    // Check for route changes periodically (for direct URL access)
    const interval = setInterval(handleRouteChange, 100);
    
    return () => {
      clearInterval(interval);
    };
  }, [currentRoute]);

  // Handle direct URL access to dashboard
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/v1/ham/userDashboard' && !user && !isLoading) {
      // User is trying to access dashboard without being logged in
      setCurrentRoute('/');
      window.history.pushState({}, '', '/');
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const navigateTo = (path) => {
    setCurrentRoute(path);
    window.history.pushState({}, '', path);
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    const dashboardPath = '/v1/ham/userDashboard';
    navigateTo(dashboardPath);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    navigateTo('/');
  };

  // Determine what to render based on current route and user state
  const shouldShowDashboard = () => {
    return currentRoute === '/v1/ham/userDashboard' && user;
  };

  const shouldShowHomePage = () => {
    return !shouldShowDashboard();
  };

  if (isLoading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: 'var(--text-primary)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {shouldShowDashboard() ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          darkMode={darkMode} 
          toggleDarkMode={toggleDarkMode} 
        />
      ) : (
        <>
          <Header 
            darkMode={darkMode} 
            toggleDarkMode={toggleDarkMode} 
            onLogin={handleLogin}
            user={user}
            onLogout={handleLogout}
          />
          <main>
            <HeroSection onLogin={handleLogin} />
            <StatsMarquee />
            <FoundersSection />
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}

export default App;