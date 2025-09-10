export interface Producto{
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
  fechaRegistro: Date;
  imagenUrl: string;
}

export interface ProductoPost{
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
  fechaRegistro: Date;
  imagenUrl: string;
}

export interface ProductoPut{
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
  fechaRegistro: Date;
  imagenUrl: string;
}
