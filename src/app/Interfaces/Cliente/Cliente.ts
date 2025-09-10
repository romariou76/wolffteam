export interface Cliente {
 id: number;
  nombre: string;
  apellidos: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  tipoDocumento:string;
  idCreadoPor: number;
  creadoPor: string;
  genero: string;
  telefono: string;
  correo: string;
  direccion: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;

  idModificadoPor: number;
  modificadoPor: string;
}


export interface ClientePost {
 id: number;
  nombre: string;
  apellidos: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  idCreadoPor: number;
  genero: string;
  telefono: string;
  correo: string;
  direccion: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
  idModificadoPor: number;
}

export interface ClientePut {
 id: number;
  nombre: string;
  apellidos: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  idCreadoPor: number;
  genero: string;
  telefono: string;
  correo: string;
  direccion: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
  idModificadoPor: number;
}
