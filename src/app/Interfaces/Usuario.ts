export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  tipoDocumento: string;
  idCargo: number;
  cargo: string;
  password: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
}

export interface UsuarioPost {
  nombre: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  idCargo: number;
  password: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
}

export interface UsuarioPut {
  id: number;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  cargo: string;
  departamento: string;
  provincia: string;
  distrito: string;
  estado: boolean;
  documentoIdentidad: string;
  tipoDocumento: string;
  fechaRegistro: Date;
}

export interface UsuarioDTOReporte {
  id: number;
  nombre: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  tipoDocumento: string;
  idCargo: number;
  cargo: string;
  activo: boolean;
}
