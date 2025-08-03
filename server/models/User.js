import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Step 1: User Verification
  mobile: {
    type: String,
    required: true,
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid mobile number']
  },
  
  // Step 2: Basic Details
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@gmail\.com$/, 'Please enter a valid Gmail address']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Transgender']
  },
  dob: {
    type: Date,
    required: true
  },
  homePhone: {
    type: String,
    match: [/^\d{10}$/, 'Please enter a valid phone number']
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  aadhar: {
    type: String,
    required: true,
    unique: true,
    match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhar number']
  },
  pan: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number']
  },
  
  // Step 3: Job Details
  department: {
    type: String,
    required: true
  },
  otherDepartment: {
    type: String
  },
  departmentId: {
    type: String,
    required: true,
    unique: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  block: {
    type: String,
    required: true
  },
  post: {
    type: String,
    required: true
  },
  subPost: {
    type: String
  },
  jobAddress: {
    type: String,
    required: true
  },
  pinCode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pin code']
  },
  district: {
    type: String,
    required: true
  },
  
  // Step 4: Nominee Details
  firstNominee: {
    name: {
      type: String,
      required: true
    },
    relation: {
      type: String,
      required: true,
      enum: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']
    },
    mobile: {
      type: String,
      required: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid mobile number']
    },
    accountHolderName: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    accountNo: {
      type: String,
      required: true
    },
    ifsc: {
      type: String,
      required: true,
      uppercase: true
    },
    branch: {
      type: String,
      required: true
    }
  },
  
  secondNominee: {
    name: String,
    relation: {
      type: String,
      enum: ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Other']
    },
    mobile: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid mobile number']
    },
    accountHolderName: String,
    bankName: String,
    accountNo: String,
    ifsc: {
      type: String,
      uppercase: true
    },
    branch: String
  },
  
  // Step 5: Other Details
  homeAddress: {
    type: String,
    required: true
  },
  homeDistrict: {
    type: String,
    required: true
  },
  homePinCode: {
    type: String,
    required: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pin code']
  },
  disease: String,
  causeOfIllness: String,
  
  // System fields
  isVerified: {
    type: Boolean,
    default: false
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Management Fee tracking
  managementFee: {
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: {
      type: Date
    },
    nextDue: {
      type: Date
    },
    amount: {
      type: Number,
      default: 499
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model('User', userSchema);