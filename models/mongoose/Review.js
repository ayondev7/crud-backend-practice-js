/**
 * MONGOOSE REVIEW MODEL
 * 
 * Complex Review model for products/posts with nested replies, votes, and aggregation-friendly fields
 */

const mongoose = require('mongoose');

// Sub-schema for Review Media
const reviewMediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  thumbnail: { type: String },
  caption: { type: String }
}, { _id: true });

// Sub-schema for Votes
const voteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['helpful', 'not_helpful'], required: true },
  createdAt: { type: Date, default: Date.now }
}, { _id: false });

// Sub-schema for Review Replies
const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  authorType: { type: String, enum: ['customer', 'seller', 'admin'], default: 'customer' },
  content: { type: String, required: true, maxlength: 2000 },
  isOfficial: { type: Boolean, default: false },
  votes: [voteSchema],
  helpfulCount: { type: Number, default: 0 },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date }
}, { _id: true, timestamps: true });

// Sub-schema for Rating Breakdown (multi-criteria)
const ratingBreakdownSchema = new mongoose.Schema({
  overall: { type: Number, required: true, min: 1, max: 5 },
  quality: { type: Number, min: 1, max: 5 },
  value: { type: Number, min: 1, max: 5 },
  shipping: { type: Number, min: 1, max: 5 },
  packaging: { type: Number, min: 1, max: 5 },
  customerService: { type: Number, min: 1, max: 5 },
  easeOfUse: { type: Number, min: 1, max: 5 },
  durability: { type: Number, min: 1, max: 5 }
}, { _id: false });

// Define Review Schema
const reviewSchema = new mongoose.Schema({
  // Target (what is being reviewed)
  targetType: {
    type: String,
    enum: ['product', 'post', 'user', 'order'],
    required: true
  },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For user reviews
  
  // Variant info (for product reviews)
  variant: {
    id: { type: mongoose.Schema.Types.ObjectId },
    name: { type: String },
    attributes: { type: mongoose.Schema.Types.Mixed }
  },
  
  // Reviewer
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isVerifiedPurchase: { type: Boolean, default: false },
  
  // Rating
  rating: { type: ratingBreakdownSchema, required: true },
  
  // Content
  title: { 
    type: String, 
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Review content is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [10000, 'Review cannot exceed 10000 characters']
  },
  
  // Pros and Cons
  pros: [{ type: String, maxlength: 200 }],
  cons: [{ type: String, maxlength: 200 }],
  
  // Recommendation
  wouldRecommend: { type: Boolean },
  recommendationScore: { type: Number, min: 0, max: 10 }, // NPS style
  
  // Media
  media: [reviewMediaSchema],
  
  // Voting/Helpfulness
  votes: [voteSchema],
  helpfulCount: { type: Number, default: 0 },
  notHelpfulCount: { type: Number, default: 0 },
  helpfulnessScore: { type: Number, default: 0 }, // helpful - notHelpful
  
  // Replies
  replies: [replySchema],
  replyCount: { type: Number, default: 0 },
  hasSellerReply: { type: Boolean, default: false },
  
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged', 'hidden'],
    default: 'pending'
  },
  moderationNotes: { type: String },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },
  
  // Flags/Reports
  flags: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { 
      type: String, 
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'irrelevant', 'other']
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  flagCount: { type: Number, default: 0 },
  
  // Sentiment Analysis (can be populated by ML)
  sentiment: {
    score: { type: Number, min: -1, max: 1 }, // -1 negative, 0 neutral, 1 positive
    magnitude: { type: Number, min: 0 },
    label: { type: String, enum: ['positive', 'neutral', 'negative', 'mixed'] }
  },
  
  // Keywords extracted (for aggregation)
  keywords: [{ type: String }],
  
  // Featured/Pinned
  isFeatured: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  
  // Edit history
  isEdited: { type: Boolean, default: false },
  editHistory: [{
    content: { type: String },
    rating: { type: Number },
    editedAt: { type: Date, default: Date.now }
  }],
  lastEditedAt: { type: Date },
  
  // Source
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'email', 'imported', 'social'],
    default: 'website'
  },
  importedFrom: { type: String },
  
  // Location
  location: {
    country: { type: String },
    city: { type: String }
  },
  
  // Device info
  device: {
    type: { type: String, enum: ['desktop', 'mobile', 'tablet'] },
    os: { type: String },
    browser: { type: String }
  },
  
  // Usage context (for product reviews)
  usageContext: {
    duration: { type: String, enum: ['less_than_week', 'week_to_month', '1_to_3_months', '3_to_6_months', '6_to_12_months', 'over_year'] },
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'occasionally'] },
    purpose: { type: String }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Average rating from breakdown
reviewSchema.virtual('averageRating').get(function() {
  if (!this.rating) return null;
  const ratings = Object.values(this.rating.toObject()).filter(v => typeof v === 'number' && v >= 1 && v <= 5);
  if (ratings.length === 0) return null;
  return ratings.reduce((a, b) => a + b, 0) / ratings.length;
});

// Has media virtual
reviewSchema.virtual('hasMedia').get(function() {
  return this.media && this.media.length > 0;
});

// Helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpfulCount + this.notHelpfulCount;
  if (total === 0) return 0;
  return this.helpfulCount / total;
});

// ============== INDEXES ==============
reviewSchema.index({ targetType: 1, product: 1 });
reviewSchema.index({ targetType: 1, post: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ 'rating.overall': -1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ helpfulCount: -1 });
reviewSchema.index({ helpfulnessScore: -1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ isVerifiedPurchase: 1 });
reviewSchema.index({ isFeatured: 1 });
reviewSchema.index({ 'sentiment.label': 1 });
reviewSchema.index({ keywords: 1 });

// Compound indexes
reviewSchema.index({ product: 1, status: 1, 'rating.overall': -1 });
reviewSchema.index({ product: 1, isVerifiedPurchase: 1, status: 1 });
reviewSchema.index({ user: 1, targetType: 1, createdAt: -1 });

// Text index for search
reviewSchema.index({ 
  title: 'text', 
  content: 'text',
  pros: 'text',
  cons: 'text'
});

// ============== MIDDLEWARE ==============
reviewSchema.pre('save', function(next) {
  // Update counts
  this.helpfulCount = this.votes?.filter(v => v.type === 'helpful').length || 0;
  this.notHelpfulCount = this.votes?.filter(v => v.type === 'not_helpful').length || 0;
  this.helpfulnessScore = this.helpfulCount - this.notHelpfulCount;
  this.replyCount = this.replies?.length || 0;
  this.hasSellerReply = this.replies?.some(r => r.authorType === 'seller' || r.isOfficial) || false;
  this.flagCount = this.flags?.length || 0;
  
  next();
});

// ============== STATIC METHODS ==============
reviewSchema.statics.findByProduct = function(productId, options = {}) {
  const query = { product: productId, targetType: 'product', status: 'approved' };
  return this.find(query)
    .sort(options.sort || { helpfulnessScore: -1, createdAt: -1 })
    .limit(options.limit || 10);
};

reviewSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

reviewSchema.statics.getProductRatingStats = function(productId) {
  return this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), targetType: 'product', status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating.overall' },
        totalReviews: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating.overall', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating.overall', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating.overall', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating.overall', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating.overall', 5] }, 1, 0] } },
        recommendPercentage: { 
          $avg: { $cond: ['$wouldRecommend', 100, 0] }
        },
        verifiedPurchaseCount: {
          $sum: { $cond: ['$isVerifiedPurchase', 1, 0] }
        }
      }
    }
  ]);
};

// Create and export Review model
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
