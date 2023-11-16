import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-alta-especialista',
  templateUrl: './alta-especialista.component.html',
  styleUrls: ['./alta-especialista.component.css']
})
export class AltaEspecialistaComponent implements OnInit, OnDestroy {

  coleccionEspecialistas:any;
  arrayEspecialidades: any[] = [];
  suscripcion: Subscription = new Subscription();
  especialidades: any[] = [];
  fileName = '';
  fotoSeleccionada:boolean=false;
  fotoDelUsuario:string='';
  @Output() eventoEspecialista : EventEmitter<any> = new EventEmitter<any>();

  constructor(private formBuilder: FormBuilder, private firebase: FirebaseService, private router: Router, private notificaciones: NotificacionesService) { }

  ngOnInit(): void {
    this.suscripcion = this.firebase.traerEspecialidades().subscribe((datos: any) => {
      //console.log(datos[0].especialidades);
      this.coleccionEspecialistas = datos[0];
      this.arrayEspecialidades = datos[0].especialidades;
    });
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  public get Nombre(): FormControl {
    return this.formularioAlta.get("nombre") as FormControl;
  }

  public get Apellido(): FormControl {
    return this.formularioAlta.get("apellido") as FormControl;
  }

  public get Edad(): FormControl {
    return this.formularioAlta.get("edad") as FormControl;
  }

  public get Dni(): FormControl {
    return this.formularioAlta.get("dni") as FormControl;
  }

  public get Mail(): FormControl {
    return this.formularioAlta.get("mail") as FormControl;
  }

  public get Clave(): FormControl {
    return this.formularioAlta.get("clave") as FormControl;
  }
  
  public get Especialidad(): FormControl {
    return this.formularioAlta.get("especialidad") as FormControl;
  }

  public get Foto()  {
    return document.getElementById('foto') as HTMLInputElement; 
  }
  

  public formularioAlta = this.formBuilder.group(
    {
      'nombre': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'apellido': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'especialidad': ['', []],
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

  guardarEspecialidades(especialidad: any) {
    if (this.especialidades.includes(especialidad)) {
      let indice = this.especialidades.indexOf(especialidad);
      this.especialidades.splice(indice, 1);
    } else {
      this.especialidades.push(especialidad);
    }
  }

  agregarEspecialidad() {
    if (this.validarEspecialidad(this.Especialidad.value)) {

      this.firebase.agregarEspecialidad(this.coleccionEspecialistas).then(() => { 
        this.notificaciones.mostrarInfo("Especialidad agregada", "Alta especialista", 2000, "toast-top-right") }
      ).catch(error => {
        console.log(error.code)
      });
    }
  }

  validarEspecialidad(especialidad: string): boolean {

    if (especialidad == '') {
      this.notificaciones.mostrarError("Debe completar el campo", "Alta especialista", 2000, "toast-center-center");
      return false;
    }

    let especialidadMinuscula = this.eliminarAcentos(especialidad).toLowerCase();
    let arrayMinuscula: any[] = [];

    for (let i = 0; i < this.arrayEspecialidades.length; i++) {
      arrayMinuscula.push(this.eliminarAcentos(this.arrayEspecialidades[i].toLowerCase()));
    }

    if (arrayMinuscula.includes(especialidadMinuscula)) {
      this.notificaciones.mostrarError("La especialidad ya existe", "Alta especialista", 2000, "toast-center-center");
      return false;
    } else {
      const palabras = especialidad.split(' ');
      const palabrasCapitalizadas = palabras.map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase());
      this.arrayEspecialidades.push(palabrasCapitalizadas.join(" "));
      this.Especialidad.reset();
      return true;
    }
  }

  private eliminarAcentos(palabraConAcentos:string):string{
    const accentsMap: { [key: string]: string } = {
      'á': 'a',
      'é': 'e',
      'í': 'i',
      'ó': 'o',
      'ú': 'u',
      'ü': 'u',
      'Á': 'A',
      'É': 'E',
      'Í': 'I',
      'Ó': 'O',
      'Ú': 'U',
      'Ü': 'U',
    };

    return palabraConAcentos.replace(/[áéíóúüÁÉÍÓÚÜ]/g, caracterAcentuado => accentsMap[caracterAcentuado])
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

  async guardarEspecialista(){

    if(this.especialidades.length == 0){
      this.notificaciones.mostrarError("Seleccionar especialidad", "Alta Especialista", 2000, "toast-center-center")
    }else{
      const foto = await this.firebase.subirFotoAlStorage(this.Foto);
      //console.log(foto);
      
      let especialista = {
        nombre: this.Nombre.value,
        apellido: this.Apellido.value,
        edad: this.Edad.value,
        dni: this.Dni.value,
        especialidad: this.especialidades,
        mail: this.Mail.value,
        clave: this.Clave.value,
        fotoUrl: foto,
        estaHabilitado: false,
        tipoUsuario: "especialista"
      }
      
      this.eventoEspecialista.emit(especialista);
    }
  }
}
