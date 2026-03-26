import { EntradaPost } from "./Entrada";

export interface Pase {
  id: number;
  idCliente: number;
  cliente: string;
  fecha: Date;
  total: number;
  estado: string;

  cantidadComprada: number;
  cantidadRestante: number;

  idUsuario: number;
  registradoPor: string;
  idFormaDePago: number;
  formaDePago: string;
  observaciones: string;
}

export interface PasePost {
  idCliente: number;
  fecha: Date;
  total: number;
  estado: string;

  cantidadComprada: number;
  cantidadRestante: number;

  idUsuario: number;
  idFormaDePago: number;
  observaciones: string;
}

export interface PaseEntradaRequest {
  paseEntrada: PasePost;
  entradas: EntradaPost[];
}
