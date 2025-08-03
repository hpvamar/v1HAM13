import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Edit, Phone, Mail, User, Briefcase, Users, Home, Eye, EyeOff } from 'lucide-react';
import './RegistrationPopup.css';

// Registration Context
const RegistrationContext = createContext();

const useRegistration = () => {
  const context = useContext(RegistrationContext);
  if (!context) {
    throw new Error('useRegistration must be used within RegistrationProvider');
  }
  return context;
};

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">×</button>
    </div>
  );
};

// Progress Bar Component
const ProgressBar = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="progress-text">{Math.round(progress)}% Complete</div>
    </div>
  );
};

// Step Indicator Component
const StepIndicator = ({ steps, currentStep }) => {
  return (
    <div className="step-indicator">
      {steps.map((step, index) => (
        <div key={index} className={`step ${index + 1 <= currentStep ? 'completed' : ''} ${index + 1 === currentStep ? 'active' : ''}`}>
          <div className="step-circle">
            {index + 1 < currentStep ? <Check size={16} /> : index + 1}
          </div>
          <span className="step-label">{step}</span>
        </div>
      ))}
    </div>
  );
};

// Segment 1: User Verification
const UserVerification = () => {
  const { formData, setFormData, errors, setErrors, nextStep } = useRegistration();
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const validateMobile = (mobile) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const handleSendOTP = async () => {
    if (!formData.mobile || !validateMobile(formData.mobile)) {
      setErrors({ mobile: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOtpSent(true);
      setOtpTimer(60);
      setIsLoading(false);
      setErrors({});
    }, 1000);

    // Start timer
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

  const handleVerifyOTP = () => {
    if (!formData.otp) {
      setErrors({ otp: 'Please enter OTP' });
      return;
    }

    if (formData.otp !== '2004') {
      setErrors({ otp: 'Invalid OTP. Please try again.' });
      return;
    }

    setErrors({});
    nextStep();
  };

  const handleInputChange = (field, value) => {
    if (field === 'mobile' && value.length > 10) return;
    if (field === 'otp' && value.length > 4) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="segment">
      <div className="segment-header">
        <Phone className="segment-icon" />
        <h3>Mobile Verification</h3>
        <p>Verify your mobile number to continue</p>
      </div>

      <div className="form-group">
        <label>Mobile Number</label>
        <div className="input-wrapper">
          <span className="country-code">+91</span>
          <input
            type="tel"
            value={formData.mobile}
            onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, ''))}
            placeholder="Enter 10-digit mobile number"
            className={errors.mobile ? 'error' : ''}
            disabled={otpSent}
          />
        </div>
        {errors.mobile && <span className="error-message">{errors.mobile}</span>}
      </div>

      {!otpSent ? (
        <button 
          className="btn btn-primary" 
          onClick={handleSendOTP}
          disabled={isLoading}
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
      ) : (
        <>
          <div className="form-group">
            <label>Enter OTP</label>
            <input
              type="text"
              value={formData.otp}
              onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit OTP"
              className={errors.otp ? 'error' : ''}
            />
            {errors.otp && <span className="error-message">{errors.otp}</span>}
          </div>

          <div className="otp-actions">
            <button 
              className="btn btn-primary" 
              onClick={handleVerifyOTP}
            >
              Verify & Continue
            </button>
            
            {otpTimer > 0 ? (
              <span className="otp-timer">Resend OTP in {otpTimer}s</span>
            ) : (
              <button 
                className="btn btn-secondary" 
                onClick={handleSendOTP}
              >
                Resend OTP
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Segment 2: Basic Details
const BasicDetails = () => {
  const { formData, setFormData, errors, setErrors, nextStep, prevStep } = useRegistration();
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    return email.endsWith('@gmail.com') && email.length > 10;
  };

  const validatePassword = (password) => {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return password.length >= 6 && hasUpper && hasLower && hasSpecial;
  };

  const validateName = (name) => {
    return /^[a-zA-Z\s]+$/.test(name) && name.trim().length >= 2;
  };

  const validateAadhar = (aadhar) => {
    return /^\d{12}$/.test(aadhar);
  };

  const validatePAN = (pan) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
  };

  const handleInputChange = (field, value) => {
    if (field === 'name' && !/^[a-zA-Z\s]*$/.test(value)) return;
    if (field === 'aadhar' && (value.length > 12 || !/^\d*$/.test(value))) return;
    if (field === 'pan') value = value.toUpperCase();
    if (field === 'pan' && value.length > 10) return;
    if (field === 'homePhone' && (value.length > 10 || !/^\d*$/.test(value))) return;

    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateName(formData.name)) {
      newErrors.name = 'Name should contain only letters and be at least 2 characters';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Email must be a valid @gmail.com address';
    }
    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 6+ chars with uppercase, lowercase, and special character';
    }
    if (!formData.gender) {
      newErrors.gender = 'Please select gender';
    }
    if (!formData.dob) {
      newErrors.dob = 'Please select date of birth';
    }
    if (!validateAadhar(formData.aadhar)) {
      newErrors.aadhar = 'Aadhar number must be exactly 12 digits';
    }
    if (!validatePAN(formData.pan)) {
      newErrors.pan = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="segment">
      <div className="segment-header">
        <User className="segment-icon" />
        <h3>Basic Details</h3>
        <p>Tell us about yourself</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter your full name"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Email Address *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="yourname@gmail.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Password *</label>
          <div className="input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Create password"
              className={errors.password ? 'error' : ''}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-group">
          <label>Gender *</label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className={errors.gender ? 'error' : ''}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
          </select>
          {errors.gender && <span className="error-message">{errors.gender}</span>}
        </div>

        <div className="form-group">
          <label>Date of Birth *</label>
          <input
            type="date"
            value={formData.dob}
            onChange={(e) => handleInputChange('dob', e.target.value)}
            className={errors.dob ? 'error' : ''}
          />
          {errors.dob && <span className="error-message">{errors.dob}</span>}
        </div>

        <div className="form-group">
          <label>Mobile Number</label>
          <div className="input-wrapper">
            <span className="country-code">+91</span>
            <input
              type="tel"
              value={formData.mobile}
              disabled
              className="disabled"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Home Phone (Optional)</label>
          <div className="input-wrapper">
            <span className="country-code">+91</span>
            <input
              type="tel"
              value={formData.homePhone}
              onChange={(e) => handleInputChange('homePhone', e.target.value)}
              placeholder="Home phone number"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Blood Group (Optional)</label>
          <select
            value={formData.bloodGroup}
            onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
          >
            <option value="">Select Blood Group</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>

        <div className="form-group">
          <label>Aadhar Number *</label>
          <input
            type="text"
            value={formData.aadhar}
            onChange={(e) => handleInputChange('aadhar', e.target.value)}
            placeholder="12-digit Aadhar number"
            className={errors.aadhar ? 'error' : ''}
          />
          {errors.aadhar && <span className="error-message">{errors.aadhar}</span>}
        </div>

        <div className="form-group">
          <label>PAN Number *</label>
          <input
            type="text"
            value={formData.pan}
            onChange={(e) => handleInputChange('pan', e.target.value)}
            placeholder="ABCDE1234F"
            className={errors.pan ? 'error' : ''}
          />
          {errors.pan && <span className="error-message">{errors.pan}</span>}
        </div>
      </div>

      <div className="segment-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Segment 3: Job Details
const JobDetails = () => {
  const { formData, setFormData, errors, setErrors, nextStep, prevStep } = useRegistration();
  const [showOtherDept, setShowOtherDept] = useState(false);

  const departments = [
    'Ministry of Home Affairs',
    'Ministry of Finance',
    'Ministry of Defence',
    'Ministry of External Affairs',
    'Ministry of Health',
    'Ministry of Education',
    'Ministry of Railways',
    'Other'
  ];

  const handleInputChange = (field, value) => {
    if (field === 'pinCode' && (value.length > 6 || !/^\d*$/.test(value))) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'department') {
      setShowOtherDept(value === 'Other');
      if (value !== 'Other') {
        setFormData(prev => ({ ...prev, otherDepartment: '' }));
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.department) {
      newErrors.department = 'Please select department';
    }
    if (formData.department === 'Other' && !formData.otherDepartment) {
      newErrors.otherDepartment = 'Please specify department';
    }
    if (!formData.departmentId) {
      newErrors.departmentId = 'Department ID is required';
    }
    if (!formData.jobDescription) {
      newErrors.jobDescription = 'Job description is required';
    }
    if (!formData.block) {
      newErrors.block = 'Block is required';
    }
    if (!formData.post) {
      newErrors.post = 'Post is required';
    }
    if (!formData.jobAddress) {
      newErrors.jobAddress = 'Job address is required';
    }
    if (!formData.pinCode || formData.pinCode.length !== 6) {
      newErrors.pinCode = 'Pin code must be 6 digits';
    }
    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="segment">
      <div className="segment-header">
        <Briefcase className="segment-icon" />
        <h3>Job Details</h3>
        <p>Your employment information</p>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label>Department *</label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className={errors.department ? 'error' : ''}
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          {errors.department && <span className="error-message">{errors.department}</span>}
        </div>

        {showOtherDept && (
          <div className="form-group">
            <label>Specify Department *</label>
            <input
              type="text"
              value={formData.otherDepartment}
              onChange={(e) => handleInputChange('otherDepartment', e.target.value)}
              placeholder="Enter department name"
              className={errors.otherDepartment ? 'error' : ''}
            />
            {errors.otherDepartment && <span className="error-message">{errors.otherDepartment}</span>}
          </div>
        )}

        <div className="form-group">
          <label>Department Unique ID *</label>
          <input
            type="text"
            value={formData.departmentId}
            onChange={(e) => handleInputChange('departmentId', e.target.value)}
            placeholder="Enter department ID"
            className={errors.departmentId ? 'error' : ''}
          />
          {errors.departmentId && <span className="error-message">{errors.departmentId}</span>}
        </div>

        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            value={formData.jobDescription}
            onChange={(e) => handleInputChange('jobDescription', e.target.value)}
            placeholder="Describe your job role"
            className={errors.jobDescription ? 'error' : ''}
            rows="3"
          />
          {errors.jobDescription && <span className="error-message">{errors.jobDescription}</span>}
        </div>

        <div className="form-group">
          <label>Block *</label>
          <input
            type="text"
            value={formData.block}
            onChange={(e) => handleInputChange('block', e.target.value)}
            placeholder="Enter block"
            className={errors.block ? 'error' : ''}
          />
          {errors.block && <span className="error-message">{errors.block}</span>}
        </div>

        <div className="form-group">
          <label>Post *</label>
          <input
            type="text"
            value={formData.post}
            onChange={(e) => handleInputChange('post', e.target.value)}
            placeholder="Enter post"
            className={errors.post ? 'error' : ''}
          />
          {errors.post && <span className="error-message">{errors.post}</span>}
        </div>

        <div className="form-group">
          <label>Sub Post</label>
          <input
            type="text"
            value={formData.subPost}
            onChange={(e) => handleInputChange('subPost', e.target.value)}
            placeholder="Enter sub post (optional)"
          />
        </div>

        <div className="form-group full-width">
          <label>Job Address *</label>
          <textarea
            value={formData.jobAddress}
            onChange={(e) => handleInputChange('jobAddress', e.target.value)}
            placeholder="Enter complete job address"
            className={errors.jobAddress ? 'error' : ''}
            rows="3"
          />
          {errors.jobAddress && <span className="error-message">{errors.jobAddress}</span>}
        </div>

        <div className="form-group">
          <label>Pin Code *</label>
          <input
            type="text"
            value={formData.pinCode}
            onChange={(e) => handleInputChange('pinCode', e.target.value)}
            placeholder="6-digit pin code"
            className={errors.pinCode ? 'error' : ''}
          />
          {errors.pinCode && <span className="error-message">{errors.pinCode}</span>}
        </div>

        <div className="form-group">
          <label>District *</label>
          <input
            type="text"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            placeholder="Enter district"
            className={errors.district ? 'error' : ''}
          />
          {errors.district && <span className="error-message">{errors.district}</span>}
        </div>
      </div>

      <div className="segment-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Segment 4: Nominee Details
const NomineeDetails = () => {
  const { formData, setFormData, errors, setErrors, nextStep, prevStep } = useRegistration();

  const handleInputChange = (section, field, value) => {
    if (field.includes('mobile') && (value.length > 10 || !/^\d*$/.test(value))) return;
    if (field.includes('accountNo') && !/^\d*$/.test(value)) return;

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
        ...(field === 'name' && field.includes('name') ? { accountHolderName: value } : {})
      }
    }));

    if (errors[`${section}.${field}`]) {
      setErrors(prev => ({ ...prev, [`${section}.${field}`]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // First nominee validation (mandatory)
    if (!formData.firstNominee.name) {
      newErrors['firstNominee.name'] = 'First nominee name is required';
    }
    if (!formData.firstNominee.relation) {
      newErrors['firstNominee.relation'] = 'Relation is required';
    }
    if (!formData.firstNominee.mobile || formData.firstNominee.mobile.length !== 10) {
      newErrors['firstNominee.mobile'] = 'Valid 10-digit mobile number required';
    }
    if (!formData.firstNominee.bankName) {
      newErrors['firstNominee.bankName'] = 'Bank name is required';
    }
    if (!formData.firstNominee.accountNo) {
      newErrors['firstNominee.accountNo'] = 'Account number is required';
    }
    if (!formData.firstNominee.ifsc) {
      newErrors['firstNominee.ifsc'] = 'IFSC code is required';
    }
    if (!formData.firstNominee.branch) {
      newErrors['firstNominee.branch'] = 'Branch is required';
    }

    // Second nominee validation (optional, but if provided, all fields required)
    if (formData.secondNominee.name || formData.secondNominee.relation || formData.secondNominee.mobile) {
      if (!formData.secondNominee.name) {
        newErrors['secondNominee.name'] = 'Second nominee name is required';
      }
      if (!formData.secondNominee.relation) {
        newErrors['secondNominee.relation'] = 'Relation is required';
      }
      if (!formData.secondNominee.mobile || formData.secondNominee.mobile.length !== 10) {
        newErrors['secondNominee.mobile'] = 'Valid 10-digit mobile number required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="segment">
      <div className="segment-header">
        <Users className="segment-icon" />
        <h3>Nominee Details</h3>
        <p>Add your nominees and their bank details</p>
      </div>

      {/* First Nominee */}
      <div className="nominee-section">
        <h4>First Nominee (Mandatory)</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              value={formData.firstNominee.name}
              onChange={(e) => handleInputChange('firstNominee', 'name', e.target.value)}
              placeholder="Enter nominee name"
              className={errors['firstNominee.name'] ? 'error' : ''}
            />
            {errors['firstNominee.name'] && <span className="error-message">{errors['firstNominee.name']}</span>}
          </div>

          <div className="form-group">
            <label>Relation *</label>
            <select
              value={formData.firstNominee.relation}
              onChange={(e) => handleInputChange('firstNominee', 'relation', e.target.value)}
              className={errors['firstNominee.relation'] ? 'error' : ''}
            >
              <option value="">Select Relation</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Other">Other</option>
            </select>
            {errors['firstNominee.relation'] && <span className="error-message">{errors['firstNominee.relation']}</span>}
          </div>

          <div className="form-group">
            <label>Mobile *</label>
            <div className="input-wrapper">
              <span className="country-code">+91</span>
              <input
                type="tel"
                value={formData.firstNominee.mobile}
                onChange={(e) => handleInputChange('firstNominee', 'mobile', e.target.value)}
                placeholder="10-digit mobile number"
                className={errors['firstNominee.mobile'] ? 'error' : ''}
              />
            </div>
            {errors['firstNominee.mobile'] && <span className="error-message">{errors['firstNominee.mobile']}</span>}
          </div>

          <div className="form-group">
            <label>Account Holder Name *</label>
            <input
              type="text"
              value={formData.firstNominee.accountHolderName || formData.firstNominee.name}
              onChange={(e) => handleInputChange('firstNominee', 'accountHolderName', e.target.value)}
              placeholder="Account holder name"
              className={errors['firstNominee.accountHolderName'] ? 'error' : ''}
            />
          </div>

          <div className="form-group">
            <label>Bank Name *</label>
            <input
              type="text"
              value={formData.firstNominee.bankName}
              onChange={(e) => handleInputChange('firstNominee', 'bankName', e.target.value)}
              placeholder="Enter bank name"
              className={errors['firstNominee.bankName'] ? 'error' : ''}
            />
            {errors['firstNominee.bankName'] && <span className="error-message">{errors['firstNominee.bankName']}</span>}
          </div>

          <div className="form-group">
            <label>Account Number *</label>
            <input
              type="text"
              value={formData.firstNominee.accountNo}
              onChange={(e) => handleInputChange('firstNominee', 'accountNo', e.target.value)}
              placeholder="Enter account number"
              className={errors['firstNominee.accountNo'] ? 'error' : ''}
            />
            {errors['firstNominee.accountNo'] && <span className="error-message">{errors['firstNominee.accountNo']}</span>}
          </div>

          <div className="form-group">
            <label>IFSC Code *</label>
            <input
              type="text"
              value={formData.firstNominee.ifsc}
              onChange={(e) => handleInputChange('firstNominee', 'ifsc', e.target.value.toUpperCase())}
              placeholder="Enter IFSC code"
              className={errors['firstNominee.ifsc'] ? 'error' : ''}
            />
            {errors['firstNominee.ifsc'] && <span className="error-message">{errors['firstNominee.ifsc']}</span>}
          </div>

          <div className="form-group">
            <label>Branch *</label>
            <input
              type="text"
              value={formData.firstNominee.branch}
              onChange={(e) => handleInputChange('firstNominee', 'branch', e.target.value)}
              placeholder="Enter branch name"
              className={errors['firstNominee.branch'] ? 'error' : ''}
            />
            {errors['firstNominee.branch'] && <span className="error-message">{errors['firstNominee.branch']}</span>}
          </div>
        </div>
      </div>

      {/* Second Nominee */}
      <div className="nominee-section">
        <h4>Second Nominee (Optional)</h4>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.secondNominee.name}
              onChange={(e) => handleInputChange('secondNominee', 'name', e.target.value)}
              placeholder="Enter nominee name"
              className={errors['secondNominee.name'] ? 'error' : ''}
            />
            {errors['secondNominee.name'] && <span className="error-message">{errors['secondNominee.name']}</span>}
          </div>

          <div className="form-group">
            <label>Relation</label>
            <select
              value={formData.secondNominee.relation}
              onChange={(e) => handleInputChange('secondNominee', 'relation', e.target.value)}
              className={errors['secondNominee.relation'] ? 'error' : ''}
            >
              <option value="">Select Relation</option>
              <option value="Spouse">Spouse</option>
              <option value="Son">Son</option>
              <option value="Daughter">Daughter</option>
              <option value="Father">Father</option>
              <option value="Mother">Mother</option>
              <option value="Brother">Brother</option>
              <option value="Sister">Sister</option>
              <option value="Other">Other</option>
            </select>
            {errors['secondNominee.relation'] && <span className="error-message">{errors['secondNominee.relation']}</span>}
          </div>

          <div className="form-group">
            <label>Mobile</label>
            <div className="input-wrapper">
              <span className="country-code">+91</span>
              <input
                type="tel"
                value={formData.secondNominee.mobile}
                onChange={(e) => handleInputChange('secondNominee', 'mobile', e.target.value)}
                placeholder="10-digit mobile number"
                className={errors['secondNominee.mobile'] ? 'error' : ''}
              />
            </div>
            {errors['secondNominee.mobile'] && <span className="error-message">{errors['secondNominee.mobile']}</span>}
          </div>

          <div className="form-group">
            <label>Account Holder Name</label>
            <input
              type="text"
              value={formData.secondNominee.accountHolderName || formData.secondNominee.name}
              onChange={(e) => handleInputChange('secondNominee', 'accountHolderName', e.target.value)}
              placeholder="Account holder name"
            />
          </div>

          <div className="form-group">
            <label>Bank Name</label>
            <input
              type="text"
              value={formData.secondNominee.bankName}
              onChange={(e) => handleInputChange('secondNominee', 'bankName', e.target.value)}
              placeholder="Enter bank name"
            />
          </div>

          <div className="form-group">
            <label>Account Number</label>
            <input
              type="text"
              value={formData.secondNominee.accountNo}
              onChange={(e) => handleInputChange('secondNominee', 'accountNo', e.target.value)}
              placeholder="Enter account number"
            />
          </div>

          <div className="form-group">
            <label>IFSC Code</label>
            <input
              type="text"
              value={formData.secondNominee.ifsc}
              onChange={(e) => handleInputChange('secondNominee', 'ifsc', e.target.value.toUpperCase())}
              placeholder="Enter IFSC code"
            />
          </div>

          <div className="form-group">
            <label>Branch</label>
            <input
              type="text"
              value={formData.secondNominee.branch}
              onChange={(e) => handleInputChange('secondNominee', 'branch', e.target.value)}
              placeholder="Enter branch name"
            />
          </div>
        </div>
      </div>

      <div className="segment-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Segment 5: Other Details
const OtherDetails = () => {
  const { formData, setFormData, errors, setErrors, nextStep, prevStep } = useRegistration();

  const handleInputChange = (field, value) => {
    if (field === 'homePinCode' && (value.length > 6 || !/^\d*$/.test(value))) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.homeAddress) {
      newErrors.homeAddress = 'Home address is required';
    }
    if (!formData.homeDistrict) {
      newErrors.homeDistrict = 'Home district is required';
    }
    if (!formData.homePinCode || formData.homePinCode.length !== 6) {
      newErrors.homePinCode = 'Pin code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="segment">
      <div className="segment-header">
        <Home className="segment-icon" />
        <h3>Other Details</h3>
        <p>Additional information</p>
      </div>

      <div className="form-grid">
        <div className="form-group full-width">
          <label>Home Address *</label>
          <textarea
            value={formData.homeAddress}
            onChange={(e) => handleInputChange('homeAddress', e.target.value)}
            placeholder="Enter complete home address"
            className={errors.homeAddress ? 'error' : ''}
            rows="3"
          />
          {errors.homeAddress && <span className="error-message">{errors.homeAddress}</span>}
        </div>

        <div className="form-group">
          <label>Home District *</label>
          <input
            type="text"
            value={formData.homeDistrict}
            onChange={(e) => handleInputChange('homeDistrict', e.target.value)}
            placeholder="Enter home district"
            className={errors.homeDistrict ? 'error' : ''}
          />
          {errors.homeDistrict && <span className="error-message">{errors.homeDistrict}</span>}
        </div>

        <div className="form-group">
          <label>Pin Code *</label>
          <input
            type="text"
            value={formData.homePinCode}
            onChange={(e) => handleInputChange('homePinCode', e.target.value)}
            placeholder="6-digit pin code"
            className={errors.homePinCode ? 'error' : ''}
          />
          {errors.homePinCode && <span className="error-message">{errors.homePinCode}</span>}
        </div>

        <div className="form-group">
          <label>Disease (Optional)</label>
          <input
            type="text"
            value={formData.disease}
            onChange={(e) => handleInputChange('disease', e.target.value)}
            placeholder="Any existing disease"
          />
        </div>

        <div className="form-group full-width">
          <label>Cause of Illness (Optional)</label>
          <textarea
            value={formData.causeOfIllness}
            onChange={(e) => handleInputChange('causeOfIllness', e.target.value)}
            placeholder="Describe cause of illness if any"
            rows="3"
          />
        </div>
      </div>

      <div className="segment-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          <ChevronLeft size={16} /> Previous
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Review <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

// Final Preview Component
const FinalPreview = () => {
  const { formData, setCurrentStep, submitForm, isSubmitting } = useRegistration();

  const sections = [
    { title: 'User Verification', step: 1, icon: Phone },
    { title: 'Basic Details', step: 2, icon: User },
    { title: 'Job Details', step: 3, icon: Briefcase },
    { title: 'Nominee Details', step: 4, icon: Users },
    { title: 'Other Details', step: 5, icon: Home }
  ];

  const handleEdit = (step) => {
    setCurrentStep(step);
  };

  return (
    <div className="segment">
      <div className="segment-header">
        <Check className="segment-icon" />
        <h3>Review & Submit</h3>
        <p>Please review your information before submitting</p>
      </div>

      <div className="preview-sections">
        {sections.map((section) => (
          <div key={section.step} className="preview-section">
            <div className="preview-header">
              <div className="preview-title">
                <section.icon size={20} />
                <h4>{section.title}</h4>
              </div>
              <button 
                className="btn btn-outline"
                onClick={() => handleEdit(section.step)}
              >
                <Edit size={16} /> Edit
              </button>
            </div>
            
            <div className="preview-content">
              {section.step === 1 && (
                <div className="preview-grid">
                  <div><strong>Mobile:</strong> +91 {formData.mobile}</div>
                </div>
              )}
              
              {section.step === 2 && (
                <div className="preview-grid">
                  <div><strong>Name:</strong> {formData.name}</div>
                  <div><strong>Email:</strong> {formData.email}</div>
                  <div><strong>Gender:</strong> {formData.gender}</div>
                  <div><strong>DOB:</strong> {formData.dob}</div>
                  <div><strong>Blood Group:</strong> {formData.bloodGroup || 'Not specified'}</div>
                  <div><strong>Aadhar:</strong> {formData.aadhar}</div>
                  <div><strong>PAN:</strong> {formData.pan}</div>
                </div>
              )}
              
              {section.step === 3 && (
                <div className="preview-grid">
                  <div><strong>Department:</strong> {formData.department === 'Other' ? formData.otherDepartment : formData.department}</div>
                  <div><strong>Department ID:</strong> {formData.departmentId}</div>
                  <div><strong>Post:</strong> {formData.post}</div>
                  <div><strong>Block:</strong> {formData.block}</div>
                  <div><strong>District:</strong> {formData.district}</div>
                  <div><strong>Pin Code:</strong> {formData.pinCode}</div>
                </div>
              )}
              
              {section.step === 4 && (
                <div className="preview-grid">
                  <div><strong>First Nominee:</strong> {formData.firstNominee.name} ({formData.firstNominee.relation})</div>
                  <div><strong>Mobile:</strong> +91 {formData.firstNominee.mobile}</div>
                  <div><strong>Bank:</strong> {formData.firstNominee.bankName}</div>
                  {formData.secondNominee.name && (
                    <>
                      <div><strong>Second Nominee:</strong> {formData.secondNominee.name} ({formData.secondNominee.relation})</div>
                      <div><strong>Mobile:</strong> +91 {formData.secondNominee.mobile}</div>
                    </>
                  )}
                </div>
              )}
              
              {section.step === 5 && (
                <div className="preview-grid">
                  <div><strong>Home District:</strong> {formData.homeDistrict}</div>
                  <div><strong>Pin Code:</strong> {formData.homePinCode}</div>
                  <div><strong>Disease:</strong> {formData.disease || 'None'}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="final-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => setCurrentStep(5)}
        >
          <ChevronLeft size={16} /> Back to Edit
        </button>
        <button 
          className="btn btn-success" 
          onClick={submitForm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>
    </div>
  );
};

// Main Registration Provider Component
const RegistrationProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const [formData, setFormData] = useState({
    // Step 1
    mobile: '',
    otp: '',
    
    // Step 2
    name: '',
    email: '',
    password: '',
    gender: '',
    dob: '',
    homePhone: '',
    bloodGroup: '',
    aadhar: '',
    pan: '',
    
    // Step 3
    department: '',
    otherDepartment: '',
    departmentId: '',
    jobDescription: '',
    block: '',
    post: '',
    subPost: '',
    jobAddress: '',
    pinCode: '',
    district: '',
    
    // Step 4
    firstNominee: {
      name: '',
      relation: '',
      mobile: '',
      accountHolderName: '',
      bankName: '',
      accountNo: '',
      ifsc: '',
      branch: ''
    },
    secondNominee: {
      name: '',
      relation: '',
      mobile: '',
      accountHolderName: '',
      bankName: '',
      accountNo: '',
      ifsc: '',
      branch: ''
    },
    
    // Step 5
    homeAddress: '',
    homeDistrict: '',
    homePinCode: '',
    disease: '',
    causeOfIllness: ''
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
      setErrors({});
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Ensure proper formatting
        email: formData.email.toLowerCase(),
        pan: formData.pan.toUpperCase(),
        firstNominee: {
          ...formData.firstNominee,
          ifsc: formData.firstNominee.ifsc.toUpperCase(),
          accountHolderName: formData.firstNominee.accountHolderName || formData.firstNominee.name
        },
        secondNominee: formData.secondNominee.name ? {
          ...formData.secondNominee,
          ifsc: formData.secondNominee.ifsc ? formData.secondNominee.ifsc.toUpperCase() : '',
          accountHolderName: formData.secondNominee.accountHolderName || formData.secondNominee.name
        } : undefined
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Server error: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.error('Could not read error response:', textError);
        }
        showToast(errorMessage, 'error');
        setIsSubmitting(false);
        return;
      }

      let result;
      try {
        const responseText = await response.text();
        if (!responseText) {
          showToast('Empty response from server. Please try again.', 'error');
          setIsSubmitting(false);
          return;
        }
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError);
        showToast('Invalid server response. Please check if the server is running properly.', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (result.success) {
        showToast('Registration successful! You can now login with your credentials.', 'success');
        
        // Store user info for potential auto-login
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          
          // If onLogin callback is provided, call it
          if (window.onRegistrationSuccess) {
            window.onRegistrationSuccess(result.user, result.token);
          }
        }
        
        // Reset form after successful registration
        setTimeout(() => {
          setCurrentStep(1);
          setFormData({
            mobile: '', otp: '', name: '', email: '', password: '', gender: '', dob: '',
            homePhone: '', bloodGroup: '', aadhar: '', pan: '', department: '', otherDepartment: '',
            departmentId: '', jobDescription: '', block: '', post: '', subPost: '', jobAddress: '',
            pinCode: '', district: '', firstNominee: { name: '', relation: '', mobile: '', accountHolderName: '',
            bankName: '', accountNo: '', ifsc: '', branch: '' }, secondNominee: { name: '', relation: '',
            mobile: '', accountHolderName: '', bankName: '', accountNo: '', ifsc: '', branch: '' },
            homeAddress: '', homeDistrict: '', homePinCode: '', disease: '', causeOfIllness: ''
          });
        }, 2000);
      } else {
        showToast(result.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      if (error.message.includes('Failed to fetch')) {
        showToast('Cannot connect to server. Please ensure the backend is running.', 'error');
      } else {
        showToast('Network error. Please try again.', 'error');
      }
    }
    
    setIsSubmitting(false);
  };

  const value = {
    currentStep,
    setCurrentStep,
    formData,
    setFormData,
    errors,
    setErrors,
    nextStep,
    prevStep,
    submitForm,
    isSubmitting,
    showToast
  };

  return (
    <RegistrationContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </RegistrationContext.Provider>
  );
};

// Main Registration Popup Component
const RegistrationPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = ['Verification', 'Basic Details', 'Job Details', 'Nominees', 'Other Details'];

  return (
    <RegistrationProvider>
      <div className="registration-overlay" onClick={onClose}>
        <div className="registration-popup" onClick={(e) => e.stopPropagation()}>
          <RegistrationContent steps={steps} onClose={onClose} />
        </div>
      </div>
    </RegistrationProvider>
  );
};

const RegistrationContent = ({ steps, onClose }) => {
  const { currentStep } = useRegistration();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return <UserVerification />;
      case 2: return <BasicDetails />;
      case 3: return <JobDetails />;
      case 4: return <NomineeDetails />;
      case 5: return <OtherDetails />;
      case 6: return <FinalPreview />;
      default: return <UserVerification />;
    }
  };

  return (
    <>
      <div className="registration-header">
        <h2>Registration Form</h2>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <ProgressBar currentStep={currentStep} totalSteps={6} />
      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="registration-content">
        {renderCurrentStep()}
      </div>
    </>
  );
};

export default RegistrationPopup;