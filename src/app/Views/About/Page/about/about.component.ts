import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-about',
  imports: [
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent {

  sistema = {
    nombre: 'GYMSHARK 🏋️‍♂️',
    descripcion: 'Sistema de gestión para el gimnasio GYMSHARK. Facilita el control y monitoreo de operaciones administrativas.',
    version: '1.0.3',
    fechaDespliegue: '09 de julio de 2025',
    desarrolladoPor: 'Romario Quispe Hancco',
    contacto: 'romario91546@gmail.com 📧'
  };

}
