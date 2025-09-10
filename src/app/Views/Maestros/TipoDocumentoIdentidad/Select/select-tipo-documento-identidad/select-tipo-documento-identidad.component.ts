import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { GetApiService } from '../../../../../Services/get-api.service';
import { TipoDocumentoIdentidad } from '../../../../../Interfaces/Global/TipoDocumentoIdentidad';

@Component({
  selector: 'app-select-tipo-documento-identidad',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './select-tipo-documento-identidad.component.html',
  styleUrl: './select-tipo-documento-identidad.component.css'
})
export class SelectTipoDocumentoIdentidadComponent {

  getapi = inject(GetApiService)

  readonly value = input<number>(0);
  readonly event = output<number>();
  readonly validacion = input<boolean>(true);
  value2 = model<number>(0)

  myControl = new FormControl<string | TipoDocumentoIdentidad>('');
  listatabla = signal<TipoDocumentoIdentidad[]>([]);
  listatotal = signal<TipoDocumentoIdentidad[]>([]);
  tipoDocumento: TipoDocumentoIdentidad = {} as TipoDocumentoIdentidad;

  constructor() {
    this.changeValue()
    this.changeValue2()
  }

  async GetList() {
    let resp = await this.getapi.getTipoDocumento();
    this.listatotal.set(resp);
    this.listatabla.set(this.listatotal())
  }

  changeValue() {
    effect(async () => {
      const value = this.value()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().findIndex((p) => p.id == value);
        this.myControl.setValue(this.listatotal()[resp]);
        this.tipoDocumento = this.listatotal()[resp];
        this.submitEvent(this.tipoDocumento)
      })
    })
  }

  changeValue2() {
    effect(async () => {
      const value = this.value2()
      untracked(async () => {
        await this.GetList();
        let resp = this.listatotal().find((p) => p.id == value);
        if (resp != undefined) {
          this.myControl.setValue(resp);
          this.tipoDocumento = resp;
          this.submitEvent(this.tipoDocumento)
        }
      })

    })
  }


  submitEvent(value: TipoDocumentoIdentidad) {
    this.tipoDocumento = value;
    this.value2.set(value.id)
    this.event.emit(value.id);
  }

  displayFn(object: TipoDocumentoIdentidad) {
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
