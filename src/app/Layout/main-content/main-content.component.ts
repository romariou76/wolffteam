import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar.component';
import { ToggleSidebarService } from '../../Services/toggle-sidebar.service';

@Component({
  selector: 'app-main-content',
  imports: [
    NavbarComponent
  ],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.css'
})
export class MainContentComponent {

  // public helpersService = inject(HelpersService)
  public helpersService = inject(ToggleSidebarService)


  clasesidebar = 'a'

  setSidebarClass(className: string) {
    this.clasesidebar = className;
  }


}
