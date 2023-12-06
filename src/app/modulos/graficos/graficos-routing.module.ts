import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GraficosComponent } from './graficos.component';
import { EstadisticasComponent } from 'src/app/componentes/estadisticas/estadisticas.component';

const routes: Routes = [
  { path: '', component: GraficosComponent,
  children: [
    {path:'', title:"Estadisticas", component:EstadisticasComponent}
  ]
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GraficosRoutingModule { }
