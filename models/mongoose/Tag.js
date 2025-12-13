/**
 * MONGOOSE TAG MODEL
 * 
 * Tag model for organizing content with usage tracking and aggregation support
 */

const mongoose = require('mongoose');

// Define Tag Schema
const tagSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Tag name is required'],
    trim: true,
    minlength: [2, 'Tag name must be at least 2 characters'],
    maxlength: [50, 'Tag name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Type
  type: {
    type: String,
    enum: ['product', 'post', 'general'],
    default: 'general'
  },
  
  // Visual
  color: { type: String, default: '#6B7280' },
  icon: { type: String },
  
  // Statistics (denormalized for aggregation)
  stats: {
    productCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    totalUsage: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0 },
    lastUsedAt: { type: Date }
  },
  
  // Usage history (for trending analysis)
  usageHistory: [{
    date: { type: Date },
    count: { type: Number }
  }],
  
  // Related tags
  relatedTags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  synonyms: [{ type: String }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  
  // Featured/Trending
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  
  // SEO
  seo: {
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 }
  },
  
  // Admin
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Products virtual
tagSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'tags'
});

// Posts virtual
tagSchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'tags'
});

// ============== INDEXES ==============
tagSchema.index({ name: 1 });
tagSchema.index({ slug: 1 }, { unique: true });
tagSchema.index({ type: 1 });
tagSchema.index({ status: 1 });
tagSchema.index({ 'stats.totalUsage': -1 });
tagSchema.index({ 'stats.trendingScore': -1 });
tagSchema.index({ isFeatured: 1 });
tagSchema.index({ isTrending: 1 });
tagSchema.index({ synonyms: 1 });

// Text index
tagSchema.index({ name: 'text', description: 'text', synonyms: 'text' });

// ============== MIDDLEWARE ==============
tagSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Update total usage
  this.stats.totalUsage = (this.stats.productCount || 0) + (this.stats.postCount || 0);
  
  next();
});

// ============== STATIC METHODS ==============
tagSchema.statics.findPopular = function(limit = 20) {
  return this.find({ status: 'active' })
    .sort({ 'stats.totalUsage': -1 })
    .limit(limit);
};

tagSchema.statics.findTrending = function(limit = 10) {
  return this.find({ status: 'active', isTrending: true })
    .sort({ 'stats.trendingScore': -1 })
    .limit(limit);
};

tagSchema.statics.findOrCreate = async function(name, type = 'general') {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  let tag = await this.findOne({ slug });
  if (!tag) {
    tag = await this.create({ name, slug, type });
  }
  return tag;
};

tagSchema.statics.search = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { synonyms: { $regex: query, $options: 'i' } }
    ],
    status: 'active'
  }).limit(20);
};

// Create and export Tag model
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
