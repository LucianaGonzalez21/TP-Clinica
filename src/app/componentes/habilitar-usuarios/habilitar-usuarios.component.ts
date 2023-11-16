import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-habilitar-usuarios',
  templateUrl: './habilitar-usuarios.component.html',
  styleUrls: ['./habilitar-usuarios.component.css']
})
export class HabilitarUsuariosComponent implements OnInit, OnDestroy {
  arrayEspecialistas: any[] = [];
  arrayPacientes: any[] = [];
  arrayAdministradores: any[] = [];
  suscripcion1: Subscription = new Subscription();
  suscripcion2: Subscription = new Subscription();
  suscripcion3: Subscription = new Subscription();
  textoBoton:string='';

  constructor(private firebase: FirebaseService, private notificaciones: NotificacionesService) { }

  ngOnDestroy(): void {
    this.suscripcion1.unsubscribe();
    this.suscripcion2.unsubscribe();
    this.suscripcion3.unsubscribe();
  }

  ngOnInit(): void {
    this.suscripcion1 = this.firebase.traerEspecialistas().subscribe((especialistas) => {
      this.arrayEspecialistas = especialistas;
    })

    this.suscripcion2 = this.firebase.traerPacientes().subscribe((pacientes) => {
      this.arrayPacientes = pacientes;
    })

    this.suscripcion3 = this.firebase.traerAdministradores().subscribe((admins) => {
      this.arrayAdministradores = admins;
    })
  }

  async modificarHabilitacion(especialista: any) {

    this.firebase.modificarObjetoPorAtributo("especialistas", especialista.uid,"estaHabilitado", !especialista.estaHabilitado).then(()=>
    {
      this.notificaciones.mostrarSuccess("Exito al modificar", "HABILITACION", 2000, "toast-top-right");
    }).catch((error) => {
      this.notificaciones.mostrarError("Error al modificar", "HABILITACION", 2000, "toast-top-right");
    });
  }

}
