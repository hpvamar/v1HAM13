import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, Shield, Building2, Hash, X, ArrowLeft } from 'lucide-react';
import RegistrationPopup from './RegistrationPopup';
import './AuthTabs.css';

const AuthTabs = ({ isPopup = false, onClose = null, onLogin = null }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('mobile'); // 'mobile', 'otp', 'newPassword'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: '',
    name: '',
    phone: '',
    departmentId: '',
    emailOrMobile: '',
    forgotMobile: '',
    otp: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [showRegistrationPopup, setShowRegistrationPopup] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const validateEmailOrMobile = (value) => {
    // Check if it's an email or mobile number
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    return emailRegex.test(value) || phoneRegex.test(value);
  };

  const validateForm = (tab) => {
    const newErrors = {};
    
    if (tab === 'login') {
      if (!formData.departmentId) newErrors.departmentId = 'Department Unique ID is required';
      else if (formData.departmentId.length < 3) newErrors.departmentId = 'Department ID must be at least 3 characters';
      
      if (!formData.emailOrMobile) newErrors.emailOrMobile = 'Email or Mobile Number is required';
      else if (!validateEmailOrMobile(formData.emailOrMobile)) newErrors.emailOrMobile = 'Invalid email or mobile number format';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (tab === 'register') {
      if (!formData.name) newErrors.name = 'Name is required';
      else if (formData.name.length < 2) newErrors.name = 'Name must be at least 2 characters';
      
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
      
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      else if (!validatePhone(formData.phone)) newErrors.phone = 'Invalid phone number';
      
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
      else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (tab === 'forgot') {
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!validateEmail(formData.email)) newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginUser = async (loginData) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Login successful:', result);
        // Handle successful login (e.g., store token, redirect)
        localStorage.setItem('authToken', result.token);
        
        // Call the onLogin callback with user data
        if (onLogin) {
          onLogin(result.user, result.token);
        }
        
        // Always close popup after successful login
        if (onClose) {
          onClose();
        }
      } else {
        console.error('Login failed:', result);
        setErrors({ general: result.message || 'Login failed. Please try again.' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    }
  };

  const forgotPassword = async (mobile) => {
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('OTP sent successfully to:', mobile);
        setForgotStep('otp');
        startOtpTimer();
      } else {
        setErrors({ forgotMobile: result.message || 'Failed to send OTP. Please try again.' });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ forgotMobile: 'Network error. Please check your connection and try again.' });
    }
  };

  const createNewPassword = async (mobile, otp, newPassword) => {
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mobile, otp, newPassword })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Password reset successful:', result);
        setShowForgotModal(false);
        setForgotStep('mobile');
        setFormData(prev => ({ ...prev, forgotMobile: '', otp: '', newPassword: '' }));
        setErrors({});
        // Show success message or redirect
        alert('Password reset successful! You can now login with your new password.');
      } else {
        console.error('Password reset failed:', result);
        setErrors({ general: result.message || 'Failed to reset password. Please try again.' });
      }
    } catch (error) {
      console.error('Create new password error:', error);
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    const timer = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    if (forgotStep === 'mobile') {
      if (!formData.forgotMobile) {
        setErrors({ forgotMobile: 'Mobile number is required' });
      } else if (!/^\d{10}$/.test(formData.forgotMobile)) {
        setErrors({ forgotMobile: 'Mobile number must be exactly 10 digits' });
      } else if (!validatePhone(formData.forgotMobile)) {
        setErrors({ forgotMobile: 'Invalid mobile number format' });
      } else {
        await forgotPassword(formData.forgotMobile);
      }
    } else if (forgotStep === 'otp') {
      if (!formData.otp) {
        setErrors({ otp: 'OTP is required' });
      } else if (formData.otp.length !== 6) {
        setErrors({ otp: 'OTP must be 6 digits' });
      } else {
        // For demo purposes, check hardcoded values
        if (formData.otp === '123456') {
          setForgotStep('newPassword');
        } else {
          setErrors({ otp: 'Invalid OTP. Please try again.' });
        }
      }
    } else if (forgotStep === 'newPassword') {
      if (!formData.newPassword) {
        setErrors({ newPassword: 'New password is required' });
      } else if (formData.newPassword.length < 6) {
        setErrors({ newPassword: 'Password must be at least 6 characters' });
      } else {
        await createNewPassword(formData.forgotMobile, formData.otp, formData.newPassword);
      }
    }

    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    if (validateForm(activeTab)) {
      if (activeTab === 'login') {
        const loginData = {
          departmentId: formData.departmentId,
          emailOrMobile: formData.emailOrMobile,
          password: formData.password
        };
        
        await loginUser(loginData);
      } else if (activeTab === 'register') {
        console.log('Form submitted:', { tab: activeTab, data: formData });
        // Handle other form submissions (register, forgot password)
      }
    }
    
    setIsLoading(false);
  };

  // Optimized input change handler to prevent unnecessary re-renders
  const handleInputChange = React.useCallback((e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      // Only update if value actually changed
      if (prev[name] === value) return prev;
      return { ...prev, [name]: value };
    });
    
    // Clear error when user starts typing
    setErrors(prev => {
      if (!prev[name]) return prev;
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const tabs = [
    { id: 'login', label: 'Login', icon: Lock }
  ];

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('mobile');
    setFormData(prev => ({ ...prev, forgotMobile: '', otp: '', newPassword: '' }));
    setErrors({});
    setOtpTimer(0);
  };

  // Memoize AuthContent to prevent unnecessary re-renders
  const AuthContent = React.useMemo(() => (
    <div className={`auth-card ${isPopup ? 'popup-auth-card' : ''}`}>
      <div className="auth-header">
        <h2>Log In to Continue</h2>
        <p>Access Your Dashboard</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {activeTab === 'login' && (
          <div className="form-content">
            {errors.general && (
              <div className="error-message general-error">
                {errors.general}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="departmentId">Department Unique ID</label>
              <div className="input-wrapper">
                <Building2 className="input-icon" size={18} />
                <input
                  type="text"
                  id="departmentId"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  placeholder="Enter your department ID"
                  className={errors.departmentId ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
              {errors.departmentId && <span className="error-message">{errors.departmentId}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="emailOrMobile">Email ID / Mobile Number</label>
              <div className="input-wrapper">
                <Hash className="input-icon" size={18} />
                <input
                  type="text"
                  id="emailOrMobile"
                  name="emailOrMobile"
                  value={formData.emailOrMobile}
                  onChange={handleInputChange}
                  placeholder="Enter email or mobile number"
                  className={errors.emailOrMobile ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.emailOrMobile && <span className="error-message">{errors.emailOrMobile}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <button 
                type="button" 
                className="forgot-link" 
                onClick={() => setShowForgotModal(true)}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <div className="register-prompt">
              <p>Don't have an account?</p>
              <button 
                type="button" 
                className="register-new-user-btn"
                onClick={() => setShowRegistrationPopup(true)}
                disabled={isLoading}
              >
                Register New User
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  ), [
    isPopup, 
    activeTab, 
    formData.departmentId, 
    formData.emailOrMobile, 
    formData.password, 
    errors, 
    isLoading, 
    showPassword, 
    handleInputChange, 
    handleSubmit
  ]);

  if (isPopup) {
    return (
      <>
        {AuthContent}
        
        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="modal-overlay" onClick={closeForgotModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {forgotStep === 'mobile' && 'Reset Password'}
                  {forgotStep === 'otp' && 'Verify OTP'}
                  {forgotStep === 'newPassword' && 'Create New Password'}
                </h3>
                <button className="modal-close" onClick={closeForgotModal}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleForgotSubmit}>
                {errors.general && (
                  <div className="error-message general-error">
                    {errors.general}
                  </div>
                )}

                {forgotStep === 'mobile' && (
                  <div className="modal-body">
                    <p className="modal-description">
                      Enter your 10-digit mobile number to receive an OTP for password reset.
                    </p>
                    <div className="form-group">
                      <label htmlFor="forgotMobile">Mobile Number</label>
                      <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <span className="country-code">+91</span>
                        <input
                          type="tel"
                          id="forgotMobile"
                          name="forgotMobile"
                          value={formData.forgotMobile}
                          onChange={handleInputChange}
                          placeholder="Enter 10-digit mobile number"
                          maxLength="10"
                          className={errors.forgotMobile ? 'error' : ''}
                          disabled={isLoading}
                          autoComplete="tel"
                        />
                      </div>
                      {errors.forgotMobile && <span className="error-message">{errors.forgotMobile}</span>}
                    </div>
                  </div>
                )}

                {forgotStep === 'otp' && (
                  <div className="modal-body">
                    <p className="modal-description">
                      Enter the 6-digit OTP sent to +91 {formData.forgotMobile}
                    </p>
                    <div className="form-group">
                      <label htmlFor="otp">Enter OTP</label>
                      <div className="input-wrapper">
                        <Shield className="input-icon" size={18} />
                        <input
                          type="text"
                          id="otp"
                          name="otp"
                          value={formData.otp}
                          onChange={handleInputChange}
                          placeholder="Enter 6-digit OTP"
                          maxLength="6"
                          className={errors.otp ? 'error' : ''}
                          disabled={isLoading}
                          autoComplete="one-time-code"
                        />
                      </div>
                      {errors.otp && <span className="error-message">{errors.otp}</span>}
                    </div>
                    
                    <div className="otp-timer">
                      {otpTimer > 0 ? (
                        <span>Resend OTP in {otpTimer}s</span>
                      ) : (
                        <button 
                          type="button" 
                          className="resend-otp-btn"
                          onClick={() => forgotPassword(formData.forgotMobile)}
                          disabled={isLoading}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                    
                    <button 
                      type="button" 
                      className="back-btn"
                      onClick={() => setForgotStep('mobile')}
                      disabled={isLoading}
                    >
                      <ArrowLeft size={16} />
                      Change Mobile Number
                    </button>
                  </div>
                )}

                {forgotStep === 'newPassword' && (
                  <div className="modal-body">
                    <p className="modal-description">
                      Create a new password for your account.
                    </p>
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          id="newPassword"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                          className={errors.newPassword ? 'error' : ''}
                          disabled={isLoading}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={isLoading}
                          tabIndex={-1}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 
                      forgotStep === 'mobile' ? 'Send OTP' :
                      forgotStep === 'otp' ? 'Verify OTP' :
                      'Reset Password'
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <RegistrationPopup 
          isOpen={showRegistrationPopup} 
          onClose={() => setShowRegistrationPopup(false)} 
        />
      </>
    );
  }

  return (
    <>
      <div className="auth-container">
        {AuthContent}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={closeForgotModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {forgotStep === 'mobile' && 'Reset Password'}
                {forgotStep === 'otp' && 'Verify OTP'}
                {forgotStep === 'newPassword' && 'Create New Password'}
              </h3>
              <button className="modal-close" onClick={closeForgotModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleForgotSubmit}>
              {errors.general && (
                <div className="error-message general-error">
                  {errors.general}
                </div>
              )}

              {forgotStep === 'mobile' && (
                <div className="modal-body">
                  <p className="modal-description">
                    Enter your 10-digit mobile number to receive an OTP for password reset.
                  </p>
                  <div className="form-group">
                    <label htmlFor="forgotMobile">Mobile Number</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        id="forgotMobile"
                        name="forgotMobile"
                        value={formData.forgotMobile}
                        onChange={handleInputChange}
                        placeholder="Enter 10-digit mobile number"
                        maxLength="10"
                        className={errors.forgotMobile ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="tel"
                      />
                    </div>
                    {errors.forgotMobile && <span className="error-message">{errors.forgotMobile}</span>}
                  </div>
                </div>
              )}

              {forgotStep === 'otp' && (
                <div className="modal-body">
                  <p className="modal-description">
                    Enter the 6-digit OTP sent to +91 {formData.forgotMobile}
                  </p>
                  <div className="form-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <div className="input-wrapper">
                      <Shield className="input-icon" size={18} />
                      <input
                        type="text"
                        id="otp"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        className={errors.otp ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="one-time-code"
                      />
                    </div>
                    {errors.otp && <span className="error-message">{errors.otp}</span>}
                  </div>
                  
                  <div className="otp-timer">
                    {otpTimer > 0 ? (
                      <span>Resend OTP in {otpTimer}s</span>
                    ) : (
                      <button 
                        type="button" 
                        className="resend-otp-btn"
                        onClick={() => forgotPassword(formData.forgotMobile)}
                        disabled={isLoading}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  
                  <button 
                    type="button" 
                    className="back-btn"
                    onClick={() => setForgotStep('mobile')}
                    disabled={isLoading}
                  >
                    <ArrowLeft size={16} />
                    Change Mobile Number
                  </button>
                </div>
              )}

              {forgotStep === 'newPassword' && (
                <div className="modal-body">
                  <p className="modal-description">
                    Create a new password for your account.
                  </p>
                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <div className="input-wrapper">
                      <Lock className="input-icon" size={18} />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password"
                        className={errors.newPassword ? 'error' : ''}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        disabled={isLoading}
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
                  </div>
                </div>
              )}

              <div className="modal-footer">
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 
                    forgotStep === 'mobile' ? 'Send OTP' :
                    forgotStep === 'otp' ? 'Verify OTP' :
                    'Reset Password'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <RegistrationPopup 
        isOpen={showRegistrationPopup} 
        onClose={() => setShowRegistrationPopup(false)} 
      />
    </>
  );
};

export default AuthTabs;