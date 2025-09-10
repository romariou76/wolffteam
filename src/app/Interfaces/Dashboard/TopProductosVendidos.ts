export interface TopProductosVendidos{
  idProducto: number;
  producto: string;
  cantidadVendida: number;
  montoTotal: number;
}

export interface DashboardTotalVentasDTO{
  totalVenta: number;
  ventaHoy: number;
  cantidadTotalItems: number;
  cantidadItemsHoy: number
}

export interface DashboardPie{
  name: string;
  y: number;
  color: string
}
