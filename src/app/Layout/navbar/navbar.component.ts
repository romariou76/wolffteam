import { Component, inject } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { AlertsService } from '../../Services/alerts.service';
import { GetApiService } from '../../Services/get-api.service';
import { ToggleSidebarService } from '../../Services/toggle-sidebar.service';
import { Usuario } from '../../Interfaces/Usuario';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,

    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

private session = inject(AuthService)
  private alerta = inject(AlertsService)
  private getApI = inject(GetApiService)
  private sharedService = inject(ToggleSidebarService)

  constructor(){}

  usuario: Usuario = {} as Usuario

  getVendedor(){
    let id = this.session.GetIdUsuario()
    this.getApI.getUsuarioById(id).subscribe(
      empleado => {
        let data = empleado
        this.usuario = data
      }, error => {
      }
    )
  }

  toggleSidebar() {
    if (this.sharedService.clasesidebar === 'a') {
      this.sharedService.setSidebarClass('active');
    } else {
      this.sharedService.setSidebarClass('a');
    }
  }

  CerrarSesion(): void {
    this.alerta.cerrarSesion();
  }

  ngOnInit()
  {
    this.getVendedor()
  }

}
