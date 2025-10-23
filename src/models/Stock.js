import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
  },
  reserved: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

stockSchema.index({ product: 1 }, { unique: true });

export default mongoose.models.Stock || mongoose.model('Stock', stockSchema);