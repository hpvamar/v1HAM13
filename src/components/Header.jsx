import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, User, ChevronDown, LogOut, Phone, Mail, MapPin, Building2, Hash, Calendar, Shield } from 'lucide-react';
import AuthTabs from './AuthTabs';
import './Header.css';

const Header = ({ darkMode, toggleDarkMode, onLogin, user = null, onLogout = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLoginClick = () => {
    setShowLoginPopup(true);
  };

  const closeLoginPopup = () => {
    setShowLoginPopup(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navItems = [
    { name: 'Rules', href: '#rules' },
    { name: 'Claims', href: '#claims' },
    { name: 'About Us', href: '#about' },
    { name: 'Contact Us', href: '#contact' }
  ];

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <nav className="navbar">
            {/* Logo */}
            <div className="logo">
              <div className="logo-icon">
                <div className="logo-symbol">S</div>
              </div>
              <div className="logo-text">
                <h1>Savaan</h1>
                <span className="tagline">Supporting Government Families</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="nav-links">
              {navItems.map((item, index) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="nav-link"
                  style={{ '--delay': `${index * 0.1}s` }}
                >
                  <span>{item.name}</span>
                </a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="nav-actions">
              {user ? (
                <div className="profile-dropdown-container">
                  <button className="profile-btn" onClick={toggleProfileDropdown}>
                    <div className="profile-avatar">
                      {getInitials(user.name)}
                    </div>
                    <span className="profile-name">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={16} className={`dropdown-arrow ${showProfileDropdown ? 'rotated' : ''}`} />
                  </button>
                  
                  {showProfileDropdown && (
                    <div className="profile-dropdown">
                      <div className="profile-dropdown-header">
                        <div className="profile-avatar-large">
                          {getInitials(user.name)}
                        </div>
                        <div className="profile-info">
                          <h4>{user.name}</h4>
                          <p>{user.email}</p>
                          <div className="profile-badge">
                            <Shield size={12} />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="profile-dropdown-content">
                        <div className="profile-section">
                          <h5>Personal Information</h5>
                          <div className="profile-details">
                            <div className="profile-detail">
                              <User size={14} />
                              <span>Name: {user.name}</span>
                            </div>
                            <div className="profile-detail">
                              <Mail size={14} />
                              <span>Email: {user.email}</span>
                            </div>
                            <div className="profile-detail">
                              <Phone size={14} />
                              <span>Mobile: +91 {user.mobile}</span>
                            </div>
                            <div className="profile-detail">
                              <Calendar size={14} />
                              <span>DOB: {formatDate(user.dob)}</span>
                            </div>
                            {user.bloodGroup && (
                              <div className="profile-detail">
                                <Shield size={14} />
                                <span>Blood Group: {user.bloodGroup}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="profile-section">
                          <h5>Job Information</h5>
                          <div className="profile-details">
                            <div className="profile-detail">
                              <Building2 size={14} />
                              <span>Department: {user.department}</span>
                            </div>
                            <div className="profile-detail">
                              <Hash size={14} />
                              <span>ID: {user.departmentId}</span>
                            </div>
                            <div className="profile-detail">
                              <MapPin size={14} />
                              <span>Post: {user.post}</span>
                            </div>
                            <div className="profile-detail">
                              <MapPin size={14} />
                              <span>District: {user.district}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="profile-section">
                          <h5>Nominees</h5>
                          <div className="profile-details">
                            <div className="profile-detail">
                              <User size={14} />
                              <span>Primary: {user.firstNominee?.name} ({user.firstNominee?.relation})</span>
                            </div>
                            {user.secondNominee?.name && (
                              <div className="profile-detail">
                                <User size={14} />
                                <span>Secondary: {user.secondNominee.name} ({user.secondNominee.relation})</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="profile-section">
                          <h5>Account Details</h5>
                          <div className="profile-details">
                            <div className="profile-detail">
                              <Calendar size={14} />
                              <span>Joined: {formatDate(user.registrationDate || user.createdAt)}</span>
                            </div>
                            <div className="profile-detail">
                              <Shield size={14} />
                              <span>Status: {user.status || 'Active'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="profile-dropdown-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button className="auth-btn" onClick={handleLoginClick}>
                  <User size={18} />
                  <span>Login / Sign Up</span>
                  <div className="btn-glow"></div>
                </button>
              )}
              
              <button className="theme-toggle" onClick={toggleDarkMode}>
                <div className="toggle-track">
                  <div className="toggle-thumb">
                    {darkMode ? <Moon size={14} /> : <Sun size={14} />}
                  </div>
                </div>
              </button>

              {/* Mobile Menu Button */}
              <button className="mobile-menu-btn" onClick={toggleMenu}>
                <div className="hamburger">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </button>
            </div>
          </nav>

          {/* Mobile Navigation */}
          <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
            <div className="mobile-nav-content">
              {navItems.map((item, index) => (
                <a 
                  key={item.name} 
                  href={item.href} 
                  className="mobile-nav-link" 
                  onClick={toggleMenu}
                  style={{ '--delay': `${index * 0.1}s` }}
                >
                  {item.name}
                </a>
              ))}
              <div className="mobile-auth-section">
                {user ? (
                  <button className="mobile-auth-btn" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button className="mobile-auth-btn" onClick={handleLoginClick}>
                    <User size={18} />
                    <span>Login / Sign Up</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Login Popup */}
      {showLoginPopup && !user && (
        <div className="login-popup-overlay" onClick={closeLoginPopup}>
          <div className="login-popup" onClick={(e) => e.stopPropagation()}>
            <div className="login-popup-header">
              <h2>Welcome to Savaan</h2>
              <button className="popup-close-btn" onClick={closeLoginPopup}>
                <X size={24} />
              </button>
            </div>
            <div className="login-popup-content">
              <AuthTabs isPopup={true} onClose={closeLoginPopup} onLogin={onLogin} />
            </div>
          </div>
          onRegistrationSuccess={(userData, token) => {
            setShowRegistrationPopup(false);
            if (onLogin) {
              onLogin(userData, token);
            }
          }}
        </div>
      )}
    </>
  );
};

export default Header;