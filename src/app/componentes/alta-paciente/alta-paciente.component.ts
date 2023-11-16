import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-alta-paciente',
  templateUrl: './alta-paciente.component.html',
  styleUrls: ['./alta-paciente.component.css']
})
export class AltaPacienteComponent {
  fileName = '';
  fileName2 = '';
  fotoSeleccionada: boolean = false;
  fotoSeleccionada2: boolean = false;
  fotoDelUsuario: string = '';
  fotoDelUsuario2: string = '';
  @Output() eventoPaciente: EventEmitter<any> = new EventEmitter<any>();

  constructor(private formBuilder: FormBuilder, private firebase: FirebaseService, private router: Router, private notificaciones: NotificacionesService) { }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
  }

  public get Nombre(): FormControl {
    return this.formularioAltaPaciente.get("nombre") as FormControl;
  }

  public get Apellido(): FormControl {
    return this.formularioAltaPaciente.get("apellido") as FormControl;
  }

  public get Edad(): FormControl {
    return this.formularioAltaPaciente.get("edad") as FormControl;
  }

  public get Dni(): FormControl {
    return this.formularioAltaPaciente.get("dni") as FormControl;
  }

  public get Mail(): FormControl {
    return this.formularioAltaPaciente.get("mail") as FormControl;
  }

  public get Clave(): FormControl {
    return this.formularioAltaPaciente.get("clave") as FormControl;
  }

  public get ObraSocial(): FormControl {
    return this.formularioAltaPaciente.get("obraSocial") as FormControl;
  }

  public get Foto() {
    return document.getElementById('foto1') as HTMLInputElement;
  }

  public get Foto2() {
    return document.getElementById('foto2') as HTMLInputElement;
  }

  public formularioAltaPaciente = this.formBuilder.group(
    {
      'nombre': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'apellido': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'obraSocial': ['', [Validators.required, Validators.pattern('^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ ]+$'), Validators.minLength(3), Validators.maxLength(30)]],
      'edad': ['', [Validators.required, Validators.min(18), Validators.max(99), Validators.pattern('^[0-9]+$')]],
      'dni': ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      'mail': ['', [Validators.required, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]],
      'clave': ['', [Validators.required, this.validarEspaciosVacios, Validators.minLength(6), Validators.maxLength(10)]],
      'confirmacionClave': ['', [Validators.required, this.validarEspaciosVacios, Validators.minLength(6), Validators.maxLength(10)]],
      'foto1': ['', [Validators.required]],
      'foto2': ['', [Validators.required]],
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

  async onFileSelected(event: any, foto: string) {
    const archivo = event.target.files[0];

    if (archivo && foto == "foto1") {
      this.fotoSeleccionada = true;
      this.fileName = archivo.name;
      const lectorDeArchivo = new FileReader();
      //Configura el lector con la imagen y como debe considerarla
      lectorDeArchivo.readAsDataURL(archivo);

      lectorDeArchivo.onload = (enventoLoadLector) => {
        this.fotoDelUsuario = enventoLoadLector.target?.result as string;
      };
    } else if (archivo && foto == 'foto2') {
      this.fotoSeleccionada2 = true;
      this.fileName2 = archivo.name;
      const lectorDeArchivo = new FileReader();
      //Configura el lector con la imagen y como debe considerarla
      lectorDeArchivo.readAsDataURL(archivo);

      lectorDeArchivo.onload = (enventoLoadLector) => {
        this.fotoDelUsuario2 = enventoLoadLector.target?.result as string;

      }
    }
  }

  async guardarEspecialista() {
    const foto = await this.firebase.subirFotoAlStorage(this.Foto);
    const foto2 = await this.firebase.subirFotoAlStorage(this.Foto2);

    console.log("foto", this.Foto);
    console.log("foto2", this.Foto2);

    let especialista = {
      nombre: this.Nombre.value,
      apellido: this.Apellido.value,
      edad: this.Edad.value,
      dni: this.Dni.value,
      mail: this.Mail.value,
      clave: this.Clave.value,
      obraSocial: this.ObraSocial.value,
      foto1Url: foto,
      foto2Url: foto2,
      tipoUsuario: "paciente"
    }

    this.eventoPaciente.emit(especialista);
  }


}
