// src/components/store/OrderForm.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderForm({ cartItems, onOrderSuccess }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer: {
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    },
    notes: '',
    shippingNotes: '',
    whatsappConfirmed: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('customer.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSwitchChange = (checked) => {
    setFormData(prev => ({
      ...prev,
      whatsappConfirmed: checked
    }));
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Simple alert function for required fields
  const showRequiredFieldAlert = (fieldName) => {
    alert(`Veuillez remplir le champ "${fieldName}" - ce champ est obligatoire.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Enhanced validation with specific field alerts
    if (!formData.customer.name) {
      showRequiredFieldAlert('Nom Complet');
      setIsSubmitting(false);
      return;
    }

    if (!formData.customer.phone) {
      showRequiredFieldAlert('Numéro de Téléphone');
      setIsSubmitting(false);
      return;
    }

    if (!formData.customer.city) {
      showRequiredFieldAlert('Ville');
      setIsSubmitting(false);
      return;
    }

    if (!formData.customer.address) {
      showRequiredFieldAlert('Adresse Complète');
      setIsSubmitting(false);
      return;
    }

    try {
      const orderData = {
        customer: formData.customer,
        notes: formData.notes,
        shippingNotes: formData.shippingNotes,
        whatsappConfirmed: formData.whatsappConfirmed,
        customerWhatsappConfirmed: formData.whatsappConfirmed,
        items: cartItems.map(item => ({
          productId: item._id || item.id,
          quantity: item.quantity
        }))
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('/api/public/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (response.ok) {
        if (onOrderSuccess) {
          onOrderSuccess();
        }
        router.push(`/order/success?orderNumber=${result.order.orderNumber}`);
      } else {
        alert(result.error || 'Échec de la création de la commande');
      }
    } catch (error) {
      console.error('Order submission error:', error);
      alert('Une erreur est survenue lors de la passation de votre commande');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = calculateTotal();
  const showWhatsappSwitch = formData.customer.phone.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Résumé de la Commande</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item._id || item.id} className="flex justify-between items-center border-b pb-3">
                <div className="flex items-center space-x-3">
                  {item.image && (
                    <Image 
                      width={48}
                      height={48} 
                      src={item.image} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qté: {item.quantity} × {item.price} MAD
                    </p>
                  </div>
                </div>
                <p className="font-medium">
                  {(item.price * item.quantity).toFixed(2)} MAD
                </p>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3 border-t">
              <p className="text-lg font-bold">Total</p>
              <p className="text-lg font-bold">{subtotal.toFixed(2)} MAD</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informations Client</CardTitle>
          <p className="text-sm text-muted-foreground">
            Les champs marqués d'un <span className="text-red-700">*</span> sont obligatoires
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer.name">
                Nom Complet <span className="text-red-700">*</span>
              </Label>
              <Input
                id="customer.name"
                name="customer.name"
                value={formData.customer.name}
                onChange={handleInputChange}
                required
                placeholder="Entrez votre nom complet"
                className={!formData.customer.name ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer.phone">
                Numéro de Téléphone <span className="text-red-700">*</span>
              </Label>
              <Input
                id="customer.phone"
                name="customer.phone"
                type="tel"
                value={formData.customer.phone}
                onChange={handleInputChange}
                required
                placeholder="Ex: 06 12 34 56 78"
                className={!formData.customer.phone ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>

            {/* WhatsApp Confirmation - Only shows when phone number is entered */}
            {showWhatsappSwitch && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    formData.whatsappConfirmed ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893-.001-3.189-1.262-6.187-3.55-8.444"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Label htmlFor="whatsapp-confirmed" className={`text-sm font-medium transition-colors block ${
                      formData.whatsappConfirmed ? 'text-green-700' : 'text-gray-700'
                    }`}>
                      Ce numéro est disponible sur WhatsApp
                    </Label>
                    <div className={`flex items-center space-x-1 mt-1 transition-colors ${
                      formData.whatsappConfirmed ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {formData.whatsappConfirmed ? (
                        <>
                          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium">Confirmé - Contact WhatsApp</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-xs">Appel téléphonique</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Professional Switch */}
                <div className="flex-shrink-0">
                  <div className={`relative inline-flex items-center h-7 rounded-full w-14 transition-all duration-200 ease-in-out border-2 ${
                    formData.whatsappConfirmed 
                      ? 'bg-green-500 border-green-500 shadow-sm' 
                      : 'bg-gray-300 border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      id="whatsapp-confirmed"
                      checked={formData.whatsappConfirmed}
                      onChange={(e) => handleSwitchChange(e.target.checked)}
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <span className={`absolute left-0.6 top-0.6 bg-white rounded-full w-6 h-6 transition-all duration-200 ease-in-out shadow-sm flex items-center justify-center ${
                      formData.whatsappConfirmed ? 'translate-x-7' : 'translate-x-0'
                    }`}>
                      {formData.whatsappConfirmed ? (
                        <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customer.email">Email</Label>
              <Input
                id="customer.email"
                name="customer.email"
                type="email"
                value={formData.customer.email}
                onChange={handleInputChange}
                placeholder="Entrez votre email (optionnel)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer.city">
                Ville <span className="text-red-700">*</span>
              </Label>
              <Input
                id="customer.city"
                name="customer.city"
                value={formData.customer.city}
                onChange={handleInputChange}
                required
                placeholder="Entrez votre ville"
                className={!formData.customer.city ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customer.address">
                Adresse Complète <span className="text-red-700">*</span>
              </Label>
              <Input
                id="customer.address"
                name="customer.address"
                value={formData.customer.address}
                onChange={handleInputChange}
                required
                placeholder="Rue, quartier, etc."
                className={!formData.customer.address ? 'border-red-300 focus:border-red-500' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shippingNotes">Instructions de Livraison</Label>
              <Textarea
                id="shippingNotes"
                name="shippingNotes"
                value={formData.shippingNotes}
                onChange={handleInputChange}
                placeholder="Des instructions spéciales pour la livraison? (Point de repère, étage, etc.)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes de Commande</Label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Des notes supplémentaires pour votre commande?"
                rows={2}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-neutral-900 text-white" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Traitement de la commande...</span>
                </div>
              ) : (
                'Confirmer la Commande'
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              En confirmant votre commande,
              Nous vous contacterons dans les 24 heures pour confirmer votre commande.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}