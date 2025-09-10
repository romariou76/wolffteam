export interface Plan{
  id: number;
  nombre: string;
  precio: number;
  tipo: string;
  duracionMeses: number;
  fechaCreacion: Date;
  activo: boolean;
}

export interface PlanPost{
  nombre: string;
  precio: number;
  tipo: string;
  duracionMeses: number;
  fechaCreacion: Date
  activo: boolean;
}

export interface PlanPut{
  id: string;
  nombre: string;
  precio: number;
  tipo: string;
  duracionMeses: number;
  fechaCreacion: Date
  activo: boolean;
}
