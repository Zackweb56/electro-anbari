'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export default function StoreConfigurations() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    storeName: 'Electro Anbari Store',
    storeDescription: 'Votre magasin d\'ordinateurs de confiance',
    contactEmail: 'contact@electro-anbari.com',
    contactPhone: '+212 6 00 00 00 00',
    whatsappNumber1: '+212600000000',
    whatsappNumber2: '',
    address: 'Fequih Ben Saleh, Maroc',
    latitude: 32.497853,
    longitude: -6.690345,
    openingHours: 'Lun - Ven: 9h-18h',
    youtubeVideo: '',
    facebook: '',
    instagram: '',
    youtube: '',
    shippingPolicy: '',
    returnPolicy: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched config:', data); // Debug log
        setConfig(prev => ({ 
          ...prev, 
            ...data,
          // Map the data correctly
          contactEmail: data.contactEmail || prev.contactEmail,
          contactPhone: data.contactPhone || prev.contactPhone,
            openingHours: data.openingHours || prev.openingHours,
            youtubeVideo: data.youtubeVideo || prev.youtubeVideo,
          // Handle social media nested object
          facebook: data.socialMedia?.facebook || '',
          instagram: data.socialMedia?.instagram || '',
          youtube: data.socialMedia?.youtube || '',
        }));
      } else {
        console.error('Failed to fetch config:', response.status);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Prepare data in the correct format for API
      const configData = {
        storeName: config.storeName,
        storeDescription: config.storeDescription,
        contactEmail: config.contactEmail,
        contactPhone: config.contactPhone,
        whatsappNumber1: config.whatsappNumber1,
        whatsappNumber2: config.whatsappNumber2,
        address: config.address,
        latitude: parseFloat(config.latitude) || 0,
        longitude: parseFloat(config.longitude) || 0,
        openingHours: config.openingHours,
        youtubeVideo: config.youtubeVideo,
        facebook: config.facebook,
        instagram: config.instagram,
        youtube: config.youtube,
        shippingPolicy: config.shippingPolicy,
        returnPolicy: config.returnPolicy,
      };

      console.log('Sending config data:', configData); // Debug log

      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configData),
      });

      const data = await response.json();
      console.log('API response:', data); // Debug log

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la sauvegarde' });
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: 'Erreur de connexion' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuration du Magasin</h1>
            <p className="text-muted-foreground">
              Gérez les informations et paramètres de votre magasin
            </p>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid gap-6">
            {/* Store Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informations du Magasin</CardTitle>
                <CardDescription>
                  Informations principales de votre magasin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Nom du magasin</Label>
                    <Input
                      id="storeName"
                      value={config.storeName}
                      onChange={(e) => setConfig(prev => ({ ...prev, storeName: e.target.value }))}
                      placeholder="Electro Anbari Store"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Téléphone</Label>
                    <Input
                      id="contactPhone"
                      value={config.contactPhone}
                      onChange={(e) => setConfig(prev => ({ ...prev, contactPhone: e.target.value }))}
                      placeholder="+212 6 00 00 00 00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={config.storeDescription}
                    onChange={(e) => setConfig(prev => ({ ...prev, storeDescription: e.target.value }))}
                    placeholder="Description de votre magasin..."
                    rows={3}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={config.contactEmail}
                      onChange={(e) => setConfig(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="contact@magasin.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={config.address}
                      onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Ville, Pays"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
                <CardDescription>
                  Coordonnées GPS pour Google Maps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={config.latitude}
                      onChange={(e) => setConfig(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="33.5731"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={config.longitude}
                      onChange={(e) => setConfig(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="-7.5898"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>Contact & Réseaux Sociaux</CardTitle>
                <CardDescription>
                  Gérez vos informations de contact et présence sur les réseaux sociaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="contact" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contact">Contact & Horaires</TabsTrigger>
                    <TabsTrigger value="social">Réseaux Sociaux</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="contact" className="space-y-4 mt-4">
                    <div className="grid gap-4">
                      {/* WhatsApp Numbers */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">WhatsApp</CardTitle>
                          <CardDescription>Numéros WhatsApp pour le contact client</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="whatsappNumber1">WhatsApp Principal</Label>
                            <Input
                              id="whatsappNumber1"
                              value={config.whatsappNumber1}
                              onChange={(e) => setConfig(prev => ({ ...prev, whatsappNumber1: e.target.value }))}
                              placeholder="+212600000000"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="whatsappNumber2">WhatsApp Secondaire</Label>
                            <Input
                              id="whatsappNumber2"
                              value={config.whatsappNumber2}
                              onChange={(e) => setConfig(prev => ({ ...prev, whatsappNumber2: e.target.value }))}
                              placeholder="+212600000001"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Opening Hours */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Horaires d&apos;Ouverture</CardTitle>
                          <CardDescription>Définissez vos heures d&apos;ouverture</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Label htmlFor="openingHours">Horaires</Label>
                            <Input
                              id="openingHours"
                              value={config.openingHours}
                              onChange={(e) => setConfig(prev => ({ ...prev, openingHours: e.target.value }))}
                              placeholder="Lun - Ven: 9h-18h"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="social" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Réseaux Sociaux</CardTitle>
                        <CardDescription>Liens vers vos profils sociaux et contenu vidéo</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Featured Video */}
                        <div className="space-y-2">
                          <Label htmlFor="youtubeVideo">Vidéo à la Une</Label>
                          <Input
                            id="youtubeVideo"
                            value={config.youtubeVideo}
                            onChange={(e) => setConfig(prev => ({ ...prev, youtubeVideo: e.target.value }))}
                            placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
                          />
                        </div>
                        
                        {/* Social Media Links */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="facebook">Facebook</Label>
                            <Input
                              id="facebook"
                              value={config.facebook}
                              onChange={(e) => setConfig(prev => ({ ...prev, facebook: e.target.value }))}
                              placeholder="https://facebook.com/votremagasin"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="instagram">Instagram</Label>
                            <Input
                              id="instagram"
                              value={config.instagram}
                              onChange={(e) => setConfig(prev => ({ ...prev, instagram: e.target.value }))}
                              placeholder="https://instagram.com/votremagasin"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="youtube">Chaîne YouTube</Label>
                            <Input
                              id="youtube"
                              value={config.youtube}
                              onChange={(e) => setConfig(prev => ({ ...prev, youtube: e.target.value }))}
                              placeholder="https://youtube.com/@votremagasin"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card>
              <CardHeader>
                <CardTitle>Politiques</CardTitle>
                <CardDescription>
                  Politiques de livraison et de retour
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="shippingPolicy">Politique de Livraison</Label>
                    <Textarea
                      id="shippingPolicy"
                      value={config.shippingPolicy}
                      onChange={(e) => setConfig(prev => ({ ...prev, shippingPolicy: e.target.value }))}
                      placeholder="Décrivez votre politique de livraison..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Politique de Retour</Label>
                    <Textarea
                      id="returnPolicy"
                      value={config.returnPolicy}
                      onChange={(e) => setConfig(prev => ({ ...prev, returnPolicy: e.target.value }))}
                      placeholder="Décrivez votre politique de retour..."
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card>
              <CardContent className="pt-6">
                {message.type && message.text && (
                  <div className={`p-3 text-sm rounded-md mb-4 ${
                    message.type === 'success' 
                      ? 'text-green-800 bg-green-50 border border-green-200' 
                      : 'text-red-800 bg-red-50 border border-red-200'
                  }`}>
                    {message.text}
                  </div>
                )}
                
                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  {loading ? 'Sauvegarde...' : 'Sauvegarder la Configuration'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}