'use client'

import { useState } from 'react'

export default function OrderPage() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', note: '' })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch('/api/public/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, method: 'COD' }),
    })
    if (res.ok) alert('Commande envoyée avec succès !')
    else alert('Erreur lors de la commande.')
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6">Commander avec paiement à la livraison</h2>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Nom complet"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="w-full border p-3 rounded"
          placeholder="Téléphone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          required
        />
        <textarea
          className="w-full border p-3 rounded"
          placeholder="Adresse complète"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          required
        />
        <textarea
          className="w-full border p-3 rounded"
          placeholder="Note (optionnel)"
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
        >
          Confirmer la commande
        </button>
      </form>
    </section>
  )
}
