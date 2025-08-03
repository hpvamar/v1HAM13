import React, { useState, useEffect } from 'react';
import { Shield, Users, Heart, TrendingUp } from 'lucide-react';
import AuthTabs from './AuthTabs';
import './HeroSection.css';

const HeroSection = ({ onLogin }) => {
  const [stats, setStats] = useState({
    users: 0,
    helped: 0,
    requests: 0
  });

  // Animated counters
  useEffect(() => {
    const targetStats = {
      users: 15420,
      helped: 2850000,
      requests: 342
    };

    const animateCounter = (key, target, duration = 2000) => {
      const start = 0;
      const increment = target / (duration / 16);
      
      const timer = setInterval(() => {
        setStats(prev => {
          const newValue = prev[key] + increment;
          if (newValue >= target) {
            clearInterval(timer);
            return { ...prev, [key]: target };
          }
          return { ...prev, [key]: Math.floor(newValue) };
        });
      }, 16);
    };

    const timeout = setTimeout(() => {
      animateCounter('users', targetStats.users);
      animateCounter('helped', targetStats.helped);
      animateCounter('requests', targetStats.requests);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="gradient-overlay"></div>
        <div className="pattern-overlay"></div>
      </div>
      
      <div className="container">
        <div className="hero-content">
          {/* Left Side - Emotional Message */}
          <div className="hero-left animate-fadeInLeft">
            <div className="hero-badge">
              <Shield className="badge-icon" size={16} />
              <span>Government Verified Platform</span>
            </div>
            
            <h1 className="hero-title">
              Standing Together in Times of Loss
            </h1>
            
            <p className="hero-description">
              Savaan is a dedicated platform created by government employees to support 
              the families of their fellow colleagues after an unfortunate demise. We 
              believe in the power of unity and compassion during life's most challenging moments.
            </p>
            
            {/* Live Stats */}
            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{formatNumber(stats.users)}</div>
                  <div className="stat-label">Registered Users</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <Heart size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">₹{formatNumber(stats.helped)}</div>
                  <div className="stat-label">Families Helped</div>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.requests}</div>
                  <div className="stat-label">Active Requests</div>
                </div>
              </div>
            </div>
            
            <div className="hero-quote">
              <blockquote>
                "एक साथी गया, हजार साथ बने।"
              </blockquote>
              <cite>- Our Mission</cite>
            </div>
            
            <div className="hero-verification">
              <Shield className="verification-icon" size={20} />
              <span>Verified by Government of India</span>
            </div>
          </div>
          
          {/* Right Side - Auth Forms */}
          <div className="hero-right animate-fadeInRight">
            {!onLogin ? (
              <AuthTabs />
            ) : (
              <AuthTabs onLogin={onLogin} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;