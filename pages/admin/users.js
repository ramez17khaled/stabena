// pages/admin/users.js
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import { Search, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  const load = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
  }

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`Passer ce compte en "${newRole}" ?`)) return
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
    if (error) toast.error('Erreur')
    else { toast.success('Rôle mis à jour'); load() }
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="Clients">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-muted)' }} />
          <input type="text" placeholder="Rechercher un client..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border text-sm outline-none bg-transparent"
            style={{ borderColor: 'var(--color-border)' }} />
        </div>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
          {filtered.length} client{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="bg-white border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid var(--color-border)`, background: 'var(--color-bg)' }}>
              {['Client', 'Email', 'Rôle', 'Inscrit le', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs tracking-widest uppercase"
                  style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id} className="hover:bg-base transition-colors"
                style={{ borderBottom: `1px solid var(--color-border)` }}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ background: user.role === 'admin' ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                      {user.full_name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <p className="text-sm font-medium">{user.full_name || 'Sans nom'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-muted)' }}>
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full w-fit font-medium"
                    style={{
                      background: user.role === 'admin' ? '#c4956a20' : '#9a908520',
                      color: user.role === 'admin' ? 'var(--color-accent)' : 'var(--color-muted)'
                    }}>
                    {user.role === 'admin' ? <><Shield size={10} /> Admin</> : <><User size={10} /> Client</>}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-muted)' }}>
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleRole(user.id, user.role)}
                    className="text-xs px-3 py-1.5 border transition-all hover:bg-primary hover:text-white"
                    style={{ borderColor: 'var(--color-border)' }}>
                    {user.role === 'admin' ? '→ Client' : '→ Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
