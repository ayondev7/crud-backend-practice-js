/**
 * MONGOOSE MODELS INDEX
 * 
 * Central export point for all Mongoose models
 * Import all models from this file for easy access
 */

import User from './User.js';
import Post from './Post.js';
import Product from './Product.js';
import Order from './Order.js';
import Review from './Review.js';
import Category from './Category.js';
import Tag from './Tag.js';

export {
  User,
  Post,
  Product,
  Order,
  Review,
  Category,
  Tag
};

/**
 * ============================================
 * MODEL RELATIONSHIPS OVERVIEW
 * ============================================
 * 
 * USER
 *   ├── has many POSTS (author)
 *   ├── has many ORDERS
 *   ├── has many REVIEWS
 *   ├── follows many USERS
 *   ├── followed by many USERS
 *   └── referred by one USER
 * 
 * POST
 *   ├── belongs to USER (author)
 *   ├── has many collaborator USERS
 *   ├── belongs to CATEGORY
 *   ├── has many TAGS
 *   ├── has many COMMENTS (embedded)
 *   ├── has many REACTIONS (embedded)
 *   ├── mentions many PRODUCTS
 *   └── has many REVIEWS
 * 
 * PRODUCT
 *   ├── belongs to CATEGORY
 *   ├── belongs to subcategory (CATEGORY)
 *   ├── has many TAGS
 *   ├── has many REVIEWS
 *   ├── has many VARIANTS (embedded)
 *   ├── related to many PRODUCTS
 *   └── frequently bought with PRODUCTS
 * 
 * ORDER
 *   ├── belongs to USER
 *   ├── has many PRODUCTS (through items)
 *   ├── has SHIPPING details (embedded)
 *   ├── has PAYMENT details (embedded)
 *   └── has many REFUNDS (embedded)
 * 
 * REVIEW
 *   ├── belongs to USER
 *   ├── belongs to PRODUCT (optional)
 *   ├── belongs to POST (optional)
 *   ├── has many REPLIES (embedded)
 *   └── has many VOTES (embedded)
 * 
 * CATEGORY
 *   ├── has many child CATEGORIES
 *   ├── belongs to parent CATEGORY
 *   ├── has many PRODUCTS
 *   └── has many POSTS
 * 
 * TAG
 *   ├── has many PRODUCTS
 *   ├── has many POSTS
 *   └── related to many TAGS
 * 
 * ============================================
 * AGGREGATION PRACTICE IDEAS
 * ============================================
 * 
 * BASIC QUERIES:
 * - Find all products in a category
 * - Find all posts by a user
 * - Find orders by status
 * - Search products by text
 * 
 * INTERMEDIATE AGGREGATIONS:
 * - Average product rating by category
 * - Total revenue by month
 * - Top 10 best-selling products
 * - Most active users (by posts/reviews)
 * - Products with low stock
 * 
 * ADVANCED AGGREGATIONS:
 * - Sales funnel analysis (views → cart → purchase)
 * - Customer lifetime value calculation
 * - Product recommendation based on order history
 * - User engagement metrics (posts, comments, reactions)
 * - Revenue by category with subcategory breakdown
 * - Time-series analysis of orders/reviews
 * - Geographic distribution of sales
 * - Cohort analysis of users by signup date
 * - Review sentiment analysis summary
 * - Tag co-occurrence analysis
 * 
 * $LOOKUP EXAMPLES:
 * - Join orders with products and users
 * - Join reviews with products and get aggregated stats
 * - Build user profiles with all related data
 * - Category tree with product counts
 * 
 * COMPLEX PIPELINES:
 * - $unwind arrays (variants, comments, order items)
 * - $graphLookup for category hierarchy
 * - $bucket for price range distribution
 * - $facet for multi-dimension aggregation
 * - $merge for materialized views
 * - $redact for field-level security
 * - $geoNear for location-based queries
 */
