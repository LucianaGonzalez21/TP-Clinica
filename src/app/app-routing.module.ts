import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from './componentes/registro/registro.component';
import { LoginComponent } from './componentes/login/login.component';
import { SeccionUsuariosComponent } from './componentes/seccion-usuarios/seccion-usuarios.component';
import { esAdminGuard } from './guards/es-admin.guard';
import { BienvenidaComponent } from './componentes/bienvenida/bienvenida.component';
import { MiPerfilComponent } from './componentes/mi-perfil/mi-perfil.component';
import { TurnoPacienteComponent } from './componentes/turno-paciente/turno-paciente.component';
import { TurnosEspecialistaComponent } from './componentes/turnos-especialista/turnos-especialista.component';
import { estaLogueadoGuard } from './guards/esta-logueado.guard';

const routes: Routes = [
  {path: "", redirectTo:"bienvenido", pathMatch:"full"},
  {path: "alta", title:"Registro", component:RegistroComponent, data: { animation: "Alta" } },
  {path: "bienvenido", title:"Bienvenido", component:BienvenidaComponent, data: { animation: true } },
  {path: "login", title:"Ingreso", component:LoginComponent, data: { animation: true } },
  {path: "seccion-usuarios", component:SeccionUsuariosComponent, canActivate: [esAdminGuard], data: { animation: true} },
  {path: "mi-perfil", title:"Mi perfil", component:MiPerfilComponent, canActivate: [estaLogueadoGuard], data: { animation: true } },
  {path: "turno", title:"Turno", component:TurnoPacienteComponent, canActivate: [estaLogueadoGuard], data: { animation: true } },
  {path: "turnoEspecialista", title:"Turno", component:TurnosEspecialistaComponent, canActivate: [estaLogueadoGuard], data: { animation: true } },
  { path: 'graficos', loadChildren: () => import('./modulos/graficos/graficos.module').then(m => m.GraficosModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
