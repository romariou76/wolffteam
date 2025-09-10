export interface Pago {
  id: number;
  fechaPago: Date;
  monto: number;
  idFormaDePago: string;
  formaDePago: string;
  estado: string;
  idCliente: number;
  cliente: string;
  idUsuario: number
  registradoPor: string;
  tipoMovimientoAsociado: string;
  movimientoAsociadoID: number | null;
  observaciones: string;

  // idVenta?: number;
}

export interface PagoPost {
  fechaPago: Date;
  monto: number;
  idFormaDePago: number;
  estado: string;
  idCliente: number | null;
  idUsuario: number
  tipoMovimientoAsociado: string;
  movimientoAsociadoID: number | null;
  observaciones: string;
}

export interface PagoMovimientoBusqueda{
  TipoMovimientoAsociado: string;
  MovimientoAsociadoID: number
}

export interface PagosPorMesDto{
  mes: string;
  total: number
}


export interface ReportePagoBusqueda{
  cliente: string | null;
  vendedor: string | null;
  formaDePago: string | null;
  tipoMovimiento: string  | null;
  fechaDesde: Date;
  fechaHasta: Date;
}
