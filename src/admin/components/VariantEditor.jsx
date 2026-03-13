import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function VariantEditor({ variants = [], onChange }) {
  function updateVariant(index, field, value) {
    const updated = variants.map((v, i) => i === index ? { ...v, [field]: value } : v);
    onChange(updated);
  }

  function addVariant() {
    onChange([...variants, { size: '', colorName: '', colorHex: '#111111', stock: 0, active: true }]);
  }

  function removeVariant(index) {
    onChange(variants.filter((_, i) => i !== index));
  }

  const inputClass = 'bg-[#f8f6f3] rounded-lg px-3 py-2 text-sm text-primary outline-none focus:ring-2 focus:ring-accent/40 w-full';

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-primary/50 font-body">
              <th className="pb-2 pr-2">Talla</th>
              <th className="pb-2 pr-2">Color</th>
              <th className="pb-2 pr-2">Hex</th>
              <th className="pb-2 pr-2">Stock</th>
              <th className="pb-2 pr-2">Activo</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v, i) => (
              <tr key={v.id || `new-${i}`} className="border-t border-primary/5">
                <td className="py-2 pr-2">
                  <input className={inputClass} value={v.size} onChange={(e) => updateVariant(i, 'size', e.target.value)} placeholder="S, M, L..." />
                </td>
                <td className="py-2 pr-2">
                  <input className={inputClass} value={v.colorName} onChange={(e) => updateVariant(i, 'colorName', e.target.value)} placeholder="Negro" />
                </td>
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border border-primary/10 flex-shrink-0" style={{ backgroundColor: v.colorHex }} />
                    <input className={inputClass} value={v.colorHex} onChange={(e) => updateVariant(i, 'colorHex', e.target.value)} placeholder="#111111" />
                  </div>
                </td>
                <td className="py-2 pr-2">
                  <input className={inputClass} type="number" min="0" value={v.stock} onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value) || 0)} />
                </td>
                <td className="py-2 pr-2 text-center">
                  <input type="checkbox" checked={v.active} onChange={(e) => updateVariant(i, 'active', e.target.checked)} className="accent-accent w-4 h-4" />
                </td>
                <td className="py-2">
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={addVariant} className="mt-3 flex items-center gap-2 text-accent font-body text-sm font-semibold hover:underline">
        <Plus size={16} /> Agregar variante
      </button>
    </div>
  );
}
