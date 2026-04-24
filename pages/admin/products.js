// pages/admin/products.js
import { useEffect, useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  getAllProductsAdmin, createProduct, updateProduct,
  deleteProduct, getCategories, setProductCategories
} from '../../lib/supabase'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY_PRODUCT = {
  name: '', slug: '', description: '', price: '', compare_price: '',
  stock: '', sizes: '', colors: '', images: '',
  is_active: true, is_featured: false, selectedCategoryIds: []
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [modal, setModal] = useState(null) // null | 'create' | product
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
    getCategories().then(({ data }) => setCategories(data || []))
  }, [])

  const load = () => getAllProductsAdmin().then(({ data }) => setProducts(data || []))

  const openCreate = () => { setForm(EMPTY_PRODUCT); setModal('create') }

  const openEdit = (p) => {
    const selectedCategoryIds = (p.product_categories || [])
      .map(pc => pc.categories?.id).filter(Boolean)
    setForm({
      ...p,
      selectedCategoryIds,
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      images: p.images?.join(', ') || '',
      price: p.price?.toString() || '',
      compare_price: p.compare_price?.toString() || '',
      stock: p.stock?.toString() || '',
    })
    setModal(p)
  }

  const toggleCategory = (catId) => {
    setForm(prev => ({
      ...prev,
      selectedCategoryIds: prev.selectedCategoryIds.includes(catId)
        ? prev.selectedCategoryIds.filter(id => id !== catId)
        : [...prev.selectedCategoryIds, catId]
    }))
  }

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error('Nom et prix requis'); return }
    setSaving(true)

    const { selectedCategoryIds, ...rest } = form
    const payload = {
      ...rest,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock: parseInt(form.stock) || 0,
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map(s => s.trim()).filter(Boolean) : [],
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    }
    // Remove fields not in products table
    delete payload.product_categories
    delete payload.category_id

    let productId
    if (modal === 'create') {
      const { data, error } = await createProduct(payload)
      if (error) { toast.error('Erreur: ' + error.message); setSaving(false); return }
      productId = data.id
    } else {
      const { error } = await updateProduct(modal.id, payload)
      if (error) { toast.error('Erreur: ' + error.message); setSaving(false); return }
      productId = modal.id
    }

    await setProductCategories(productId, selectedCategoryIds)
    toast.success(modal === 'create' ? 'Produit créé !' : 'Produit mis à jour !')
    setModal(null)
    load()
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    const { error } = await deleteProduct(id)
    if (error) toast.error('Erreur')
    else { toast.success('Produit supprimé'); load() }
  }

  const Field = ({ label, ...props }) => (
    <div>
      <label className="text-xs tracking-widest uppercase block mb-1"
        style={{ color: 'var(--color-muted)' }}>{label}</label>
      <input className="w-full px-3 py-2 border text-sm outline-none bg-transparent"
        style={{ borderColor: 'var(--color-border)' }} {...props} />
    </div>
  )

  return (
    <AdminLayout title="Produits">
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>{products.length} produits</p>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white"
          style={{ background: 'var(--color-primary)' }}>
          <Plus size={14} /> Nouveau produit
        </button>
      </div>

      <div className="bg-white border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid var(--color-border)`, background: 'var(--color-bg)' }}>
              {['Produit', 'Catégories', 'Prix', 'Stock', 'Actif', 'Actions'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-xs tracking-widest uppercase"
                  style={{ color: 'var(--color-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="hover:bg-base transition-colors"
                style={{ borderBottom: `1px solid var(--color-border)` }}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt={p.name}
                        className="w-10 h-12 object-cover" style={{ background: '#f5f2ee' }} />
                    )}
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      {p.is_featured && (
                        <span className="text-xs" style={{ color: 'var(--color-accent)' }}>★ sale</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: 'var(--color-muted)' }}>
                  {(p.product_categories || [])
                    .map(pc => pc.categories?.name).filter(Boolean).join(', ') || '—'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div>
                    <p className="font-medium">${parseFloat(p.price).toFixed(2)}</p>
                    {p.compare_price && (
                      <p className="line-through text-xs" style={{ color: 'var(--color-muted)' }}>
                        ${parseFloat(p.compare_price).toFixed(2)}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span style={{ color: p.stock > 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {p.is_active
                    ? <Check size={16} style={{ color: 'var(--color-success)' }} />
                    : <X size={16} style={{ color: 'var(--color-danger)' }} />}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)}
                      className="p-1.5 hover:text-accent transition-colors"
                      style={{ color: 'var(--color-muted)' }}>
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="p-1.5 transition-colors"
                      style={{ color: 'var(--color-muted)' }}
                      onMouseOver={e => e.currentTarget.style.color = 'var(--color-danger)'}
                      onMouseOut={e => e.currentTarget.style.color = 'var(--color-muted)'}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal !== null && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto py-8 px-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white w-full max-w-2xl p-8 animate-fade-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl">
                {modal === 'create' ? 'Nouveau produit' : 'Modifier le produit'}
              </h2>
              <button onClick={() => setModal(null)}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Field label="Nom du produit *" value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <Field label="Slug (URL)" value={form.slug}
                placeholder="auto-généré si vide"
                onChange={e => setForm({ ...form, slug: e.target.value })} />

              {/* Multi-select categories */}
              <div>
                <label className="text-xs tracking-widest uppercase block mb-2"
                  style={{ color: 'var(--color-muted)' }}>
                  Catégories
                </label>
                <div className="border p-3 max-h-32 overflow-y-auto space-y-1"
                  style={{ borderColor: 'var(--color-border)' }}>
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-accent">
                      <input
                        type="checkbox"
                        checked={form.selectedCategoryIds.includes(c.id)}
                        onChange={() => toggleCategory(c.id)}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
                {form.selectedCategoryIds.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
                    {form.selectedCategoryIds.length} sélectionnée(s)
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <label className="text-xs tracking-widest uppercase block mb-1"
                  style={{ color: 'var(--color-muted)' }}>Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border text-sm outline-none bg-transparent resize-none"
                  style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <Field label="Prix ($) *" type="number" step="0.01" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} />
              <Field label="Prix barré ($)" type="number" step="0.01" value={form.compare_price}
                onChange={e => setForm({ ...form, compare_price: e.target.value })} />
              <Field label="Stock" type="number" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })} />
              <div className="flex items-end gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Actif
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.is_featured}
                    onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
                  sale
                </label>
              </div>
              <div className="col-span-2">
                <Field label="Tailles (séparées par virgule)"
                  placeholder="XS, S, M, L, XL"
                  value={form.sizes}
                  onChange={e => setForm({ ...form, sizes: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Field label="Couleurs (séparées par virgule)"
                  placeholder="Blanc, Noir, Rouge"
                  value={form.colors}
                  onChange={e => setForm({ ...form, colors: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Field label="URLs des images (séparées par virgule)"
                  placeholder="https://..."
                  value={form.images}
                  onChange={e => setForm({ ...form, images: e.target.value })} />
              </div>
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
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
