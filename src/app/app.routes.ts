import { Routes } from '@angular/router';
import { LoginComponent } from './Auth/login/login.component';
import { sessionGuard } from './Guards/session.guard';
import { plataformGuard } from './Guards/plataform.guard';
import { Cliente } from './Interfaces/Cliente/Cliente';
import { ClienteComponent } from './Views/Clients/Page/cliente/cliente.component';
import { PlataformaComponent } from './Layout/plataforma/plataforma.component';
import { CargoComponent } from './Views/Maestros/Cargo/Page/cargo/cargo.component';
import { FormaPagoComponent } from './Views/Maestros/FormaPago/Page/forma-pago/forma-pago.component';
import { TipoDocumentoIdentidadComponent } from './Views/Maestros/TipoDocumentoIdentidad/Page/tipo-documento-identidad/tipo-documento-identidad.component';
import { UsuarioComponent } from './Views/Usuario/Page/usuario/usuario.component';
import { PlanComponent } from './Views/Planes/Page/plan/plan.component';
import { SuscripcionComponent } from './Views/Suscripciones/Page/suscripcion/suscripcion.component';
import { PagosComponent } from './Views/Pagos/Page/pagos/pagos.component';
import { ProductosComponent } from './Views/Productos/Page/productos/productos.component';
import { VisitaComponent } from './Views/Visita/Page/visita/visita.component';
import { VentaComponent } from './Views/Venta/Page/venta/venta.component';
import { AboutComponent } from './Views/About/Page/about/about.component';
import { DashboardPagosComponent } from './Views/Dashboard/Pagos/Page/dashboard-pagos/dashboard-pagos.component';
import { ReportePagosComponent } from './Views/Reportes/ReportePagos/Page/reporte-pagos/reporte-pagos.component';
import { ReporteInscripcionesComponent } from './Views/Reportes/ReporteInscripciones/Page/reporte-inscripciones/reporte-inscripciones.component';
import { ReporteVentasComponent } from './Views/Reportes/ReporteVentas/Page/reporte-ventas/reporte-ventas.component';
import { DashboardVentasComponent } from './Views/Dashboard/Ventas/Page/dashboard-ventas/dashboard-ventas.component';
import { DashboardInscripcionesComponent } from './Views/Dashboard/Inscripciones/Page/dashboard-inscripciones/dashboard-inscripciones.component';

export const routes: Routes = [

  // { path: "login", component: LoginComponent, canActivate: [sessionGuard] },
  { path: "login", component: LoginComponent, canActivate: [sessionGuard] },
  { path: "", redirectTo: "/login", pathMatch: "full" },
  {
    path: 'plataforma', component: PlataformaComponent, canActivate: [plataformGuard], children: [
      { path: '', redirectTo: "/plataforma/asistencia", pathMatch: "full" },

      { path: 'dashboard/pagos', component: DashboardPagosComponent },
      { path: 'dashboard/ventas', component: DashboardVentasComponent },
      { path: 'dashboard/inscripciones', component: DashboardInscripcionesComponent },


      { path: 'asistencia', component: VisitaComponent },
      { path: 'usuarios', component: UsuarioComponent },
      { path: 'clientes', component: ClienteComponent },

      { path: 'ventas', component: VentaComponent },


      { path: 'maestros/cargo', component: CargoComponent },
      { path: 'maestros/forma-pago', component: FormaPagoComponent },
      { path: 'maestros/tipo-documento-identidad', component: TipoDocumentoIdentidadComponent },


      { path: 'productos', component: ProductosComponent },
      { path: 'planes', component: PlanComponent },
      { path: 'inscripciones', component: SuscripcionComponent },
      { path: 'pagos', component: PagosComponent },

      { path: 'reporte/pagos', component: ReportePagosComponent },
      { path: 'reporte/inscripciones', component: ReporteInscripcionesComponent },
      { path: 'reporte/ventas', component: ReporteVentasComponent },


      { path: 'about', component: AboutComponent },


    ]
  },


];
