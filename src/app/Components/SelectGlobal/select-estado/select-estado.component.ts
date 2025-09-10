import { CommonModule } from '@angular/common';
import { Component, effect, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

interface Estado {
  id: number
  descripcion: string
}

@Component({
  selector: 'app-select-estado',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './select-estado.component.html',
  styleUrl: './select-estado.component.css'
})
export class SelectEstadoComponent {

  readonly value = input<string>("");
  readonly event = output<string>();

  myControl = new FormControl<string | Estado>('');
  listatabla = signal<Estado[]>([]);
  listatotal = signal<Estado[]>([
    {
      id: 1,
      descripcion: 'VIGENTE',
    },
    {
      id: 2,
      descripcion: 'CULMINADO',
    }
  ]);
  estado: Estado = {} as Estado;

  constructor() {
    this.changeValue()
  }

  async GetList() {
    this.listatabla.set(this.listatotal())
  }

  changeValue() {
    effect(async () => {
      const value = this.value()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().findIndex((p) => p.descripcion == value);
        this.myControl.setValue(this.listatotal()[resp]);
        this.estado = this.listatotal()[resp];
        this.submitEvent(this.estado)
      })
    })
  }

  submitEvent(value: Estado) {
    this.estado = value;
    this.event.emit(value.descripcion);
  }

  displayFn(object: Estado) {
    return object && object.descripcion ? object.descripcion : '';
  }

  recarga(busqueda: string) {
    if (busqueda.trim() != '' && busqueda != null) {
      this.listatabla.set(
        this.listatotal().filter((p) =>
          p.descripcion.toUpperCase().includes(busqueda.toUpperCase())
        )
      );
    } else {
      this.listatabla.set(this.listatotal());
    }
  }

  ngOnInit() {
    this.GetList();
    this.myControl.valueChanges.subscribe((value) => {
      let busqueda: string =
        typeof value === 'string' ? value : value ? value.descripcion : '';
      this.recarga(busqueda.toUpperCase().trim());
    });
  }


}
