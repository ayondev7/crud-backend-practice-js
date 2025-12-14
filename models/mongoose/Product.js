/**
 * MONGOOSE PRODUCT MODEL
 * 
 * Complex Product model with variants, inventory, reviews, and aggregation-friendly fields
 */

import mongoose from 'mongoose';

// Sub-schema for Product Images
const productImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  thumbnail: { type: String },
  altText: { type: String },
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  color: { type: String }, // Associated color variant
  tags: [{ type: String }]
}, { _id: true });

// Sub-schema for Product Variants (Size, Color, etc.)
const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true },
  attributes: {
    color: { type: String },
    size: { type: String },
    material: { type: String },
    style: { type: String }
  },
  price: { type: Number, required: true },
  compareAtPrice: { type: Number }, // Original price for showing discount
  cost: { type: Number }, // Cost price for profit calculation
  stock: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  weight: { type: Number }, // in grams
  dimensions: {
    length: { type: Number },
    width: { type: Number },
    height: { type: Number }
  },
  barcode: { type: String },
  images: [productImageSchema],
  isActive: { type: Boolean, default: true }
}, { _id: true, timestamps: true });

// Sub-schema for Price History (for aggregation)
const priceHistorySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  compareAtPrice: { type: Number },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Sub-schema for Inventory Log
const inventoryLogSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['restock', 'sale', 'return', 'adjustment', 'damaged', 'transfer'],
    required: true 
  },
  quantity: { type: Number, required: true }, // positive for add, negative for remove
  previousStock: { type: Number },
  newStock: { type: Number },
  variantId: { type: mongoose.Schema.Types.ObjectId },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Sub-schema for Specifications
const specificationSchema = new mongoose.Schema({
  group: { type: String }, // e.g., "Technical", "Physical"
  name: { type: String, required: true },
  value: { type: String, required: true },
  unit: { type: String }
}, { _id: false });

// Sub-schema for FAQ
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublished: { type: Boolean, default: true },
  helpfulCount: { type: Number, default: 0 }
}, { _id: true, timestamps: true });

// Sub-schema for Bundle Items
const bundleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
  discount: { type: Number, default: 0 } // percentage discount for bundle
}, { _id: false });

// Define Product Schema
const productSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  sku: {
    type: String,
    unique: true,
    required: [true, 'SKU is required'],
    uppercase: true,
    trim: true
  },
  description: {
    short: { type: String, maxlength: 500 },
    full: { type: String, maxlength: 10000 },
    features: [{ type: String }] // Bullet points
  },
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  collections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Collection' }],
  
  // Product Type
  type: {
    type: String,
    enum: ['physical', 'digital', 'service', 'subscription', 'bundle'],
    default: 'physical'
  },
  
  // Pricing
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 }, // Original/MSRP price
    cost: { type: Number, min: 0 }, // Cost price
    currency: { type: String, default: 'USD' },
    taxable: { type: Boolean, default: true },
    taxClass: { type: String, enum: ['standard', 'reduced', 'zero'], default: 'standard' }
  },
  priceHistory: [priceHistorySchema],
  
  // Variants
  variants: [variantSchema],
  hasVariants: { type: Boolean, default: false },
  variantOptions: [{
    name: { type: String }, // e.g., "Color", "Size"
    values: [{ type: String }] // e.g., ["Red", "Blue", "Green"]
  }],
  
  // Images
  images: [productImageSchema],
  
  // Inventory (for non-variant products)
  inventory: {
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackQuantity: { type: Boolean, default: true },
    allowBackorder: { type: Boolean, default: false },
    maxPerOrder: { type: Number },
    warehouse: { type: String },
    location: { type: String } // Shelf/bin location
  },
  inventoryLog: [inventoryLogSchema],
  
  // Shipping
  shipping: {
    weight: { type: Number }, // in grams
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, enum: ['cm', 'in'], default: 'cm' }
    },
    requiresShipping: { type: Boolean, default: true },
    freeShipping: { type: Boolean, default: false },
    shippingClass: { type: String },
    originCountry: { type: String },
    hsCode: { type: String } // Harmonized System code for customs
  },
  
  // SEO
  seo: {
    metaTitle: { type: String, maxlength: 70 },
    metaDescription: { type: String, maxlength: 160 },
    focusKeyword: { type: String },
    canonicalUrl: { type: String }
  },
  
  // Specifications
  specifications: [specificationSchema],
  
  // Reviews & Ratings (denormalized stats)
  reviewStats: {
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    ratingDistribution: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    },
    recommendationPercentage: { type: Number, default: 0 }
  },
  
  // Sales Stats (denormalized for aggregation)
  salesStats: {
    totalSold: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    averageOrderQuantity: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    lastSoldAt: { type: Date }
  },
  
  // Sales History by Period (for time-based aggregations)
  salesHistory: [{
    period: { type: String }, // "2024-01", "2024-W01", "2024-01-15"
    periodType: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    quantity: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    orders: { type: Number, default: 0 }
  }],
  
  // View Stats
  viewStats: {
    totalViews: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    addToCartCount: { type: Number, default: 0 },
    wishlistCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  
  // FAQs
  faqs: [faqSchema],
  
  // Bundle (for bundle products)
  bundle: {
    items: [bundleItemSchema],
    discount: { type: Number }, // Total bundle discount percentage
    savingsAmount: { type: Number } // Calculated savings
  },
  
  // Related Products
  relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  crossSellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  upSellProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  frequentlyBoughtWith: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    count: { type: Number, default: 0 }
  }],
  
  // Vendor/Supplier
  vendor: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    name: { type: String },
    sku: { type: String }, // Vendor's SKU
    cost: { type: Number },
    leadTime: { type: Number } // Days to receive from supplier
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued', 'out_of_stock', 'coming_soon'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden', 'search_only', 'catalog_only'],
    default: 'visible'
  },
  publishedAt: { type: Date },
  
  // Flags
  flags: {
    isNew: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    isLimitedEdition: { type: Boolean, default: false },
    isExclusive: { type: Boolean, default: false }
  },
  
  // Promotions
  promotions: [{
    type: { type: String, enum: ['percentage', 'fixed', 'buy_x_get_y', 'bundle'] },
    value: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    code: { type: String },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 }
  }],
  
  // Warranty & Returns
  warranty: {
    hasWarranty: { type: Boolean, default: false },
    duration: { type: Number }, // in months
    type: { type: String },
    description: { type: String }
  },
  returnPolicy: {
    returnable: { type: Boolean, default: true },
    returnWindow: { type: Number, default: 30 }, // days
    restockingFee: { type: Number, default: 0 }, // percentage
    conditions: { type: String }
  },
  
  // Digital Product specific
  digital: {
    fileUrl: { type: String },
    fileSize: { type: Number },
    downloadLimit: { type: Number },
    expiryDays: { type: Number }
  },
  
  // Subscription specific
  subscription: {
    interval: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
    intervalCount: { type: Number },
    trialDays: { type: Number, default: 0 }
  },
  
  // Admin/Internal
  internalNotes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Is in stock virtual
productSchema.virtual('isInStock').get(function() {
  if (this.hasVariants) {
    return this.variants?.some(v => v.stock > 0 && v.isActive);
  }
  return this.inventory?.stock > 0;
});

// Total stock virtual
productSchema.virtual('totalStock').get(function() {
  if (this.hasVariants) {
    return this.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
  }
  return this.inventory?.stock || 0;
});

// Current price virtual (considering promotions)
productSchema.virtual('currentPrice').get(function() {
  const now = new Date();
  const activePromo = this.promotions?.find(p => 
    p.startDate <= now && p.endDate >= now && 
    (!p.usageLimit || p.usageCount < p.usageLimit)
  );
  
  if (activePromo) {
    if (activePromo.type === 'percentage') {
      return this.pricing.basePrice * (1 - activePromo.value / 100);
    } else if (activePromo.type === 'fixed') {
      return this.pricing.basePrice - activePromo.value;
    }
  }
  return this.pricing.basePrice;
});

// Discount percentage virtual
productSchema.virtual('discountPercentage').get(function() {
  if (!this.pricing.compareAtPrice || this.pricing.compareAtPrice <= this.pricing.basePrice) {
    return 0;
  }
  return Math.round((1 - this.pricing.basePrice / this.pricing.compareAtPrice) * 100);
});

// Profit margin virtual
productSchema.virtual('profitMargin').get(function() {
  if (!this.pricing.cost) return null;
  return ((this.pricing.basePrice - this.pricing.cost) / this.pricing.basePrice) * 100;
});

// Primary image virtual
productSchema.virtual('primaryImage').get(function() {
  return this.images?.find(img => img.isPrimary) || this.images?.[0];
});

// Low stock virtual
productSchema.virtual('isLowStock').get(function() {
  if (this.hasVariants) {
    return this.variants?.some(v => v.stock <= v.lowStockThreshold && v.stock > 0);
  }
  return this.inventory?.stock <= this.inventory?.lowStockThreshold && this.inventory?.stock > 0;
});

// Reviews virtual
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product'
});

// ============== INDEXES ==============
// Note: slug, sku already have indexes from unique: true in schema
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ status: 1 });
productSchema.index({ 'pricing.basePrice': 1 });
productSchema.index({ 'reviewStats.averageRating': -1 });
productSchema.index({ 'salesStats.totalSold': -1 });
productSchema.index({ 'viewStats.totalViews': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ publishedAt: -1 });
productSchema.index({ 'flags.isFeatured': 1 });
productSchema.index({ 'flags.isBestSeller': 1 });
productSchema.index({ 'flags.isOnSale': 1 });
productSchema.index({ 'vendor.id': 1 });

// Compound indexes
productSchema.index({ category: 1, status: 1, 'pricing.basePrice': 1 });
productSchema.index({ brand: 1, status: 1 });
productSchema.index({ status: 1, 'flags.isFeatured': 1 });

// Text index for search
productSchema.index({ 
  name: 'text', 
  'description.short': 'text',
  'description.full': 'text',
  'seo.metaDescription': 'text'
}, {
  weights: { name: 10, 'description.short': 5, 'description.full': 1 }
});

// ============== MIDDLEWARE ==============
productSchema.pre('save', function(next) {
  // Auto-generate slug
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Update hasVariants flag
  this.hasVariants = this.variants && this.variants.length > 0;
  
  // Update isOnSale flag
  const now = new Date();
  this.flags.isOnSale = this.promotions?.some(p => 
    p.startDate <= now && p.endDate >= now
  ) || (this.pricing.compareAtPrice && this.pricing.compareAtPrice > this.pricing.basePrice);
  
  next();
});

// ============== STATIC METHODS ==============
productSchema.statics.findActive = function() {
  return this.find({ status: 'active', visibility: 'visible' });
};

productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'active' });
};

productSchema.statics.findBestSellers = function(limit = 10) {
  return this.find({ status: 'active' })
    .sort({ 'salesStats.totalSold': -1 })
    .limit(limit);
};

productSchema.statics.findTopRated = function(limit = 10, minReviews = 5) {
  return this.find({ 
    status: 'active',
    'reviewStats.totalReviews': { $gte: minReviews }
  })
    .sort({ 'reviewStats.averageRating': -1 })
    .limit(limit);
};

// Create and export Product model
const Product = mongoose.model('Product', productSchema);

export default Product;
