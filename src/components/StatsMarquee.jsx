import React, { useEffect, useRef } from 'react';
import { TrendingUp, Users, Heart, Award, DollarSign, Clock } from 'lucide-react';
import './StatsMarquee.css';

const StatsMarquee = () => {
  const marqueeRef = useRef(null);

  const stats = [
    {
      icon: Users,
      label: 'Active Users',
      value: '15,420',
      color: 'var(--primary-color)'
    },
    {
      icon: Heart,
      label: 'Families Helped',
      value: '3,240',
      color: 'var(--error-color)'
    },
    {
      icon: DollarSign,
      label: 'Total Assistance',
      value: '₹2.85M',
      color: 'var(--success-color)'
    },
    {
      icon: Award,
      label: 'Success Rate',
      value: '98.5%',
      color: 'var(--warning-color)'
    },
    {
      icon: Clock,
      label: 'Avg. Response Time',
      value: '2.3 hours',
      color: 'var(--secondary-color)'
    },
    {
      icon: TrendingUp,
      label: 'Monthly Growth',
      value: '+12.5%',
      color: 'var(--primary-color)'
    }
  ];

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const scrollSpeed = 1;
    let scrollPosition = 0;
    const maxScroll = marquee.scrollWidth / 2;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      if (scrollPosition >= maxScroll) {
        scrollPosition = 0;
      }
      marquee.scrollLeft = scrollPosition;
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="stats-marquee-section">
      <div className="container">
        <div className="marquee-header">
          <h2>Real-Time Impact</h2>
          <p>Live statistics showing our community's support and growth</p>
        </div>
        
        <div className="marquee-container" ref={marqueeRef}>
          <div className="marquee-content">
            {/* First set of stats */}
            {stats.map((stat, index) => (
              <div key={`first-${index}`} className="stat-card">
                <div className="stat-icon" style={{ color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
            
            {/* Duplicate set for seamless scrolling */}
            {stats.map((stat, index) => (
              <div key={`second-${index}`} className="stat-card">
                <div className="stat-icon" style={{ color: stat.color }}>
                  <stat.icon size={24} />
                </div>
                <div className="stat-info">
                  <div className="stat-value">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsMarquee;