import React, { useState, useEffect } from 'react';
import { 
  User, 
  LogOut, 
  Shield, 
  TrendingUp, 
  TrendingDown,
  Activity,
  FileText,
  Users,
  Heart,
  DollarSign,
  Clock,
  Bell,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
import Header from './Header';
import './Dashboard.css';

const Dashboard = ({ user, onLogout, darkMode, toggleDarkMode }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const quickStats = [
    {
      icon: FileText,
      label: 'Active Claims',
      value: '2',
      trend: { value: '+1', direction: 'up' }
    },
    {
      icon: Heart,
      label: 'Contributions',
      value: '₹15,000',
      trend: { value: '+5%', direction: 'up' }
    },
    {
      icon: Users,
      label: 'Network Size',
      value: '1,247',
      trend: { value: '+12', direction: 'up' }
    },
    {
      icon: Shield,
      label: 'Trust Score',
      value: '98.5%',
      trend: { value: '+0.5%', direction: 'up' }
    }
  ];

  const recentActivities = [
    {
      icon: Plus,
      title: 'New contribution received',
      time: '2 hours ago',
      color: 'var(--success-color)'
    },
    {
      icon: FileText,
      title: 'Claim status updated',
      time: '5 hours ago',
      color: 'var(--primary-color)'
    },
    {
      icon: Users,
      title: 'New member joined your network',
      time: '1 day ago',
      color: 'var(--secondary-color)'
    },
    {
      icon: Bell,
      title: 'Monthly report generated',
      time: '2 days ago',
      color: 'var(--warning-color)'
    }
  ];

  const quickActions = [
    {
      icon: Plus,
      title: 'Submit New Claim',
      description: 'Request financial assistance',
      color: 'var(--primary-color)'
    },
    {
      icon: Heart,
      title: 'Make Contribution',
      description: 'Support a family in need',
      color: 'var(--success-color)'
    },
    {
      icon: Users,
      title: 'Invite Members',
      description: 'Expand your support network',
      color: 'var(--warning-color)'
    },
    {
      icon: Settings,
      title: 'Update Profile',
      description: 'Manage your information',
      color: 'var(--secondary-color)'
    }
  ];

  return (
    <div className="dashboard">
      <Header 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        user={user}
        onLogout={onLogout}
      />
      <div className="dashboard-container">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div className="welcome-header">
            <div className="welcome-content">
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <div className="welcome-text">
                <h1>Welcome, {user.name}</h1>
                {getPaymentStatusDisplay()}
                <div className="user-badge">
                  <Shield size={16} />
                  <span>Verified Government Employee</span>
                </div>
              </div>
            </div>
            <div className="welcome-actions">
              <div className="current-time">
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {formatDate(currentTime)}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formatTime(currentTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Fee Payment Card */}
        {managementFeeStatus && (!managementFeeStatus.paid || managementFeeStatus.isExpired) && (
          <div className="payment-card">
            <div className="payment-card-content">
              <div className="payment-icon">
                <CreditCard size={32} />
              </div>
              <div className="payment-info">
                <h3>Annual Management Fee</h3>
                <p>Pay ₹499 to become a full member and access all features</p>
                {paymentMessage && (
                  <div className={`payment-message ${paymentMessage.includes('successful') ? 'success' : 'error'}`}>
                    {paymentMessage.includes('successful') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{paymentMessage}</span>
                  </div>
                )}
              </div>
              <div className="payment-action">
                <button 
                  className="payment-btn"
                  onClick={handlePaymentClick}
                  disabled={isProcessingPayment}
                >
                  {isProcessingPayment ? 'Processing...' : 'Pay ₹499'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="quick-stats">
          {quickStats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">
                  <stat.icon size={24} />
                </div>
                <div className={`stat-trend trend-${stat.trend.direction}`}>
                  {stat.trend.direction === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{stat.trend.value}</span>
                </div>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Recent Activity */}
          <div className="activity-section">
            <div className="section-header">
              <h3 className="section-title">
                <Activity size={20} />
                Recent Activity
              </h3>
            </div>
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ background: activity.color }}>
                    <activity.icon size={20} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <div className="section-header">
              <h3 className="section-title">
                <Settings size={20} />
                Quick Actions
              </h3>
            </div>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button key={index} className="action-btn">
                  <div className="action-icon" style={{ background: action.color }}>
                    <action.icon size={20} />
                  </div>
                  <div className="action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="profile-summary">
          <div className="section-header">
            <h3 className="section-title">
              <User size={20} />
              Profile Summary
            </h3>
          </div>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="profile-label">Department</span>
              <span className="profile-value">{user.department}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Department ID</span>
              <span className="profile-value">{user.departmentId}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Email</span>
              <span className="profile-value">{user.email}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Mobile</span>
              <span className="profile-value">+91 {user.mobile}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Post</span>
              <span className="profile-value">{user.post}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">District</span>
              <span className="profile-value">{user.district}</span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Member Since</span>
              <span className="profile-value">
                {new Date(user.registrationDate || user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="profile-item">
              <span className="profile-label">Status</span>
              <span className="profile-value" style={{ 
                color: user.status === 'active' ? 'var(--success-color)' : 'var(--warning-color)',
                textTransform: 'capitalize'
              }}>
                {user.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;