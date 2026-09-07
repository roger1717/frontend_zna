/* RUTA DEL ARCHIVO: frontend/src/lib/inventario.js */

/**
 * Retorna el estado del stock de un producto para usar en badges y filtros.
 * @param {Object} producto Objeto con propiedad stock_actual (o stock_minimo)
 * @returns {{ clave: string, texto: string, tone: string }}
 */
export function estadoStock(producto) {
    if (!producto) {
      return { clave: 'sin_stock', texto: 'Agotado', tone: 'error' };
    }
  
    const stock = Number(producto.stock_actual || 0);
    const min = Number(producto.stock_minimo || 5);
  
    if (stock <= 0) {
      return { clave: 'sin_stock', texto: 'Agotado', tone: 'error' };
    }
  
    if (stock <= min) {
      return { clave: 'stock_bajo', texto: 'Stock bajo', tone: 'warning' };
    }
  
    return { clave: 'en_stock', texto: 'En stock', tone: 'success' };
  }