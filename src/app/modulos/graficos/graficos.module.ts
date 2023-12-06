import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GraficosRoutingModule } from './graficos-routing.module';
import { GraficosComponent } from './graficos.component';
import { EstadisticasComponent } from '../../componentes/estadisticas/estadisticas.component';
import { DatePipe } from '@angular/common';


@NgModule({
  declarations: [
    GraficosComponent,
    EstadisticasComponent
  ],
  imports: [
    CommonModule,
    GraficosRoutingModule,
  ],
  providers: [
    DatePipe
  ]
})
export class GraficosModule { }
