import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MainContentComponent } from '../main-content/main-content.component';

@Component({
  selector: 'app-plataforma',
  imports: [
    SidebarComponent,
    MainContentComponent,
    SidebarComponent,
    RouterOutlet
  ],
  templateUrl: './plataforma.component.html',
  styleUrl: './plataforma.component.css'
})
export class PlataformaComponent {

}
