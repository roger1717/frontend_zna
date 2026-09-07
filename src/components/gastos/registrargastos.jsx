import { useState } from 'react';
import { crearGasto } from '../../lib/api';
import { CATEGORIAS_GASTO } from '../../lib/constants';

export default function RegistrarGasto({ token, onGastoRegistrado }) {
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS_GASTO[0].id);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        concepto: concepto.trim(),
        monto: parseFloat(monto),
        categoria
      };

      const { demo } = await crearGasto(payload, token);
      
      setConcepto('');
      setMonto('');
      setCategoria(CATEGORIAS_GASTO[0].id);
      
      if (onGastoRegistrado) {
        onGastoRegistrado(demo);
      }
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar el gasto.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Registrar Gasto</h3>
      {error && <div className="bg-red-50 text-red-600 p-2 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Concepto</label>
          <input
            type="text"
            required
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej. Compra de papelería"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
          >
            {CATEGORIAS_GASTO.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Gasto'}
        </button>
      </form>
    </div>
  );
}