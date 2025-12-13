/**
 * MONGOOSE USER MODEL
 * 
 * Complex User model with relationships, nested documents, and aggregation-friendly fields
 */

const mongoose = require('mongoose');

// Sub-schema for Address (embedded document)
const addressSchema = new mongoose.Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true, required: true },
  state: { type: String, trim: true },
  country: { type: String, trim: true, required: true },
  zipCode: { type: String, trim: true },
  isDefault: { type: Boolean, default: false },
  type: { 
    type: String, 
    enum: ['home', 'work', 'shipping', 'billing'],
    default: 'home'
  }
}, { _id: true });

// Sub-schema for Social Links
const socialLinkSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    enum: ['twitter', 'linkedin', 'github', 'facebook', 'instagram', 'youtube'],
    required: true 
  },
  url: { type: String, required: true },
  username: { type: String }
}, { _id: false });

// Sub-schema for User Preferences
const preferencesSchema = new mongoose.Schema({
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  language: { type: String, default: 'en' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
    showEmail: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true }
  }
}, { _id: false });

// Sub-schema for Activity Log
const activityLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['login', 'logout', 'purchase', 'post_created', 'comment', 'profile_update', 'password_change'],
    required: true 
  },
  timestamp: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { _id: true });

// Define User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false // Won't be returned in queries by default
  },
  profile: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must be at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [2, 'Last name must be at least 2 characters'],
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    avatar: { type: String, default: null },
    bio: { type: String, maxlength: [500, 'Bio cannot exceed 500 characters'] },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    phone: { type: String, trim: true }
  },
  addresses: [addressSchema],
  socialLinks: [socialLinkSchema],
  preferences: { type: preferencesSchema, default: () => ({}) },
  
  // Role and permissions
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'super_admin'],
    default: 'user'
  },
  permissions: [{
    type: String,
    enum: ['create_post', 'edit_post', 'delete_post', 'manage_users', 'manage_products', 'view_analytics']
  }],
  
  // Account status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification', 'deleted'],
    default: 'pending_verification'
  },
  emailVerified: { type: Boolean, default: false },
  emailVerifiedAt: { type: Date },
  
  // Relationships (references to other users)
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Statistics (denormalized for aggregation practice)
  stats: {
    totalPosts: { type: Number, default: 0 },
    totalComments: { type: Number, default: 0 },
    totalLikesReceived: { type: Number, default: 0 },
    totalLikesGiven: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    reputation: { type: Number, default: 0 }
  },
  
  // Activity tracking
  activityLog: [activityLogSchema],
  lastLoginAt: { type: Date },
  lastActiveAt: { type: Date },
  loginCount: { type: Number, default: 0 },
  
  // Subscription/Membership
  membership: {
    type: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    startDate: { type: Date },
    endDate: { type: Date },
    autoRenew: { type: Boolean, default: false }
  },
  
  // Tags for interests (useful for aggregation)
  interests: [{
    type: String,
    enum: ['technology', 'sports', 'music', 'art', 'travel', 'food', 'fashion', 'gaming', 'books', 'movies', 'fitness', 'photography']
  }],
  
  // Referral system
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCode: { type: String, unique: true, sparse: true },
  referralCount: { type: Number, default: 0 }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Full name virtual
userSchema.virtual('profile.fullName').get(function() {
  return `${this.profile?.firstName || ''} ${this.profile?.lastName || ''}`.trim();
});

// Age virtual (calculated from DOB)
userSchema.virtual('profile.age').get(function() {
  if (!this.profile?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.profile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Posts virtual (reference to Post model)
userSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'author'
});

// Orders virtual (reference to Order model)
userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user'
});

// Reviews virtual
userSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'user'
});

// Followers count virtual
userSchema.virtual('followersCount').get(function() {
  return this.followers?.length || 0;
});

// Following count virtual
userSchema.virtual('followingCount').get(function() {
  return this.following?.length || 0;
});

// Is premium virtual
userSchema.virtual('isPremium').get(function() {
  return ['premium', 'enterprise'].includes(this.membership?.type) && 
         this.membership?.endDate > new Date();
});

// ============== INDEXES ==============
// Note: email, username, referralCode already have indexes from unique: true
userSchema.index({ 'profile.firstName': 1, 'profile.lastName': 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'membership.type': 1 });
userSchema.index({ interests: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'stats.reputation': -1 });
userSchema.index({ 'addresses.city': 1, 'addresses.country': 1 });

// Text index for search
userSchema.index({ 
  'profile.firstName': 'text', 
  'profile.lastName': 'text', 
  username: 'text',
  'profile.bio': 'text'
});

// ============== INSTANCE METHODS ==============
userSchema.methods.isFollowing = function(userId) {
  return this.following.some(id => id.equals(userId));
};

userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

// ============== STATIC METHODS ==============
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findActiveUsers = function() {
  return this.find({ status: 'active' });
};

userSchema.statics.getTopContributors = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'stats.reputation': -1 })
    .limit(limit);
};

// ============== MIDDLEWARE ==============
userSchema.pre('save', function(next) {
  if (this.isNew && !this.referralCode) {
    this.referralCode = `REF${this._id.toString().slice(-8).toUpperCase()}`;
  }
  next();
});

// Create and export User model
const User = mongoose.model('User', userSchema);

module.exports = User;
