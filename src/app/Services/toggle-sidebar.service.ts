import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleSidebarService {

  clasesidebar = 'a'

  setSidebarClass(className: string) {
    this.clasesidebar = className;
  }

  constructor() { }
}
