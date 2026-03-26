export interface Entrada {
  id: number;
  idPase: number;
  idCliente: number;
  cliente: string;
  usado: boolean;
  fecha: Date;
  fechaUso?: Date;
}

export interface EntradaPost {
  idPase?: number;
  idCliente: number;
  usado: boolean;
  fecha: Date;
  fechaUso?: Date;
}
