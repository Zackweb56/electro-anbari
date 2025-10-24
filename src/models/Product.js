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
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  comparePrice: Number,
  images: [String],
  mainImage: {
    type: String,
    default: '',
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  specifications: {
    processor: String,
    ram: String,
    storage: String,
    display: String,
    graphics: String,
    operatingSystem: String,
  },
  features: [String],
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
    // not unique in schema (we manage it via partial index in MongoDB)
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
