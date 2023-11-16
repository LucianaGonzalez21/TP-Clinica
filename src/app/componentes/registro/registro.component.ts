import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent {

  usuarioRecibido : any;
  esPaciente:boolean=false;
  esEspecialista:boolean=false;

  constructor(private firebase: FirebaseService, private notificaciones: NotificacionesService, private router:Router){}
  
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
        this.esEspecialista=true;
        this.esPaciente=false;
        break;
      case "paciente":
        this.esEspecialista=false;
        this.esPaciente=true;
        break;
    }
  }
}
