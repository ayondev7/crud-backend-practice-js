/**
 * MONGOOSE POST MODEL
 * 
 * Complex Post model with nested comments, reactions, and aggregation-friendly fields
 */

const mongoose = require('mongoose');

// Sub-schema for Media attachments
const mediaSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['image', 'video', 'audio', 'document', 'embed'],
    required: true 
  },
  url: { type: String, required: true },
  thumbnail: { type: String },
  caption: { type: String, maxlength: 500 },
  altText: { type: String },
  dimensions: {
    width: { type: Number },
    height: { type: Number }
  },
  fileSize: { type: Number }, // in bytes
  duration: { type: Number }, // for video/audio in seconds
  mimeType: { type: String },
  order: { type: Number, default: 0 }
}, { _id: true });

// Sub-schema for Reactions (likes, love, etc.)
const reactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'],
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

// Sub-schema for Comments (nested with replies)
const replySchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 2000 },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [reactionSchema],
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, maxlength: 5000 },
  mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reactions: [reactionSchema],
  replies: [replySchema],
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date }
}, { timestamps: true });

// Sub-schema for Revision History
const revisionSchema = new mongoose.Schema({
  title: { type: String },
  content: { type: String },
  editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  editReason: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Sub-schema for SEO metadata
const seoSchema = new mongoose.Schema({
  metaTitle: { type: String, maxlength: 70 },
  metaDescription: { type: String, maxlength: 160 },
  focusKeyword: { type: String },
  canonicalUrl: { type: String },
  ogImage: { type: String },
  noIndex: { type: Boolean, default: false },
  noFollow: { type: Boolean, default: false }
}, { _id: false });

// Define Post Schema
const postSchema = new mongoose.Schema({
  // Basic fields
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    trim: true,
    required: [true, 'Content is required']
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  
  // Author and collaborators
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['editor', 'reviewer', 'contributor'], default: 'contributor' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Media and attachments
  featuredImage: {
    url: { type: String },
    altText: { type: String },
    caption: { type: String }
  },
  media: [mediaSchema],
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  
  // Post type and format
  type: {
    type: String,
    enum: ['article', 'tutorial', 'review', 'news', 'opinion', 'guide', 'listicle', 'video', 'podcast'],
    default: 'article'
  },
  format: {
    type: String,
    enum: ['standard', 'gallery', 'video', 'audio', 'quote', 'link'],
    default: 'standard'
  },
  
  // Publishing status
  status: {
    type: String,
    enum: ['draft', 'pending_review', 'scheduled', 'published', 'archived', 'trash'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'password_protected', 'members_only'],
    default: 'public'
  },
  password: { type: String, select: false }, // For password protected posts
  publishedAt: { type: Date },
  scheduledAt: { type: Date },
  
  // Engagement (embedded for aggregation)
  reactions: [reactionSchema],
  comments: [commentSchema],
  
  // Denormalized stats (for fast queries and aggregations)
  stats: {
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    readTime: { type: Number, default: 0 }, // in minutes
    reactionsCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 }
  },
  
  // View history (for analytics aggregation)
  viewHistory: [{
    date: { type: Date },
    count: { type: Number },
    uniqueCount: { type: Number }
  }],
  
  // Related content
  relatedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  series: {
    name: { type: String },
    part: { type: Number },
    totalParts: { type: Number }
  },
  
  // Products mentioned/linked
  mentionedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // SEO
  seo: { type: seoSchema, default: () => ({}) },
  
  // Revision history
  revisions: [revisionSchema],
  currentRevision: { type: Number, default: 1 },
  
  // Moderation
  isFeatured: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true },
  moderationStatus: {
    type: String,
    enum: ['approved', 'pending', 'flagged', 'rejected'],
    default: 'approved'
  },
  moderationNotes: { type: String },
  moderatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  moderatedAt: { type: Date },
  
  // Source attribution
  source: {
    name: { type: String },
    url: { type: String },
    isSponsored: { type: Boolean, default: false }
  },
  
  // Geolocation (for location-based posts)
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] }, // [longitude, latitude]
    address: { type: String },
    city: { type: String },
    country: { type: String }
  },
  
  // Difficulty/Reading level (for tutorials)
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  
  // Language
  language: { type: String, default: 'en' },
  translations: [{
    language: { type: String },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
  }]
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Is published virtual
postSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && this.publishedAt <= new Date();
});

// Total engagement virtual
postSchema.virtual('totalEngagement').get(function() {
  return (this.stats?.reactionsCount || 0) + 
         (this.stats?.commentsCount || 0) + 
         (this.stats?.sharesCount || 0);
});

// Word count virtual
postSchema.virtual('wordCount').get(function() {
  if (!this.content) return 0;
  return this.content.split(/\s+/).filter(word => word.length > 0).length;
});

// Reaction breakdown virtual
postSchema.virtual('reactionBreakdown').get(function() {
  const breakdown = {};
  this.reactions?.forEach(r => {
    breakdown[r.type] = (breakdown[r.type] || 0) + 1;
  });
  return breakdown;
});

// ============== INDEXES ==============
// Note: slug already has index from unique: true in schema
postSchema.index({ author: 1 });
postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ type: 1, status: 1 });
postSchema.index({ 'stats.views': -1 });
postSchema.index({ 'stats.reactionsCount': -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ isFeatured: 1, publishedAt: -1 });
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ language: 1 });
postSchema.index({ difficulty: 1 });

// Text index for search
postSchema.index({ 
  title: 'text', 
  content: 'text', 
  excerpt: 'text',
  'seo.metaDescription': 'text'
}, {
  weights: { title: 10, excerpt: 5, content: 1 }
});

// Compound indexes for common queries
postSchema.index({ author: 1, status: 1, publishedAt: -1 });
postSchema.index({ category: 1, status: 1, publishedAt: -1 });

// ============== MIDDLEWARE ==============
postSchema.pre('save', function(next) {
  // Auto-generate slug from title
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  
  // Auto-generate excerpt
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content?.substring(0, 300) + '...';
  }
  
  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content?.split(/\s+/).length || 0;
    this.stats.readTime = Math.ceil(wordCount / 200);
  }
  
  // Update stats counts
  this.stats.reactionsCount = this.reactions?.length || 0;
  this.stats.commentsCount = this.comments?.length || 0;
  
  next();
});

// ============== STATIC METHODS ==============
postSchema.statics.findPublished = function() {
  return this.find({ status: 'published', publishedAt: { $lte: new Date() } });
};

postSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'published' });
};

postSchema.statics.getTrending = function(limit = 10, days = 7) {
  const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ 
    status: 'published', 
    publishedAt: { $gte: dateThreshold }
  })
    .sort({ 'stats.views': -1, 'stats.reactionsCount': -1 })
    .limit(limit);
};

// Create and export Post model
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
