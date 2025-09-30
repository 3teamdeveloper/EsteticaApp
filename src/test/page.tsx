'use client'

import { useOptimistic, useState } from 'react'

export default function OptimisticList() {
  const [items, setItems] = useState<string[]>([])
  
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (currentItems, newItem: string) => [...currentItems, newItem]
  )

  const handleSubmit = async (formData: FormData) => {
    const newItem = formData.get('item') as string
    addOptimisticItem(newItem) // Mostrar instantáneamente
    await fakeServerCall(newItem)
    setItems(prev => [...prev, newItem]) // Confirmar en el estado real
  }

  async function fakeServerCall(item: string) {
    return new Promise((res) => setTimeout(() => res(item), 1000))
  }

  return (
    <form
      action={handleSubmit}
      className="p-4 border rounded space-y-2 max-w-sm"
    >
      <input
        type="text"
        name="item"
        placeholder="Nuevo item"
        className="border p-2 rounded w-full"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Agregar
      </button>

      <ul className="pt-4 list-disc list-inside">
        {optimisticItems.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </form>
  )
}
