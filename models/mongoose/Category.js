/**
 * MONGOOSE CATEGORY MODEL
 * 
 * Hierarchical Category model for organizing products and posts with nested structure
 */

import mongoose from 'mongoose';

// Sub-schema for SEO
const seoSchema = new mongoose.Schema({
  metaTitle: { type: String, maxlength: 70 },
  metaDescription: { type: String, maxlength: 160 },
  focusKeyword: { type: String },
  canonicalUrl: { type: String }
}, { _id: false });

// Define Category Schema
const categorySchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Type (what this category is for)
  type: {
    type: String,
    enum: ['product', 'post', 'both'],
    default: 'both'
  },
  
  // Hierarchy
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  ancestors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  level: { type: Number, default: 0 }, // 0 = root, 1 = child, etc.
  path: { type: String }, // e.g., "electronics/phones/smartphones"
  
  // Media
  image: {
    url: { type: String },
    thumbnail: { type: String },
    altText: { type: String }
  },
  icon: { type: String }, // Icon class or URL
  color: { type: String }, // Brand color for category
  
  // Display
  displayOrder: { type: Number, default: 0 },
  showInMenu: { type: Boolean, default: true },
  showInFilters: { type: Boolean, default: true },
  showInFooter: { type: Boolean, default: false },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  
  // SEO
  seo: { type: seoSchema, default: () => ({}) },
  
  // Statistics (denormalized for aggregation)
  stats: {
    productCount: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  
  // Featured products in this category
  featuredProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Attributes/Filters for products in this category
  attributes: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['select', 'multiselect', 'range', 'color', 'size'], default: 'select' },
    values: [{ type: String }],
    isFilterable: { type: Boolean, default: true },
    isRequired: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 }
  }],
  
  // Price range in this category (for filters)
  priceRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    average: { type: Number, default: 0 }
  },
  
  // Commission rate (for marketplace)
  commissionRate: { type: Number, default: 0, min: 0, max: 100 },
  
  // Tax info
  taxClass: { type: String, default: 'standard' },
  
  // Custom fields
  customFields: { type: mongoose.Schema.Types.Mixed },
  
  // Admin
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Children virtual
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent'
});

// Products virtual
categorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category'
});

// Posts virtual
categorySchema.virtual('posts', {
  ref: 'Post',
  localField: '_id',
  foreignField: 'category'
});

// Is root category
categorySchema.virtual('isRoot').get(function() {
  return !this.parent;
});

// Full path name
categorySchema.virtual('fullPath').get(function() {
  return this.path || this.slug;
});

// ============== INDEXES ==============
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ parent: 1 });
categorySchema.index({ ancestors: 1 });
categorySchema.index({ type: 1 });
categorySchema.index({ status: 1 });
categorySchema.index({ level: 1 });
categorySchema.index({ displayOrder: 1 });
categorySchema.index({ 'stats.productCount': -1 });
categorySchema.index({ path: 1 });

// Compound indexes
categorySchema.index({ type: 1, status: 1 });
categorySchema.index({ parent: 1, displayOrder: 1 });

// Text index
categorySchema.index({ name: 'text', description: 'text' });

// ============== MIDDLEWARE ==============
categorySchema.pre('save', async function(next) {
  // Auto-generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Update ancestors and level
  if (this.isModified('parent')) {
    if (this.parent) {
      const parentCategory = await this.constructor.findById(this.parent);
      if (parentCategory) {
        this.ancestors = [...(parentCategory.ancestors || []), parentCategory._id];
        this.level = parentCategory.level + 1;
        this.path = `${parentCategory.path || parentCategory.slug}/${this.slug}`;
      }
    } else {
      this.ancestors = [];
      this.level = 0;
      this.path = this.slug;
    }
  }
  
  next();
});

// ============== STATIC METHODS ==============
categorySchema.statics.findRoots = function() {
  return this.find({ parent: null, status: 'active' }).sort({ displayOrder: 1 });
};

categorySchema.statics.findBySlug = function(slug) {
  return this.findOne({ slug, status: 'active' });
};

categorySchema.statics.getTree = async function() {
  const categories = await this.find({ status: 'active' }).sort({ level: 1, displayOrder: 1 });
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => String(cat.parent) === String(parentId))
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree(null);
};

categorySchema.statics.getDescendants = async function(categoryId) {
  return this.find({ ancestors: categoryId });
};

// Create and export Category model
const Category = mongoose.model('Category', categorySchema);

export default Category;
