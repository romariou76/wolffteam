export interface Suscripcion{
  id: number;
  codigo: string
  idCliente: number
  cliente: string;
  idUsuario: number;
  creadoPor: string;
  idPlan: number;
  plan: string;
  total: number;
  totalPagado: number;
  pagado: boolean;
  fechaRegistro: Date;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string;
  estado: string;
}

export interface SuscripcionPost{
  codigo: string
  idCliente: number
  idUsuario: number;
  idPlan: number;
  total: number;
  totalPagado: number;
  pagado: boolean;
  fechaRegistro: Date;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string;
  estado: string;
}

export interface SuscripcionPut{
  id: number;
  idCliente: number
  idUsuario: number;
  idPlan: number;
  plan: string;
  total: number;
  totalPagado: number;
  pagado: boolean;
  fechaRegistro: Date;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string;
  estado: string;
}

export interface ReporteInscripcionBusqueda{
  cliente: string | null;
  vendedor: string | null;
  plan: string | null;
  estado: string | null;
  pagado: boolean | null;
  fechaDesde: Date;
  fechaHasta: Date;
}
