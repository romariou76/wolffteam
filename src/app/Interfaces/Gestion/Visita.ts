export interface Visita{
  id: number;
  idCliente: number;
  cliente: string;
  idInscripcion: number | null;
  inscripcion: string | null;
  tipo: string;
  fecha: Date;
  idUsuario: number;
  registradoPor: string;
  observaciones: string;
}

export interface VisitaPost{
  idCliente: number;
  idInscripcion: number | null;
  tipo: string;
  fecha: Date;
  idUsuario: number;
  observaciones: string;

  idFormaDePago: number | null;
  costo: number;
}
