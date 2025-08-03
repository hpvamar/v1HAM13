import React, { useState } from 'react';
import { Linkedin, Twitter, Mail, Quote } from 'lucide-react';
import './FoundersSection.css';

const FoundersSection = () => {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleCard = (id) => {
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const founders = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      designation: 'Senior IAS Officer',
      department: 'Ministry of Home Affairs',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400',
      message: 'Every government servant deserves dignity and support. Savaan is our commitment to stand together as one family.',
      quote: 'सेवा परमो धर्मः - Service is the highest duty',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'rajesh.kumar@gov.in'
      }
    },
    {
      id: 2,
      name: 'Priya Sharma',
      designation: 'Additional Secretary',
      department: 'Ministry of Finance',
      image: 'https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=400',
      message: 'Having witnessed the struggles of families in crisis, I believe technology can bridge the gap between need and support.',
      quote: 'Innovation for humanity',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'priya.sharma@gov.in'
      }
    },
    {
      id: 3,
      name: 'Dr. Anil Gupta',
      designation: 'Joint Secretary',
      department: 'Ministry of Personnel',
      image: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400',
      message: 'Savaan represents the collective spirit of government employees - united in purpose, compassionate in action.',
      quote: 'Unity in service, strength in compassion',
      social: {
        linkedin: '#',
        twitter: '#',
        email: 'anil.gupta@gov.in'
      }
    }
  ];

  const handleCardClick = (founderId) => {
    toggleCard(founderId);
  };

  const handleSocialClick = (e) => {
    e.stopPropagation();
  };

  return (
    <section className="founders-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Meet Our Founders</h2>
          <p className="section-subtitle">
            Dedicated government servants who envisioned a platform where no family stands alone in times of need
          </p>
        </div>

        <div className="founders-grid">
          {founders.map((founder) => (
            <div key={founder.id} className="founder-card">
              <div 
                className={`card-inner ${flippedCards[founder.id] ? 'flipped' : ''}`}
                onClick={() => handleCardClick(founder.id)}
              >
                <div className="card-front">
                  <div className="founder-image-container">
                    <img 
                      src={founder.image} 
                      alt={founder.name}
                      className="founder-image"
                    />
                    <div className="image-overlay">
                      <Quote className="quote-icon" size={32} />
                    </div>
                  </div>
                  
                  <div className="founder-info">
                    <h3 className="founder-name">{founder.name}</h3>
                    <p className="founder-designation">{founder.designation}</p>
                    <p className="founder-department">{founder.department}</p>
                    
                    <div className="founder-quote">
                      <Quote className="quote-mark" size={16} />
                      <span>{founder.quote}</span>
                    </div>
                    
                    <div className="click-hint">
                      <span>Click to read message</span>
                    </div>
                  </div>
                </div>

                <div className="card-back">
                  <div className="founder-message">
                    <Quote className="message-quote" size={24} />
                    <p>{founder.message}</p>
                  </div>
                  
                  <div className="social-links">
                    <a href={founder.social.linkedin} className="social-link" onClick={handleSocialClick}>
                      <Linkedin size={20} />
                    </a>
                    <a href={founder.social.twitter} className="social-link" onClick={handleSocialClick}>
                      <Twitter size={20} />
                    </a>
                    <a href={`mailto:${founder.social.email}`} className="social-link" onClick={handleSocialClick}>
                      <Mail size={20} />
                    </a>
                  </div>
                  
                  <div className="click-hint">
                    <span>Click to go back</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="founders-cta">
          <div className="cta-content">
            <h3>Join Our Mission</h3>
            <p>Be part of a community that believes in collective support and shared responsibility</p>
            <button className="btn btn-primary">Get Involved</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FoundersSection;