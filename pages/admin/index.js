// pages/admin/index.js
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getDashboardStats, getAllOrders } from '../../lib/supabase'
import { ShoppingBag, Package, Users, TrendingUp } from 'lucide-react'

const STATUS_COLORS = {
  pending:   '#f59e0b',
  confirmed: '#3b82f6',
  shipped:   '#8b5cf6',
  delivered: '#10b981',
  cancelled: '#ef4444',
}

const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée',
  delivered: 'Livrée', cancelled: 'Annulée'
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    getDashboardStats().then(setStats)
    getAllOrders().then(({ data }) => setRecentOrders((data || []).slice(0, 5)))
  }, [])

  const statCards = stats ? [
    { label: 'Commandes', value: stats.totalOrders, icon: ShoppingBag, color: '#3b82f6' },
    { label: 'Produits', value: stats.totalProducts, icon: Package, color: '#8b5cf6' },
    { label: 'Clients', value: stats.totalUsers, icon: Users, color: '#10b981' },
    { label: 'Revenus', value: `${stats.totalRevenue.toFixed(2)} €`, icon: TrendingUp, color: '#f59e0b' },
  ] : []

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border p-6"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{label}</p>
              <div className="w-10 h-10 rounded flex items-center justify-center"
                style={{ background: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <p className="text-3xl font-display">{value ?? '...'}</p>
          </div>
        ))}
      </div>

      {/* Commandes récentes */}
      <div className="bg-white border" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="font-display text-xl">Commandes récentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid var(--color-border)` }}>
                {['N°', 'Client', 'Date', 'Total', 'Statut'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs tracking-widest uppercase"
                    style={{ color: 'var(--color-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-base transition-colors"
                  style={{ borderBottom: `1px solid var(--color-border)` }}>
                  <td className="px-6 py-4 text-sm font-mono">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div>
                      <p className="font-medium">{order.profiles?.full_name || 'N/A'}</p>
                      <p style={{ color: 'var(--color-muted)', fontSize: '12px' }}>{order.profiles?.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    {parseFloat(order.total_amount).toFixed(2)} €
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${STATUS_COLORS[order.status]}15`,
                        color: STATUS_COLORS[order.status]
                      }}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
