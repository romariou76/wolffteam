import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AlertsService } from '../../Services/alerts.service';
import { AuthService } from '../../Services/auth.service';
import { ToggleSidebarService } from '../../Services/toggle-sidebar.service';
import {MatDividerModule} from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { SetPrecioIngresoDialogComponent } from '../../Views/Maestros/PrecioIngreso/Dialog/set-precio-ingreso-dialog/set-precio-ingreso-dialog.component';
import { MatDialog } from '@angular/material/dialog';
@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    FormsModule,
    CommonModule,
    MatDividerModule,
    MatIconModule,
    SetPrecioIngresoDialogComponent

  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

 private alerta = inject(AlertsService)
  public authorization = inject(AuthService)
  dialog = inject(MatDialog);
  router = inject(Router)

  constructor(private Router : Router, public toggleSidebarService: ToggleSidebarService){}

  CerrarSesion(): void {
    this.alerta.cerrarSesion();
  }

  toggleSidebar() {
    if (this.toggleSidebarService.clasesidebar === 'a') {
      this.toggleSidebarService.setSidebarClass('active');
    } else {
      this.toggleSidebarService.setSidebarClass('a');
    }
  }

  clickOpenPrecioIngreso(){
    let dial = this.dialog.open(SetPrecioIngresoDialogComponent, {
      width: '100%',
      maxWidth: '500px',
      // disableClose: true
    });

    dial.afterClosed().subscribe(async (resp) => {
      // this.openAddDialog.set(0)
      if (resp) {
        // this.GetData();
      }
    });
  }

clase = signal<string>('');

toggleOption(id: string) {
  const anteriorId = this.clase();
  const nuevoElemento = document.getElementById(id);

  if (anteriorId === id) {
    if (nuevoElemento) nuevoElemento.classList.add('collapsed');
    this.clase.set('');
    localStorage.removeItem('menuActivo');
    return;
  }

  if (anteriorId) {
    const anteriorElemento = document.getElementById(anteriorId);
    if (anteriorElemento) anteriorElemento.classList.add('collapsed');
  }

  if (nuevoElemento) nuevoElemento.classList.remove('collapsed');
  this.clase.set(id);
  localStorage.setItem('menuActivo', id);
 if (!id.startsWith('dd')) {
    this.router.navigate([`/plataforma/` + id]);
  }
}

ngOnInit(): void {
  const idGuardado = localStorage.getItem('menuActivo');
  if (idGuardado) {
    const elemento = document.getElementById(idGuardado);
    if (elemento) {
      elemento.classList.remove('collapsed');
      this.clase.set(idGuardado);
    }
  }
}



}
