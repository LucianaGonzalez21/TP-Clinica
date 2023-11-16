import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alta-administrador',
  templateUrl: './alta-administrador.component.html',
  styleUrls: ['./alta-administrador.component.css']
})
export class AltaAdministradorComponent {
  fileName = '';
  fotoSeleccionada:boolean=false;
  fotoDelUsuario:string='';
  @Output() eventoAdmin : EventEmitter<any>=new EventEmitter<any>();

  constructor(private formBuilder: FormBuilder, private firebase: FirebaseService, private router: Router, private notificaciones: NotificacionesService) { }

  public get Nombre(): FormControl {
    return this.formularioAltaAdmin.get("nombre") as FormControl;
  }

  public get Apellido(): FormControl {
    return this.formularioAltaAdmin.get("apellido") as FormControl;
  }

  public get Edad(): FormControl {
    return this.formularioAltaAdmin.get("edad") as FormControl;
  }

  public get Dni(): FormControl {
    return this.formularioAltaAdmin.get("dni") as FormControl;
  }

  public get Mail(): FormControl {
    return this.formularioAltaAdmin.get("mail") as FormControl;
  }

  public get Clave(): FormControl {
    return this.formularioAltaAdmin.get("clave") as FormControl;
  }

  public get Especialidad(): FormControl {
    return this.formularioAltaAdmin.get("especialidad") as FormControl;
  }

  public get Foto()  {
    return document.getElementById('foto') as HTMLInputElement; 
  }
  

  public formularioAltaAdmin = this.formBuilder.group(
    {
      'nombre': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'apellido': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'edad': ['', [Validators.required, Validators.min(18), Validators.max(99), Validators.pattern('^[0-9]+$')]],
      'dni': ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      'mail': ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]],
      'clave': ['', [Validators.required, this.validarEspaciosVacios, Validators.minLength(6), Validators.maxLength(10)]],
      'confirmacionClave': ['', [Validators.required, this.validarEspaciosVacios, Validators.minLength(6), Validators.maxLength(10)]],
      'foto': ['', [Validators.required]],
    },
    { validators: this.validarClaves }
  );

  private validarEspaciosVacios(control: AbstractControl): null | object {
    const nombre = <string>control.value;
    const spaces = nombre.includes(' ');

    return spaces
      ? { contieneEspacios: true }
      : null;
  }

  private validarClaves(group: FormGroup): null | object {
    const clave: string = group.get('clave')?.value;
    const confirmacionClave: string = group.get('confirmacionClave')?.value;

    return (clave !== confirmacionClave) ? { "noCoinciden": true } : null;
  }

  async onFileSelected(event:any){
    const archivo = event.target.files[0];
    // console.log(archivo);
    
    if(archivo){
      this.fotoSeleccionada=true;
      this.fileName = archivo.name;
      const lectorDeArchivo = new FileReader();
      //Configura el lector con la imagen y como debe considerarla
      lectorDeArchivo.readAsDataURL(archivo);

      lectorDeArchivo.onload =(enventoLoadLector)=> {
        this.fotoDelUsuario=enventoLoadLector.target?.result as string;
      };
    }
  }

  async guardarAdmin(){

      const foto = await this.firebase.subirFotoAlStorage(this.Foto);
      
      let admin = {
        nombre: this.Nombre.value,
        apellido: this.Apellido.value,
        edad: this.Edad.value,
        dni: this.Dni.value,
        mail: this.Mail.value,
        clave: this.Clave.value,
        fotoUrl: foto,
        esAdmin:true,
        tipoUsuario: "admin"
      }
      
      this.eventoAdmin.emit(admin);
    }
}
