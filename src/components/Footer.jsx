import React from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  Shield,
  Heart,
  Users,
  FileText
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const quickLinks = [
    { name: 'Rules & Guidelines', href: '#rules', icon: FileText },
    { name: 'Submit Claim', href: '#claims', icon: Send },
    { name: 'About Savaan', href: '#about', icon: Heart },
    { name: 'Contact Support', href: '#contact', icon: Phone },
    { name: 'Privacy Policy', href: '#privacy', icon: Shield },
    { name: 'Terms of Service', href: '#terms', icon: FileText }
  ];

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: Facebook, color: '#1877F2' },
    { name: 'Twitter', href: '#', icon: Twitter, color: '#1DA1F2' },
    { name: 'Instagram', href: '#', icon: Instagram, color: '#E4405F' },
    { name: 'LinkedIn', href: '#', icon: Linkedin, color: '#0A66C2' }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription');
  };

  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            {/* Company Info */}
            <div className="footer-section">
              <div className="footer-brand">
                <h3>Savaan</h3>
                <p className="brand-tagline">Supporting Government Families</p>
              </div>
              <p className="footer-description">
                Dedicated to providing financial assistance and emotional support to the families 
                of deceased government employees. Together, we stand as one family in times of need.
              </p>
              <div className="government-badge">
                <Shield className="badge-icon" size={16} />
                <span>Government of India Verified</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="footer-link">
                      <link.icon size={16} />
                      <span>{link.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="footer-section">
              <h4>Contact Us</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail className="contact-icon" size={18} />
                  <div>
                    <p>support@savaan.gov.in</p>
                    <p>info@savaan.gov.in</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone className="contact-icon" size={18} />
                  <div>
                    <p>+91 11 2345 6789</p>
                    <p>Helpline: 1800-123-4567</p>
                  </div>
                </div>
                <div className="contact-item">
                  <MapPin className="contact-icon" size={18} />
                  <div>
                    <p>Savaan Foundation</p>
                    <p>Government Employee Welfare Block</p>
                    <p>New Delhi - 110001</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="footer-section">
              <h4>Stay Connected</h4>
              <p className="newsletter-description">
                Subscribe to our newsletter for updates on new features, success stories, and community news.
              </p>
              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <div className="newsletter-input">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <button type="submit" className="newsletter-btn">
                  <Send size={18} />
                </button>
              </form>
              
              <div className="social-links">
                <h5>Follow Us</h5>
                <div className="social-icons">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="social-link"
                      style={{ '--social-color': social.color }}
                      title={social.name}
                    >
                      <social.icon size={20} />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <div className="footer-stats">
              <div className="stat">
                <Users size={16} />
                <span>15K+ Users</span>
              </div>
              <div className="stat">
                <Heart size={16} />
                <span>3K+ Families Helped</span>
              </div>
              <div className="stat">
                <Shield size={16} />
                <span>100% Secure</span>
              </div>
            </div>
            
            <div className="footer-legal">
              <p>&copy; 2024 Savaan. All rights reserved.</p>
              <div className="legal-links">
                <a href="#privacy">Privacy Policy</a>
                <a href="#terms">Terms of Service</a>
                <a href="#cookies">Cookie Policy</a>
              </div>
            </div>
            
            <div className="footer-badge">
              <p>Made with ❤️ for Government Employees</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;