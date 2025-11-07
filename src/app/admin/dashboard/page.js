'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Phone,
} from 'lucide-react';
import { Wallet, PackageSearch } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure session is fully loaded
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/dashboard');
      if (!response.ok) throw new Error('Failed to fetch data');
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const {
    monthlyOrders = 0,
    monthlyRevenue = 0,
    revenueTrend = 0, // 🟢 Add this
    ordersTrend = 0,  // 🟢 Add this
    lowStockItems = 0,
    outOfStockItems = 0,
    pendingOrders = 0,
    recentOrders = [],
    orderStatusCounts = {}
  } = dashboardData || {};

  const stats = [
    {
      title: 'Revenu Mensuel',
      value: `${monthlyRevenue.toLocaleString('fr-MA')} MAD`,
      icon: Wallet,
      description: 'Ce mois',
      trend: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend}%`, // 🟢 Real trend
      color: revenueTrend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
      bgColor: revenueTrend >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-red-100 dark:bg-red-900/40',
      badgeColor: revenueTrend >= 0 ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/20 text-red-600 dark:text-red-400',
    },
    {
      title: 'Commandes Mensuelles',
      value: monthlyOrders.toLocaleString('fr-MA'),
      icon: ShoppingCart,
      description: 'Commandes ce mois',
      trend: `${ordersTrend >= 0 ? '+' : ''}${ordersTrend}%`, // 🟢 Real trend
      color: ordersTrend >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400',
      bgColor: ordersTrend >= 0 ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-red-100 dark:bg-red-900/40',
      badgeColor: ordersTrend >= 0 ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-red-500/20 text-red-600 dark:text-red-400',
    },
    {
      title: 'Commandes en Attente',
      value: pendingOrders.toLocaleString('fr-MA'),
      icon: AlertTriangle,
      description: 'Nécessitent confirmation',
      trend: `${pendingOrders > 0 ? 'À traiter' : 'Aucune'}`,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-100 dark:bg-amber-900/40',
      badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      title: 'Alertes Stock',
      value: (lowStockItems + outOfStockItems).toString(),
      icon: PackageSearch,
      description: 'Attention requise',
      trend: `${outOfStockItems} en rupture`,
      color:
        outOfStockItems > 0
          ? 'text-red-600 dark:text-red-400'
          : 'text-purple-600 dark:text-purple-400',
      bgColor:
        outOfStockItems > 0
          ? 'bg-red-100 dark:bg-red-900/40'
          : 'bg-purple-100 dark:bg-purple-900/40',
      badgeColor:
        outOfStockItems > 0
          ? 'bg-red-500/20 text-red-600 dark:text-red-400'
          : 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
    },
  ];

  const getStatusBadge = (status) => {
    const statusColors = {
      pending: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
      confirmed: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      processing: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      shipped: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      delivered: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
      cancelled: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    };

    const statusLabels = {
      pending: 'En Attente',
      confirmed: 'Confirmée',
      processing: 'En Traitement',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    };

    return (
      <Badge variant="outline" className={`${statusColors[status]} font-medium text-xs px-2 py-1`}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
            <p className="text-muted-foreground">
              Aperçu des performances de votre boutique
            </p>
          </div>
        </div>

        {/* Stats Grid - Small Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 p-1">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="relative border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 rounded-xl p-3 min-h-[120px] flex flex-col justify-between"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-1.5 rounded-lg ${stat.bgColor} bg-opacity-15 flex items-center justify-center shrink-0`}
                >
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>

              <CardContent className="p-0 flex flex-col flex-grow justify-end">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground truncate">
                        {stat.value}
                      </span>
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0.5 font-medium h-5 ${stat.badgeColor} border-0`}
                      >
                        {stat.trend}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                      {stat.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 border border-border bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Commandes Récentes</CardTitle>
                  <CardDescription>
                    Dernières commandes de votre boutique
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="gap-1">
                  <Link href="/admin/orders">
                    Voir Tout <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent hover:scrollbar-thumb-border/60">
                  <div className="space-y-2 p-2">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="group p-3 border border-border/50 rounded-lg hover:border-border transition-all duration-200 bg-card/70 hover:bg-accent/20 backdrop-blur-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Order Info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                              <ShoppingCart className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-semibold text-sm truncate max-w-[120px]">
                                    {order.customer.name}
                                  </span>
                                </div>
                                {order.whatsappConfirmed && (
                                  <CheckCircle
                                    className="h-3 w-3 text-green-500"
                                    title="Confirmé par WhatsApp"
                                  />
                                )}
                                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  <span>{order.customer.phone}</span>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="flex flex-wrap items-center gap-4 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span className="font-medium">N°:</span>
                                  <span className="font-mono text-foreground">
                                    {order.orderNumber}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span className="font-medium">Montant:</span>
                                  <span className="font-semibold text-foreground">
                                    {order.totalAmount} MAD
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <span className="font-medium">Articles:</span>
                                  <span className="font-medium text-foreground">
                                    {order.items.length}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatOrderDate(order.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status + Action */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {getStatusBadge(order.status)}
                            <Button
                              asChild
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                            >
                              <Link href={`/admin/orders/${order._id}`}>
                                <ArrowUpRight className="w-3 h-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Mobile phone */}
                        <div className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground mt-2 ml-11">
                          <Phone className="h-3 w-3" />
                          <span>{order.customer.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground font-medium">
                    Aucune commande pour le moment
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Les commandes apparaîtront ici une fois que les clients commenceront à acheter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Store Overview */}
          <Card className="border border-border bg-card/80 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle>Aperçu du Magasin</CardTitle>
              <CardDescription>Résumé et actions rapides</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Actions */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Actions Rapides
                </h4>
                <div className="space-y-1.5">
                  {[
                    { label: 'Produits', icon: Package, link: '/admin/products' },
                    { label: 'Commandes', icon: ShoppingCart, link: '/admin/orders' },
                    { label: 'Stock', icon: TrendingUp, link: '/admin/stock' },
                  ].map((action) => (
                    <Button
                      key={action.label}
                      asChild
                      variant="outline"
                      className="w-full justify-start h-9 hover:bg-accent/30 transition-colors"
                    >
                      <Link href={action.link}>
                        <action.icon className="h-3.5 w-3.5 mr-2" />
                        <span className="text-sm">{action.label}</span>
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Order Status Summary */}
              <div>
                <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                  Statut des Commandes
                </h4>
                {loading ? (
                  <div className="space-y-1.5">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full rounded" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {Object.entries(orderStatusCounts || {}).map(([status, count]) => (
                      <div
                        key={status}
                        className="flex items-center justify-between text-sm p-1.5 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          {status === 'pending' && (
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          )}
                          {status === 'confirmed' && (
                            <CheckCircle className="h-3 w-3 text-blue-500" />
                          )}
                          {status === 'processing' && (
                            <TrendingUp className="h-3 w-3 text-purple-500" />
                          )}
                          {status === 'shipped' && (
                            <Package className="h-3 w-3 text-indigo-500" />
                          )}
                          {status === 'delivered' && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                          {status === 'cancelled' && (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span className="text-xs font-medium capitalize text-foreground">
                            {status === 'pending' && 'En Attente'}
                            {status === 'confirmed' && 'Confirmée'}
                            {status === 'processing' && 'En Traitement'}
                            {status === 'shipped' && 'Expédiée'}
                            {status === 'delivered' && 'Livrée'}
                            {status === 'cancelled' && 'Annulée'}
                          </span>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono min-w-6 h-5 justify-center px-1"
                        >
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stock Alerts */}
              {(lowStockItems > 0 || outOfStockItems > 0) && !loading && (
                <div className="pt-3 border-t border-border/60">
                  <h4 className="text-sm font-medium mb-2 text-muted-foreground">
                    Alertes de Stock
                  </h4>
                  {outOfStockItems > 0 && (
                    <div className="flex items-center justify-between text-sm p-1.5 rounded-md bg-red-50 dark:bg-red-950/20 mb-1.5">
                      <div className="flex items-center">
                        <XCircle className="h-3.5 w-3.5 text-red-500 mr-1.5" />
                        <span className="text-red-700 dark:text-red-400 font-medium text-xs">
                          Rupture
                        </span>
                      </div>
                      <Badge
                        variant="destructive"
                        className="text-xs h-5 px-2 font-mono"
                      >
                        {outOfStockItems}
                      </Badge>
                    </div>
                  )}
                  {lowStockItems > 0 && (
                    <div className="flex items-center justify-between text-sm p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/20">
                      <div className="flex items-center">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mr-1.5" />
                        <span className="text-amber-700 dark:text-amber-400 font-medium text-xs">
                          Stock Faible
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700 text-xs h-5 font-mono px-2"
                      >
                        {lowStockItems}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
