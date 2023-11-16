import { Component } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-seccion-usuarios',
  templateUrl: './seccion-usuarios.component.html',
  styleUrls: ['./seccion-usuarios.component.css']
})
export class SeccionUsuariosComponent {

  usuarioRecibido : any;
  paciente:boolean=false;
  especialista:boolean=false;
  admin:boolean=false;
  habilitacion:boolean=false;

  constructor(private firebase:FirebaseService, private notificaciones:NotificacionesService){}

  subirUsuario(evento:any, tipo:string){
    this.usuarioRecibido = evento;
    this.firebase.registrarUsuario(this.usuarioRecibido, tipo).then(() => {
      this.notificaciones.mostrarSuccess("Registro exitoso", "Alta", 3000, "toast-top-right");
      this.notificaciones.mostrarInfo("Verifique su correo", "Alta", 3000, "toast-top-right");
      //this.router.navigateByUrl('');
    });
  }

  mostrarFormulario(formulario:string){
    switch(formulario){
      case "especialista":
        this.especialista=true;
        this.paciente=false;
        this.admin=false;
        this.habilitacion=false;
        break;
      case "paciente":
        this.especialista=false;
        this.paciente=true;
        this.admin=false;
        this.habilitacion=false;
        break;
      case "admin":
        this.admin=true;
        this.especialista=false;
        this.paciente=false;
        this.habilitacion=false;
        break;
      case "habilitacion":
        this.admin=false;
        this.especialista=false;
        this.paciente=false;
        this.habilitacion=true;
        break;
    }
  }
}
