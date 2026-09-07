'use client'; 

import { useState } from 'react';
import RegistrarGasto from '@/components/gastos/RegistrarGasto';
import ListaGastos from '@/components/gastos/ListaGastos';

export default function GastosPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Si manejas el token de autenticación a través de un contexto o custom hook, 
  // impórtalo aquí. Por ahora usaremos un string vacío o el método que uses en tu app.
  const token = ''; 

  const handleGastoRegistrado = (demoMode) => {
    setRefreshTrigger(prev => prev + 1);
    
    if (demoMode) {
      alert("Gasto registrado en modo demo (no se guardó en base de datos real).");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Gestión de Gastos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <RegistrarGasto token={token} onGastoRegistrado={handleGastoRegistrado} />
        </div>
        
        <div className="md:col-span-2">
          <ListaGastos token={token} refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}