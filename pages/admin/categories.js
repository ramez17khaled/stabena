// pages/admin/categories.js
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getCategories, createCategory, supabase } from '../../lib/supabase'
import { Plus, Trash2, X, Pencil } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_FORM = { name: '', slug: '', description: '', image_url: '' }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null) // null | 'create' | category
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])
  const load = () => getCategories().then(({ data }) => setCategories(data || []))

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit = (cat) => { setForm({ ...cat, image_url: cat.image_url || '' }); setModal(cat) }

  const handleSave = async () => {
    if (!form.name) { toast.error('Nom requis'); return }
    setSaving(true)
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: form.description || null,
      image_url: form.image_url || null,
    }

    if (modal === 'create') {
      const { error } = await createCategory(payload)
      if (error) toast.error('Erreur: ' + error.message)
      else { toast.success('Catégorie créée !'); setModal(null); load() }
    } else {
      const { error } = await supabase
        .from('categories').update(payload).eq('id', modal.id)
      if (error) toast.error('Erreur: ' + error.message)
      else { toast.success('Catégorie mise à jour !'); setModal(null); load() }
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) toast.error('Erreur (des produits y sont peut-être liés)')
    else { toast.success('Catégorie supprimée'); load() }
  }

  const fields = [
    { key: 'name', label: 'Nom *', placeholder: 'Femme' },
    { key: 'slug', label: 'Slug (URL)', placeholder: 'auto-généré si vide' },
    { key: 'description', label: 'Description', placeholder: 'Description courte...' },
    { key: 'image_url', label: "Image (URL)", placeholder: 'https://...' },
  ]

  return (
    <AdminLayout title="Catégories">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{categories.length} catégories</p>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white"
          style={{ background: 'var(--color-primary)' }}>
          <Plus size={14} /> Nouvelle catégorie
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white border overflow-hidden"
            style={{ borderColor: 'var(--color-border)', borderRadius: '8px' }}>
            {cat.image_url ? (
              <div className="h-32 overflow-hidden">
                <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-xs"
                style={{ background: 'var(--color-bg)', color: 'var(--color-muted)' }}>
                Aucune image
              </div>
            )}
            <div className="p-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl">{cat.name}</h3>
                <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>/{cat.slug}</p>
                {cat.description && (
                  <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>{cat.description}</p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(cat)}
                  className="p-1.5 transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--color-accent)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--color-muted)'}>
                  <Pencil size={14} />
                </button>
                <button onClick={() => handleDelete(cat.id)}
                  className="p-1.5 transition-colors"
                  style={{ color: 'var(--color-muted)' }}
                  onMouseOver={e => e.currentTarget.style.color = 'var(--color-danger)'}
                  onMouseOut={e => e.currentTarget.style.color = 'var(--color-muted)'}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white w-full max-w-md p-8 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">
                {modal === 'create' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
              </h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs tracking-widest uppercase block mb-1"
                    style={{ color: 'var(--color-muted)' }}>{label}</label>
                  <input type="text" placeholder={placeholder}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full px-3 py-2 border text-sm outline-none bg-transparent"
                    style={{ borderColor: 'var(--color-border)' }} />
                </div>
              ))}
              {form.image_url && (
                <div className="h-24 overflow-hidden rounded" style={{ border: '1px solid var(--color-border)' }}>
                  <img src={form.image_url} alt="preview" className="w-full h-full object-cover"
                    onError={e => e.target.style.display = 'none'} />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 py-3 text-sm border"
                style={{ borderColor: 'var(--color-border)' }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 text-sm text-white disabled:opacity-70"
                style={{ background: 'var(--color-primary)' }}>
                {saving ? 'Sauvegarde...' : modal === 'create' ? 'Créer' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
