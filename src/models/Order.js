// src/models/Order.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productImage: {
      type: String,
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  notes: {
    type: String,
    trim: true,
  },
  shippingNotes: {
    type: String,
    trim: true,
  },
  whatsappConfirmed: {
    type: Boolean,
    default: false,
  },
  // Add this field to track WhatsApp confirmation explicitly
  customerWhatsappConfirmed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Generate order number before saving
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.models.Order.countDocuments();
    this.orderNumber = `ORD-${Date.now().toString().slice(-6)}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);