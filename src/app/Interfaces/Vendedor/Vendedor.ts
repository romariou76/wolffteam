export interface Vendedor{
  id: number;
  nombres: string;

  numeroDocumento: string;
  idTipoDocumento: number;
  tipoDocumento: string;
  edad: number;
  idGenero: number;
  genero: string;

  telefono: string;
  correo: string;
  direccion: string;

  idCargo: number;
  cargo: string;

  idDepartamento: number;
  departamento: string;
  idProvincia: number;
  provincia: string;
  idDistrito: number;
  distrito: string;

  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
}

export interface VendedorPost {
  nombres: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  edad: number;
  idGenero: number;
  telefono: string;
  correo: string;
  direccion: string;
  idCargo: number;
  clave: string;
  idDepartamento: number;
  idProvincia: number;
  idDistrito: number;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
}

export interface VendedorPut {
  id: number;
  nombres: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  edad: number;
  idGenero: number;
  telefono: string;
  correo: string;
  direccion: string;
  idCargo: number;
  clave: string;
  idDepartamento: number;
  idProvincia: number;
  idDistrito: number;
  activo: boolean;
  fechaRegistro: Date;
  fechaModificacion: Date;
}
