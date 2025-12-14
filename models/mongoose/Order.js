/**
 * MONGOOSE ORDER MODEL
 * 
 * Complex Order model for e-commerce with line items, shipping, payments, and aggregation-friendly fields
 */

import mongoose from 'mongoose';

// Sub-schema for Order Items
const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: mongoose.Schema.Types.ObjectId }, // Reference to variant within product
  name: { type: String, required: true }, // Snapshot at time of order
  sku: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true }, // Price at time of order
  originalPrice: { type: Number }, // Original price before discount
  discount: {
    type: { type: String, enum: ['percentage', 'fixed'] },
    value: { type: Number },
    code: { type: String }
  },
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  weight: { type: Number }, // in grams
  attributes: {
    color: { type: String },
    size: { type: String },
    customization: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'returned', 'refunded', 'cancelled'],
    default: 'pending'
  },
  fulfillment: {
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    trackingNumber: { type: String },
    carrier: { type: String }
  }
}, { _id: true });

// Sub-schema for Shipping Address
const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  company: { type: String },
  street1: { type: String, required: true },
  street2: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  instructions: { type: String }
}, { _id: false });

// Sub-schema for Payment Details
const paymentSchema = new mongoose.Schema({
  method: { 
    type: String, 
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'cod', 'wallet', 'crypto'],
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'authorized', 'captured', 'partially_refunded', 'refunded', 'failed', 'cancelled'],
    default: 'pending'
  },
  transactionId: { type: String },
  gatewayResponse: { type: mongoose.Schema.Types.Mixed },
  card: {
    brand: { type: String }, // visa, mastercard, amex
    last4: { type: String },
    expiryMonth: { type: Number },
    expiryYear: { type: Number }
  },
  billingAddress: { type: shippingAddressSchema },
  paidAt: { type: Date },
  paidAmount: { type: Number }
}, { _id: true, timestamps: true });

// Sub-schema for Refunds
const refundSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  reason: { 
    type: String, 
    enum: ['customer_request', 'damaged', 'wrong_item', 'not_as_described', 'late_delivery', 'other'],
    required: true 
  },
  notes: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'processed', 'rejected'],
    default: 'pending'
  },
  items: [{ type: mongoose.Schema.Types.ObjectId }], // Order item IDs
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  transactionId: { type: String }
}, { _id: true, timestamps: true });

// Sub-schema for Shipping
const shippingSchema = new mongoose.Schema({
  method: { 
    type: String, 
    enum: ['standard', 'express', 'overnight', 'pickup', 'free'],
    required: true 
  },
  carrier: { type: String },
  trackingNumber: { type: String },
  trackingUrl: { type: String },
  estimatedDelivery: { type: Date },
  actualDelivery: { type: Date },
  cost: { type: Number, default: 0 },
  weight: { type: Number }, // Total weight in grams
  packages: [{
    trackingNumber: { type: String },
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number }
    },
    items: [{ type: mongoose.Schema.Types.ObjectId }] // Order item IDs
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  statusHistory: [{
    status: { type: String },
    location: { type: String },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String }
  }]
}, { _id: false });

// Sub-schema for Timeline/Activity
const timelineSchema = new mongoose.Schema({
  event: {
    type: String,
    enum: ['created', 'confirmed', 'payment_received', 'processing', 'shipped', 'delivered', 'cancelled', 'refund_requested', 'refunded', 'note_added'],
    required: true
  },
  description: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
}, { _id: true });

// Define Order Schema
const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String },
  isGuestCheckout: { type: Boolean, default: false },
  
  // Items
  items: [orderItemSchema],
  itemCount: { type: Number, default: 0 },
  
  // Addresses
  shippingAddress: { type: shippingAddressSchema, required: true },
  billingAddress: { type: shippingAddressSchema },
  sameAsShipping: { type: Boolean, default: true },
  
  // Pricing
  pricing: {
    subtotal: { type: Number, required: true }, // Sum of item prices before discounts
    itemDiscount: { type: Number, default: 0 }, // Discounts on individual items
    orderDiscount: { type: Number, default: 0 }, // Order-level discounts
    couponDiscount: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    shippingDiscount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    taxRate: { type: Number }, // percentage
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  // Discounts/Coupons Applied
  coupons: [{
    code: { type: String },
    type: { type: String, enum: ['percentage', 'fixed', 'free_shipping'] },
    value: { type: Number },
    discount: { type: Number } // Actual discount amount applied
  }],
  
  // Payment
  payment: paymentSchema,
  payments: [paymentSchema], // For split payments
  
  // Shipping
  shipping: shippingSchema,
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'partially_shipped', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded', 'on_hold', 'failed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'failed'],
    default: 'pending'
  },
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned'],
    default: 'unfulfilled'
  },
  
  // Refunds
  refunds: [refundSchema],
  totalRefunded: { type: Number, default: 0 },
  
  // Timeline
  timeline: [timelineSchema],
  
  // Dates
  confirmedAt: { type: Date },
  paidAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  
  // Source/Channel
  source: {
    type: String,
    enum: ['web', 'mobile_app', 'pos', 'phone', 'marketplace', 'social', 'api'],
    default: 'web'
  },
  channel: { type: String }, // Specific marketplace or channel name
  
  // Flags
  flags: {
    isGift: { type: Boolean, default: false },
    giftMessage: { type: String },
    giftWrapping: { type: Boolean, default: false },
    isPriority: { type: Boolean, default: false },
    requiresSignature: { type: Boolean, default: false },
    isSubscription: { type: Boolean, default: false },
    isFraudulent: { type: Boolean, default: false },
    isTest: { type: Boolean, default: false }
  },
  
  // Notes
  customerNotes: { type: String },
  internalNotes: { type: String },
  
  // Attribution
  attribution: {
    source: { type: String }, // google, facebook, direct, etc.
    medium: { type: String }, // cpc, organic, referral
    campaign: { type: String },
    referrer: { type: String }
  },
  
  // Related
  parentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }, // For split orders
  childOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  
  // Processing
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  warehouse: { type: String },
  
  // Tags (for custom categorization)
  tags: [{ type: String }],
  
  // IP and location (for fraud detection)
  ipAddress: { type: String },
  userAgent: { type: String },
  location: {
    country: { type: String },
    region: { type: String },
    city: { type: String }
  }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ============== VIRTUALS ==============

// Total items quantity
orderSchema.virtual('totalQuantity').get(function() {
  return this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
});

// Is paid virtual
orderSchema.virtual('isPaid').get(function() {
  return this.paymentStatus === 'paid';
});

// Can be cancelled
orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed', 'on_hold'].includes(this.status);
});

// Days since order
orderSchema.virtual('daysSinceOrder').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Profit margin (if cost data available)
orderSchema.virtual('estimatedProfit').get(function() {
  // This would need actual cost data from products
  return null;
});

// ============== INDEXES ==============
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ user: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ fulfillmentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'pricing.total': -1 });
orderSchema.index({ source: 1 });
orderSchema.index({ 'items.product': 1 });
orderSchema.index({ 'shippingAddress.country': 1 });
orderSchema.index({ 'shippingAddress.city': 1 });
orderSchema.index({ tags: 1 });

// Compound indexes for common queries
orderSchema.index({ user: 1, status: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1, status: 1 });

// ============== MIDDLEWARE ==============
orderSchema.pre('save', function(next) {
  // Calculate item count
  this.itemCount = this.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Auto-generate order number if not present
  if (this.isNew && !this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  
  next();
});

// ============== STATIC METHODS ==============
orderSchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

orderSchema.statics.findPending = function() {
  return this.find({ status: 'pending' });
};

orderSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  });
};

orderSchema.statics.getRevenueByPeriod = function(startDate, endDate) {
  return this.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate }, paymentStatus: 'paid' } },
    { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' }, orderCount: { $sum: 1 } } }
  ]);
};

// Create and export Order model
const Order = mongoose.model('Order', orderSchema);

export default Order;
