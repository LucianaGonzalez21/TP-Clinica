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
  {path: "alta", title:"Registro", component:RegistroComponent},
  {path: "bienvenido", title:"Bienvenido", component:BienvenidaComponent},
  {path: "login", title:"Ingreso", component:LoginComponent},
  {path: "seccion-usuarios", component:SeccionUsuariosComponent, canActivate: [esAdminGuard]},
  {path: "mi-perfil", title:"Mi perfil", component:MiPerfilComponent, canActivate: [estaLogueadoGuard]},
  {path: "turno", title:"Turno", component:TurnoPacienteComponent, canActivate: [estaLogueadoGuard]},
  {path: "turnoEspecialista", title:"Turno", component:TurnosEspecialistaComponent, canActivate: [estaLogueadoGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
