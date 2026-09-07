// frontend/src/components/gastos/ListaGastos.jsx 

import { useState, useEffect } from 'react';
import { listarGastos, borrarGasto } from '../../lib/api';
import { CATEGORIAS_GASTO } from '../../lib/constants';

export default function ListaGastos({ token, refreshTrigger }) {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [demoMode, setDemoMode] = useState(false);

  const fetchGastos = async () => {
    setLoading(true);
    setError(null);
    try {
      const { gastos: data, demo } = await listarGastos(token);
      setGastos(data);
      setDemoMode(demo);
    } catch (err) {
      setError(err.message || 'Error al cargar los gastos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGastos();
  }, [token, refreshTrigger]);

  const handleBorrar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este gasto?')) return;
    
    try {
      await borrarGasto(id, token);
      setGastos(gastos.filter(g => g.id !== id));
    } catch (err) {
      alert(err.message || 'Error al eliminar el gasto');
    }
  };

  const getNombreCategoria = (id) => {
    const cat = CATEGORIAS_GASTO.find(c => c.id === id);
    return cat ? cat.nombre : id;
  };

  if (loading) return <div className="text-gray-500 text-sm">Cargando gastos...</div>;
  if (error) return <div className="text-red-500 text-sm">{error}</div>;

  return (
    <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mt-6">
      <h3 className="text-lg font-semibold mb-4">Historial de Gastos</h3>
      
      {demoMode && (
        <div className="bg-yellow-50 text-yellow-700 p-2 rounded mb-4 text-sm">
          Modo de demostración: Los gastos no se guardan permanentemente sin una cuenta activa.
        </div>
      )}

      {gastos.length === 0 ? (
        <p className="text-gray-500 text-sm italic">No hay gastos registrados.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Fecha</th>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Concepto</th>
                <th className="px-4 py-2 text-left text-gray-500 font-medium">Categoría</th>
                <th className="px-4 py-2 text-right text-gray-500 font-medium">Monto</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {gastos.map((gasto) => (
                <tr key={gasto.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    {new Date(gasto.fecha || gasto.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{gasto.concepto}</td>
                  <td className="px-4 py-2 text-gray-600">{getNombreCategoria(gasto.categoria)}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900">
                    ${Number(gasto.monto).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleBorrar(gasto.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}