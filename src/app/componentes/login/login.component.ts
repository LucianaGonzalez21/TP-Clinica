import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {

  especialistas: any[] = [];
  suscripcion: Subscription = new Subscription();
  suscripcion2: Subscription = new Subscription();
  suscripcion3: Subscription = new Subscription();
  arrayAdmins: any[] = [];
  arrayPaciente: any[] = [];


  constructor(private firebase: FirebaseService, private formBuilder: FormBuilder, private router: Router, private notificaciones: NotificacionesService) {
  }

  ngOnInit(): void {
    this.suscripcion = this.firebase.traerEspecialistas().subscribe((especialistas) =>
      this.especialistas = especialistas
    )

    this.suscripcion2 = this.firebase.traerAdministradores().subscribe((admins) =>
      this.arrayAdmins = admins
    )
    this.suscripcion3 = this.firebase.traerPacientes().subscribe((pacientes) =>
      this.arrayPaciente = pacientes
    )
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
    this.suscripcion2.unsubscribe();
    this.suscripcion3.unsubscribe();
  }

  get emailTs() {
    return this.formularioIngreso.get("email") as FormControl;
  }

  get claveTs() {
    return this.formularioIngreso.get("clave") as FormControl;
  }

  public formularioIngreso = this.formBuilder.group(
    {
      'email': ['', [Validators.email, Validators.required, this.validarEspaciosVacios, Validators.pattern(/^[\w-.]+@([\w-]+.)+[\w-]{2,4}$/)]],
      'clave': ['', [Validators.required, Validators.minLength(6), Validators.maxLength(10)]]
    }
  );

  private validarEspaciosVacios(control: AbstractControl): null | object {
    const nombre = <string>control.value;
    const spaces = nombre.includes(' ');

    return spaces
      ? { contieneEspacios: true }
      : null;
  }

  async ingreso() {

    try {
      this.notificaciones.showSpinner();
      let esEspecialistaHabilitado = await this.validarEspecialistaHabilitado(this.emailTs.value);
      let esEspe = await this.validarEsEspecialista(this.emailTs.value);
      let esAdmin = await this.validarEsAdmin(this.emailTs.value);
      let esPaciente = await this.validarEsPaciente(this.emailTs.value);

      if (esEspecialistaHabilitado || esPaciente || esAdmin) {
        let estaVerificado = await this.firebase.ingresarConMailYClave(this.emailTs.value, this.claveTs.value);

        if (estaVerificado) {
          this.notificaciones.mostrarSuccess("Exito", "INGRESO", 2000, "toast-top-right");
          this.firebase.estaLogueado = true;
          for (let i = 0; i < this.arrayAdmins.length; i++) {
            if (this.arrayAdmins[i].mail == this.emailTs.value) {
              this.firebase.esAdmin = true;
              break;
            }
          }
          this.router.navigateByUrl("bienvenido");
        } else {
          this.notificaciones.mostrarError("Debe verificar su correo", "INGRESO", 2000, "toast-top-right");
        }

      } else if (esEspe && !esEspecialistaHabilitado)  {
        this.notificaciones.mostrarError("Especialista todavia no habilitado", "INGRESO", 2000, "toast-top-right");
      }else{
        this.notificaciones.mostrarError("No se encuentra registrado", "INGRESO", 2000, "toast-top-right");
      }
    } catch (error) {

    } finally {
      this.notificaciones.hideSpinner();
    }

  }

  accederRapido(usuario: string) {
    this.claveTs.setValue("123456");
    switch (usuario) {
      case "admin":
        this.emailTs.setValue("amelumia@gmail.com");
        break;
      case "especialista2":
        this.emailTs.setValue("jugruzohaya-1060@yopmail.com");
        break;
      case "especialista1":
        this.emailTs.setValue("hiddabahola-7537@yopmail.com");
        break;
      case "paciente1":
        this.emailTs.setValue("faucroukofappa-7710@yopmail.com");
        break;
      case "paciente2":
        this.emailTs.setValue("crattupeuxodo-7937@yopmail.com");
        break;
      case "paciente3":
        this.emailTs.setValue("veihuwoummanau-5987@yopmail.com");
        break;
    }
  }

  validarEspecialistaHabilitado(mail: any): boolean | number {
    let esEspecialistaHabilitado = false;
    this.especialistas.forEach((especialista) => {
      if (especialista.mail == mail && especialista.estaHabilitado) {
        esEspecialistaHabilitado = true;
        return;
      }
    });

    return esEspecialistaHabilitado;
  }
  validarEsEspecialista(mail: any): boolean | number {
    let esEspe = false;
    this.especialistas.forEach((espe) => {
      if (espe.mail == mail) {
        esEspe = true;
        return;
      }
    });

    return esEspe;
  }
  validarEsAdmin(mail: any): boolean | number {
    let esAdmin = false;
    this.arrayAdmins.forEach((admin) => {
      if (admin.mail == mail) {
        esAdmin = true;
        return;
      }
    });

    return esAdmin;
  }
  validarEsPaciente(mail: any): boolean | number {
    let esPaciente = false;
    this.arrayPaciente.forEach((admin) => {
      if (admin.mail == mail) {
        esPaciente = true;
        return;
      }
    });
    return esPaciente;
  }
}
