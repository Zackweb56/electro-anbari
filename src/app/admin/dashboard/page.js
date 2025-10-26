'use client';
import { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0,
    pendingOrders: 0,
    outOfStock: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentData();
  }, []);

  const fetchStats = async () => {
    // Mock data - replace with actual API calls
    setStats({
      totalProducts: 156,
      totalOrders: 89,
      totalRevenue: 125430,
      lowStock: 12,
      pendingOrders: 8,
      outOfStock: 3
    });
  };

  const fetchRecentData = async () => {
    // Mock recent data
    setRecentOrders([
      { id: 1, customer: 'Mohamed Ali', amount: 2500, status: 'completed' },
      { id: 2, customer: 'Fatima Zahra', amount: 1800, status: 'pending' },
      { id: 3, customer: 'Ahmed Hassan', amount: 3200, status: 'completed' },
    ]);

    setLowStockItems([
      { id: 1, name: 'Dell XPS 13', stock: 2, minStock: 5 },
      { id: 2, name: 'MacBook Air M2', stock: 3, minStock: 5 },
      { id: 3, name: 'HP Spectre x360', stock: 1, minStock: 3 },
    ]);
  };

  const quickActions = [
    {
      label: 'Ajouter Produit',
      description: 'Nouvel ordinateur',
      href: '/admin/products/new',
      icon: <PlusIcon className="h-4 w-4" />,
      variant: 'default'
    },
    {
      label: 'Gérer Catégories',
      description: 'Organiser les catégories',
      href: '/admin/categories',
      icon: <CategoryIcon className="h-4 w-4" />,
      variant: 'outline'
    },
    {
      label: 'Voir Commandes',
      description: 'Commandes en cours',
      href: '/admin/orders',
      icon: <OrdersIcon className="h-4 w-4" />,
      variant: 'outline'
    },
    {
      label: 'Rapports',
      description: 'Analyses et statistiques',
      href: '/admin/reports',
      icon: <ChartIcon className="h-4 w-4" />,
      variant: 'outline'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
            <p className="text-muted-foreground">
              Aperçu de votre magasin d&apos;ordinateurs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              En ligne
            </Badge>
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour: Maintenant
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Produits Totaux"
            value={stats.totalProducts}
            description="Ordinateurs en stock"
            icon={<ProductsIcon className="h-4 w-4" />}
            trend="+12%"
            trendPositive={true}
          />
          <StatCard
            title="Commandes"
            value={stats.totalOrders}
            description="Commandes terminées"
            icon={<OrdersIcon className="h-4 w-4" />}
            trend="+8%"
            trendPositive={true}
          />
          <StatCard
            title="Revenu Total"
            value={`${stats.totalRevenue.toLocaleString()} DH`}
            description="Chiffre d'affaires"
            icon={<RevenueIcon className="h-4 w-4" />}
            trend="+15%"
            trendPositive={true}
          />
          <StatCard
            title="Stock Faible"
            value={stats.lowStock}
            description="Besoin de réapprovisionnement"
            icon={<AlertIcon className="h-4 w-4" />}
            trend="+3"
            trendPositive={false}
          />
        </div>

        {/* Quick Actions & Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
              <CardDescription>
                Accédez rapidement aux fonctionnalités principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant}
                    className="h-auto p-4 flex flex-col items-center justify-center gap-2"
                    asChild
                  >
                    <a href={action.href}>
                      <div className="flex items-center gap-2">
                        {action.icon}
                        <span className="font-semibold">{action.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {action.description}
                      </p>
                    </a>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Indicateurs clés</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Taux de conversion</span>
                  <span className="font-semibold">4.2%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stock moyen</span>
                  <span className="font-semibold">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Satisfaction client</span>
                  <span className="font-semibold">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <OrdersIcon className="h-5 w-5" />
                Commandes Récentes
              </CardTitle>
              <CardDescription>
                {stats.pendingOrders} commandes en attente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.amount} DH</p>
                      </div>
                      <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>
                        {order.status === 'completed' ? 'Complété' : 'En attente'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <OrdersIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune commande récente</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertIcon className="h-5 w-5" />
                Alertes Stock
              </CardTitle>
              <CardDescription>
                {stats.outOfStock} produits en rupture
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-4">
                  {lowStockItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Stock: {item.stock} (min: {item.minStock})
                        </p>
                      </div>
                      <Badge variant={item.stock === 0 ? 'destructive' : 'warning'}>
                        {item.stock === 0 ? 'Rupture' : 'Stock faible'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Stock optimal</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// Stat Card Component
function StatCard({ title, value, description, icon, trend, trendPositive }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <Badge variant={trendPositive ? 'default' : 'destructive'} className="text-xs">
              {trend}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// SVG Icon Components
function ProductsIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function OrdersIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}

function RevenueIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
    </svg>
  );
}

function AlertIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );
}

function PlusIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function CategoryIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  );
}

function ChartIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}