// pages/admin/orders.js
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAllOrders, updateOrderStatus, supabase } from '../../lib/supabase'
import { getEmailForStatus } from '../../lib/emails'
import { sendEmail } from '../../lib/sendEmail'
import { ChevronDown, ChevronUp, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pending:   { label: 'En attente',  color: '#f59e0b' },
  confirmed: { label: 'Confirmée',   color: '#3b82f6' },
  shipped:   { label: 'Expédiée',    color: '#8b5cf6' },
  delivered: { label: 'Livrée',      color: '#10b981' },
  cancelled: { label: 'Annulée',     color: '#ef4444' },
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')
  const [sendingEmail, setSendingEmail] = useState(null)

  useEffect(() => { load() }, [])
  const load = () => getAllOrders().then(({ data }) => setOrders(data || []))

  const handleStatus = async (order, newStatus) => {
    const { error } = await updateOrderStatus(order.id, newStatus)
    if (error) { toast.error('Erreur'); return }
    toast.success('Statut mis à jour')

    // Envoyer l'email de notification
    const userName = order.profiles?.full_name || 'Client'
    const userEmail = order.profiles?.email
    if (!userEmail) { load(); return }

    // Détecter la langue du client (stockée dans son profil ou par défaut fr)
    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', order.user_id).single()
    const lang = profile?.lang || 'fr'

    const emailData = getEmailForStatus(
      newStatus, userName, order.id,
      order.order_items?.map(i => ({
        name: i.products?.name,
        slug: i.products?.slug,
        image: i.products?.images?.[0] || null,
        quantity: i.quantity,
        price: i.price
      })) || [],
      parseFloat(order.total_amount),
      lang
    )

    if (emailData) {
      setSendingEmail(order.id)
      const result = await sendEmail({ to: userEmail, ...emailData })
      setSendingEmail(null)
      if (result.success) toast.success(`📧 Email envoyé à ${userEmail}`)
      else toast.error('Statut mis à jour mais email échoué')
    }
    load()
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <AdminLayout title="Commandes">
      {/* Filtres */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ key: 'all', label: 'Toutes' }, ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ key: k, label: v.label }))].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className="px-4 py-2 text-sm border transition-all"
            style={{
              borderColor: filter === key ? 'var(--color-primary)' : 'var(--color-border)',
              background: filter === key ? 'var(--color-primary)' : 'transparent',
              color: filter === key ? 'white' : 'var(--color-primary)'
            }}>
            {label}
            <span className="ml-2 text-xs opacity-70">
              {key === 'all' ? orders.length : orders.filter(o => o.status === key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border" style={{ borderColor: 'var(--color-border)' }}>
            <p className="font-display text-xl" style={{ color: 'var(--color-muted)' }}>Aucune commande</p>
          </div>
        )}
        {filtered.map(order => {
          const status = STATUS_CONFIG[order.status]
          const isOpen = expanded === order.id
          return (
            <div key={order.id} className="bg-white border" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center px-6 py-4 gap-4 cursor-pointer hover:bg-base transition-colors"
                onClick={() => setExpanded(isOpen ? null : order.id)}>
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <p className="text-sm font-mono font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <div>
                    <p className="text-sm font-medium">{order.profiles?.full_name || 'N/A'}</p>
                    <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{order.profiles?.email}</p>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm font-medium">${parseFloat(order.total_amount).toFixed(2)}</p>
                  <span className="px-2 py-1 rounded-full text-xs font-medium w-fit"
                    style={{ background: `${status.color}15`, color: status.color }}>
                    {status.label}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-muted)' }} />
                         : <ChevronDown size={16} style={{ color: 'var(--color-muted)' }} />}
              </div>

              {isOpen && (
                <div className="border-t px-6 py-6 animate-fade-in grid md:grid-cols-2 gap-8"
                  style={{ borderColor: 'var(--color-border)' }}>
                  {/* Articles */}
                  <div>
                    <h4 className="text-xs tracking-widest uppercase mb-4 font-medium"
                      style={{ color: 'var(--color-muted)' }}>Articles commandés</h4>
                    <div className="space-y-3">
                      {order.order_items?.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-10 h-12 shrink-0" style={{ background: '#f5f2ee' }}>
                            {item.products?.images?.[0] && (
                              <img src={item.products.images[0]} alt=""
                                className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.products?.name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                              Qté: {item.quantity} {item.size && `• ${item.size}`}
                            </p>
                          </div>
                          <p className="text-sm font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between"
                      style={{ borderColor: 'var(--color-border)' }}>
                      <p className="text-sm font-medium">Total</p>
                      <p className="text-sm font-medium">${parseFloat(order.total_amount).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Infos & actions */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs tracking-widest uppercase mb-3 font-medium"
                        style={{ color: 'var(--color-muted)' }}>Adresse de livraison</h4>
                      <div className="text-sm space-y-1">
                        <p className="font-medium">{order.shipping_address?.name}</p>
                        <p style={{ color: 'var(--color-muted)' }}>{order.shipping_address?.street}</p>
                        <p style={{ color: 'var(--color-muted)' }}>
                          {order.shipping_address?.zip} {order.shipping_address?.city}
                        </p>
                        <p style={{ color: 'var(--color-muted)' }}>{order.shipping_address?.country}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs tracking-widest uppercase mb-3 font-medium"
                        style={{ color: 'var(--color-muted)' }}>
                        Changer le statut
                        <span className="ml-2 normal-case font-normal" style={{ color: '#9a9085' }}>
                          (email automatique envoyé)
                        </span>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                          <button key={key}
                            onClick={() => handleStatus(order, key)}
                            disabled={order.status === key || sendingEmail === order.id}
                            className="px-3 py-1.5 text-xs border transition-all disabled:opacity-40 flex items-center gap-1"
                            style={{
                              borderColor: val.color,
                              color: order.status === key ? 'white' : val.color,
                              background: order.status === key ? val.color : 'transparent'
                            }}>
                            {sendingEmail === order.id && order.status !== key && <Mail size={10} className="animate-pulse" />}
                            {val.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#9a9085' }}>
                        📧 Un email est automatiquement envoyé au client à chaque changement de statut
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AdminLayout>
  )
}
