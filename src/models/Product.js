import mongoose from 'mongoose';

// Helper function to safely generate slugs
const generateSlug = (text) => {
  if (!text) return null;
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special characters
    .replace(/[\s_-]+/g, '-')   // collapse spaces and underscores
    .replace(/^-+|-+$/g, '');   // trim dashes
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '', // Add explicit default value
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  comparePrice: {
    type: Number,
    default: null, // Use null instead of undefined
  },
  images: {
    type: [String],
    default: [],
  },
  mainImage: {
    type: String,
    default: '',
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  specifications: {
    processor: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    display: { type: String, default: '' },
    graphics: { type: String, default: '' },
    graphics2: { type: String, default: '' },
    battery: { type: String, default: '' },
    keyboard: { type: String, default: '' },
    operatingSystem: { type: String, default: '' },
  },
  features: {
    type: [String],
    default: [],
  },
  sku: {
    type: String,
    index: true,
    unique: true,
  },
  slug: {
    type: String,
    default: function () {
      return generateSlug(this.name) || `product-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    },
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// If slug is missing or invalid, auto-generate it before save
productSchema.pre('save', function (next) {
  if (!this.slug || this.slug.trim() === '') {
    this.slug = generateSlug(this.name) || `product-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }
  next();
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);