export interface Venta{
  id: number;
  idCliente: number;
  cliente: string;
  fechaRegistro: Date;
  total: number;
  estado: string;
  idUsuario: number;
  registradoPor: string;
  idFormaDePago: number;
  formaDePago: string;
  observaciones: string
}

export interface VentaPost{
  idCliente: number;
  fechaRegistro: Date;
  estado: string;
  total: number;
  idUsuario: number;
  idFormaDePago: number;
  observaciones: string
}


export interface DetalleVenta{
  id: number;
  idVenta: number;
  idProducto: number;
  producto: string;
  cantidad: number
  precioUnitario: number;
  precioTotal: number;
}

export interface DetalleVentaPost{
  idVenta: number;
  idProducto: number;
  cantidad: number
  precioUnitario: number;
  precioTotal: number;
}

export interface VentaDetalles{
  venta: Venta;
  detalles: DetalleVenta[];
}

export interface ReporteVenta{
  id: number;
  idCliente: number;
  cliente: string;
  fechaRegistro: Date;
  total: number;
  estado: string;
  idUsuario: number;
  registradoPor: string;
  idFormaDePago: number;
  formaDePago: string;
  observaciones: string;
}


export interface ReporteVentaBusqueda{
  cliente: string  | null;
  vendedor: string  | null;
  formaDePago: string  | null;
  fechaDesde: Date;
  fechaHasta: Date;
}
