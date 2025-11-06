'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        toast.error('Erreur lors du chargement des commandes');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (order, newStatus) => {
    // If cancelling, show confirmation dialog instead of immediate update
    if (newStatus === 'cancelled') {
      setSelectedOrder(order);
      setPendingStatusUpdate(newStatus);
      setCancelDialogOpen(true);
      return;
    }

    // For other status updates, proceed immediately
    await updateOrderStatus(order, newStatus);
  };

  const updateOrderStatus = async (order, newStatus) => {
    setUpdatingOrderId(order._id);
    
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        }),
      });

      if (response.ok) {
        let message = `Statut mis à jour: ${getStatusText(newStatus)}`;
        
        // If order is cancelled, return stock
        if (newStatus === 'cancelled') {
          await returnStockToInventory(order);
          message += ' - Stock retourné';
        }
        
        toast.success(message);
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setUpdatingOrderId(null);
      setPendingStatusUpdate(null);
    }
  };

  const confirmCancellation = async () => {
    if (selectedOrder && pendingStatusUpdate === 'cancelled') {
      await updateOrderStatus(selectedOrder, 'cancelled');
      setCancelDialogOpen(false);
    }
  };

  const handleWhatsAppToggle = async (order) => {
    setUpdatingOrderId(order._id);
    
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          whatsappConfirmed: !order.whatsappConfirmed
        }),
      });

      if (response.ok) {
        toast.success(`WhatsApp ${!order.whatsappConfirmed ? 'confirmé' : 'non confirmé'}`);
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const returnStockToInventory = async (order) => {
    try {
      const response = await fetch('/api/admin/orders/return-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId: order._id }),
      });

      if (!response.ok) {
        console.error('Failed to return stock');
      }
    } catch (error) {
      console.error('Error returning stock:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Commande supprimée avec succès');
        setDeleteDialogOpen(false);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion');
    }
  };

  const openDetailSheet = (order) => {
    setSelectedOrder(order);
    setDetailSheetOpen(true);
  };

  const openDeleteDialog = (order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50',
      confirmed: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50',
      processing: 'bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50',
      shipped: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50',
      delivered: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
      cancelled: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50',
    };
    return variants[status] || 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'En Attente',
      confirmed: 'Confirmée',
      processing: 'En Traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };
    return texts[status] || status;
  };

  // DataTable columns configuration
  const columns = [
    {
      key: 'orderNumber',
      header: 'N° Commande',
      cell: (order) => (
        <div className="font-mono font-medium text-sm">
          {order.orderNumber}
        </div>
      ),
    },
    {
      key: 'customer',
      header: 'Client',
      cell: (order) => (
        <div className="space-y-1">
          <div className="font-medium">{order.customer.name}</div>
          <div className="text-sm text-muted-foreground">{order.customer.phone}</div>
          <div className="text-xs text-muted-foreground">{order.customer.city}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      cell: (order) => (
        <div className="flex gap-1">
          {/* Bouton WhatsApp si confirmé */}
          {order.customerWhatsappConfirmed ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://wa.me/${order.customer.phone.replace(/\s/g, '')}`, '_blank')}
              className="h-8 w-8 p-0 text-green-600 bg-neutral-800 hover:text-green-700 hover:bg-green-50"
              title="Contacter sur WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`tel:${order.customer.phone}`, '_blank')}
              className="h-8 w-8 p-0 text-blue-600 bg-neutral-800 hover:text-blue-700 hover:bg-blue-50"
              title="Appeler le client"
            >
              <PhoneIcon className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
    {
      key: 'items',
      header: 'Articles',
      cell: (order) => (
        <div className="text-sm">
          {order.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)
          <div className="text-xs text-muted-foreground mt-1">
            Total: {order.totalAmount} MAD
          </div>
        </div>
      ),
    },
    {
      key: 'whatsapp',
      header: 'Confirmation',
      cell: (order) => (
        <div className="flex items-center space-x-2">
          {updatingOrderId === order._id ? (
            <Skeleton className="w-9 h-5 rounded-full" />
          ) : (
            <Switch
              checked={order.whatsappConfirmed}
              onCheckedChange={() => handleWhatsAppToggle(order)}
              className="data-[state=checked]:bg-green-500"
            />
          )}
          <Badge 
            variant={order.whatsappConfirmed ? "default" : "secondary"}
            className={order.whatsappConfirmed ? "bg-green-500" : "bg-neutral-700"}
          >
            {order.whatsappConfirmed ? "✓ Confirmé" : "En attente"}
          </Badge>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      cell: (order) => (
        updatingOrderId === order._id ? (
          <Skeleton className="w-32 h-8 rounded-lg" />
        ) : (
          <Select
            value={order.status}
            onValueChange={(value) => handleStatusUpdate(order, value)}
          >
            <SelectTrigger className={`
              w-32 h-8 text-xs font-medium border-0 shadow-none
              ${getStatusVariant(order.status)}
            `}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  En Attente
                </div>
              </SelectItem>
              <SelectItem value="confirmed">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Confirmée
                </div>
              </SelectItem>
              <SelectItem value="processing">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  En Traitement
                </div>
              </SelectItem>
              <SelectItem value="shipped">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Expédiée
                </div>
              </SelectItem>
              <SelectItem value="delivered">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Livrée
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Annulée
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        )
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      cell: (order) => (
        <div className="text-sm text-muted-foreground">
          {new Date(order.createdAt).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
  ];

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  // Loading skeleton for the table
  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
            <p className="text-muted-foreground">
              Gérez les commandes de vos clients
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchOrders}
            disabled={loading}
          >
            <RefreshIcon className="w-4 h-4 mr-2" />
            {loading ? 'Chargement...' : 'Actualiser'}
          </Button>
        </div>

        {/* Status Summary */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{statusCounts.pending || 0}</div>
                <div className="text-sm text-muted-foreground">En Attente</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{statusCounts.confirmed || 0}</div>
                <div className="text-sm text-muted-foreground">Confirmées</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">{statusCounts.processing || 0}</div>
                <div className="text-sm text-muted-foreground">En Traitement</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{statusCounts.shipped || 0}</div>
                <div className="text-sm text-muted-foreground">Expédiées</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700">{statusCounts.delivered || 0}</div>
                <div className="text-sm text-muted-foreground">Livrées</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{statusCounts.cancelled || 0}</div>
                <div className="text-sm text-muted-foreground">Annulées</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Orders DataTable */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des Commandes</CardTitle>
            <CardDescription>
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                `${orders.length} commande(s) au total • ${orders.filter(o => o.whatsappConfirmed).length} WhatsApp confirmé(s)`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : orders.length > 0 ? (
              <DataTable
                columns={columns}
                data={orders}
                searchKey="orderNumber"
                onView={openDetailSheet}
                onDelete={openDeleteDialog}
              />
            ) : (
              <div className="text-center py-12">
                <PackageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
                <p className="text-muted-foreground mb-6">
                  Les commandes de vos clients apparaîtront ici
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details Sheet */}
        <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader className="pb-4 border-b">
              <SheetTitle className="text-lg font-semibold">
                Détails de la Commande
              </SheetTitle>
              <SheetDescription>
                Consultez les informations détaillées de cette commande.
              </SheetDescription>
            </SheetHeader>

            {selectedOrder ? (
              <div className="p-6 space-y-6">
                {/* Order Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">
                      {selectedOrder.orderNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <Badge className={
                    selectedOrder.status === 'pending' ? 'bg-yellow-500' :
                    selectedOrder.status === 'confirmed' ? 'bg-blue-500' :
                    selectedOrder.status === 'processing' ? 'bg-purple-500' :
                    selectedOrder.status === 'shipped' ? 'bg-green-500' :
                    selectedOrder.status === 'delivered' ? 'bg-green-600' :
                    'bg-red-500'
                  }>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>

                <hr className="border-muted" />

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" />
                    Informations Client
                  </h4>
                  <div className="space-y-3 text-sm">
                    <Info label="Nom complet" value={selectedOrder.customer.name} />
                    <Info label="Téléphone" value={selectedOrder.customer.phone} />
                    <Info label="Email" value={selectedOrder.customer.email || "Non fourni"} />
                    <Info label="Ville" value={selectedOrder.customer.city} />
                    <Info label="Adresse" value={selectedOrder.customer.address} />
                  </div>
                </div>

                <hr className="border-muted" />

                {/* Order Summary */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingCartIcon className="w-4 h-4 text-primary" />
                    Résumé de la Commande
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            <Image 
                              width={48} 
                              height={48} 
                              src={item.productImage} 
                              alt={item.productName}
                              className="w-12 h-12 rounded-md object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center border">
                              <PackageIcon className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-sm">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity} × {item.price} MAD
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {(item.quantity * item.price).toFixed(2)} MAD
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <p className="font-semibold">Total</p>
                      <p className="font-bold text-lg">{selectedOrder.totalAmount} MAD</p>
                    </div>
                  </div>
                </div>

                <hr className="border-muted" />

                {/* WhatsApp Status */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageCircleIcon className="w-4 h-4 text-primary" />
                    Statut de confirmation
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Info 
                      label="WhatsApp Client" 
                      value={selectedOrder.customerWhatsappConfirmed ? "✅ Disponible" : "❌ Non disponible"} 
                    />
                    <Info 
                      label="Admin" 
                      value={selectedOrder.whatsappConfirmed ? "✅ Confirmé" : "⏳ En attente"} 
                    />
                  </div>
                </div>

                {/* Notes */}
                {(selectedOrder.notes || selectedOrder.shippingNotes) && (
                  <>
                    <hr className="border-muted" />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <FileTextIcon className="w-4 h-4 text-primary" />
                        Notes
                      </h4>
                      <div className="space-y-3 text-sm">
                        {selectedOrder.shippingNotes && (
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Instructions de livraison</p>
                            <p className="text-foreground">{selectedOrder.shippingNotes}</p>
                          </div>
                        )}
                        {selectedOrder.notes && (
                          <div>
                            <p className="font-medium text-muted-foreground mb-1">Notes du client</p>
                            <p className="text-foreground">{selectedOrder.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <hr className="border-muted" />

                {/* Order Timeline */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-primary" />
                    Historique
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <Info 
                      label="Créée le" 
                      value={new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR')} 
                    />
                    <Info 
                      label="Heure" 
                      value={new Date(selectedOrder.createdAt).toLocaleTimeString('fr-FR')} 
                    />
                    <Info 
                      label="Modifiée le" 
                      value={new Date(selectedOrder.updatedAt).toLocaleDateString('fr-FR')} 
                    />
                    <Info 
                      label="Heure" 
                      value={new Date(selectedOrder.updatedAt).toLocaleTimeString('fr-FR')} 
                    />
                  </div>
                </div>

                <SheetClose asChild>
                  <Button className="mt-6 w-full" variant="outline">
                    Fermer
                  </Button>
                </SheetClose>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                Aucune commande sélectionnée.
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la commande</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer la commande &quot;<b>{selectedOrder?.orderNumber}</b>&quot; ?
                Le stock sera retourné à l&apos;inventaire. Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Cancellation Confirmation Dialog */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    Êtes-vous sûr de vouloir annuler la commande <b>{selectedOrder?.orderNumber}</b> ?
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <p className="font-medium">Cette action va :</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Marquer la commande comme annulée</li>
                          <li>Retourner <b>{selectedOrder?.items.reduce((sum, item) => sum + item.quantity, 0)} article(s)</b> au stock</li>
                          <li>Être visible dans l&apos;historique de la commande</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Vous pourrez toujours modifier le statut ultérieurement si nécessaire.
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPendingStatusUpdate(null)}>
                Garder la commande
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmCancellation}
                className="bg-yellow-600 text-white hover:bg-yellow-700 dark:bg-yellow-700 dark:hover:bg-yellow-800"
              >
                Confirmer l&apos;annulation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}

// Info component
function Info({ label, value }) {
  return (
    <div>
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="text-foreground">{value}</p>
    </div>
  );
}

// Icon Components
function RefreshIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

// En haut du fichier avec les autres imports d'icônes
function WhatsAppIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893c0-3.189-1.248-6.189-3.515-8.444"/>
    </svg>
  );
}

function PhoneIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

// Add these icon components
function MessageCircleIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function ShoppingCartIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function FileTextIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ClockIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PackageIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}