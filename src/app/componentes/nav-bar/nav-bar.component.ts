import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit{

  estaLogueado: boolean = false;
  datosUsuario: any;
  esPaciente:boolean=false;
  esEspecialista:boolean=false;
  esAdmin:boolean=false;

  constructor(private firebase: FirebaseService, private cdRef: ChangeDetectorRef, private notificaciones: NotificacionesService, private router: Router) {
  }

  ngAfterViewChecked() {
    this.estaLogueado = this.firebase.estaLogueado;
    // switch(this.datosUsuario?.tipoUsuario){
    //   case("especialista"):
    //   this.esEspecialista=true;
    //   this.esAdmin=false;
    //   this.esPaciente=false;
    //   break;
    //   case("paciente"):
    //   this.esEspecialista=false;
    //   this.esAdmin=false;
    //   this.esPaciente=true;
    //   break;
    //   case("admin"):
    //   this.esEspecialista=false;
    //   this.esAdmin=true;
    //   this.esPaciente=false;
    //   break;
    // }
    this.cdRef.detectChanges(); 
  }
  
  async ngOnInit(){
    let documento: any = await this.firebase.obtenerUsuarioDeBaseDeDatos();
    this.datosUsuario = documento.documento;

  }

  salir() {
    try {
      this.notificaciones.showSpinner();
      this.firebase.salir().then(() => {
        this.router.navigateByUrl("login");
        this.notificaciones.mostrarSuccess("Exito al salir", "SALIR", 2000, "toast-top-right");
      });
    } catch (error) {

    }
    finally {
      this.notificaciones.hideSpinner();
    }
  }
}
