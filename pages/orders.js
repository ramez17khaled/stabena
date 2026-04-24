// pages/orders.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Navbar from '../components/shared/Navbar'
import { getUserOrders } from '../lib/supabase'
import { useAuth } from './_app'
import { Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: '#f59e0b', icon: Clock },
  confirmed: { label: 'Confirmée',   color: '#3b82f6', icon: Package },
  shipped:   { label: 'Expédiée',    color: '#8b5cf6', icon: Truck },
  delivered: { label: 'Livrée',      color: '#10b981', icon: CheckCircle },
  cancelled: { label: 'Annulée',     color: '#ef4444', icon: XCircle },
}

export default function OrdersPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    getUserOrders(user.id).then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [user])

  if (loading) return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse font-display text-2xl">Chargement...</div>
      </div>
    </div>
  )

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl mb-8">Mes Commandes</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl mb-4">Aucune commande pour l'instant</p>
            <button onClick={() => router.push('/products')}
              className="text-sm px-6 py-3 text-white"
              style={{ background: 'var(--color-primary)' }}>
              Commencer mes achats
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
              const StatusIcon = status.icon
              return (
                <div key={order.id} className="bg-white border p-6"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs tracking-widest uppercase mb-1"
                        style={{ color: 'var(--color-muted)' }}>
                        Commande #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                        {new Date(order.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{ background: `${status.color}15`, color: status.color }}>
                      <StatusIcon size={14} />
                      {status.label}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mb-4">
                    {order.order_items?.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.products?.images?.[0]}
                          alt={item.products?.name}
                          className="w-12 h-16 object-cover"
                          style={{ background: '#f5f2ee' }} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.products?.name}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                            Qté: {item.quantity} {item.size && `• ${item.size}`}
                          </p>
                        </div>
                        <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center"
                    style={{ borderColor: 'var(--color-border)' }}>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Livraison à</p>
                      <p className="text-sm">{order.shipping_address?.city}, {order.shipping_address?.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Total</p>
                      <p className="font-medium">${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
