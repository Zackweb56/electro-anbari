import mongoose from 'mongoose';

const configSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'Electro Anbari',
  },
  storeDescription: {
    type: String,
    default: 'Votre magasin d\'ordinateurs de confiance',
  },
  contactEmail: {
    type: String,
    default: 'contact@electro-anbari.com',
  },
  contactPhone: {
    type: String,
    default: '+212 6 00 00 00 00',
  },
  whatsappNumber1: {
    type: String,
    default: '+212600000000',
  },
  whatsappNumber2: {
    type: String,
    default: '',
  },
  address: {
    type: String,
    default: 'Fequih ben saleh, Maroc',
  },
  latitude: {
    type: Number,
    default: 33.5731,
  },
  longitude: {
    type: Number,
    default: -7.5898,
  },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
  },
  shippingPolicy: {
    type: String,
    default: 'Livraison gratuite à Casablanca. Délai de livraison: 2-3 jours ouvrables.',
  },
  returnPolicy: {
    type: String,
    default: 'Retours acceptés sous 14 jours. Produit doit être dans son emballage d\'origine.',
  },
  openingHours: {
    type: String,
    default: 'Lun - Ven: 9h-18h',
  },
  youtubeVideo: {
    type: String,
    default: '',
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Config || mongoose.model('Config', configSchema);