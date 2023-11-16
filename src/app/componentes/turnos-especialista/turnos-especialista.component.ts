import { Component, ElementRef, ViewChild } from '@angular/core';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';

@Component({
  selector: 'app-turnos-especialista',
  templateUrl: './turnos-especialista.component.html',
  styleUrls: ['./turnos-especialista.component.css']
})
export class TurnosEspecialistaComponent {
  datosUsuario: any;
  mostrarHorarios: boolean = false;

  //Botones horarios Especialista
  quince = true;
  treinta = false;
  cuarentaCinco = false;
  sesenta = false;
  minutosDuracionConsultaSelecionados = 15;
  especialidadSelecionada = "";
  mostrarHistorial = false;
  historialClinicioSelecionado: any = "";
  turnos: any;
  turnosFiltrados: any;
  filtro: any = "";
  turnoSelecionado: any;

  razon = "";
  //Datos de encuesta 
  comentarios = '';
  calificacion = 1;
  nivelLimpieza = ['Malo', 'Normal', 'Excelente'];
  opcionSeleccionada: any = '';
  opcionesMultiple = ['Medico muy capacitado', 'Precio razonable', 'Comoda sala de espera'];
  muyCapacitado=false;
  precioRazonable=false;
  comodaSala=false;
  rango = 1;

  @ViewChild('dialog') dialog: ElementRef | undefined;
  @ViewChild('dialogCancelacion') dialogCancelacion: ElementRef | undefined;
  @ViewChild('dialogEncuesta') dialogEncuesta: ElementRef | undefined;
  // Define an array to hold the input field data

  resena = "";
  presion: any;
  temperatura: any;
  peso: any;
  altura: any;
  //detalles:any = [  { key: '', value: '' }, ];
  detalles: any = [];

  // Method to add a new input field
  addDetalle() {
    this.detalles.push({});
  }
  constructor(private firebase: FirebaseService, private notificacion: NotificacionesService,) { }

  async ngOnInit(): Promise<void> {
    let documento: any = await this.firebase.obtenerUsuarioDeBaseDeDatos();
    this.datosUsuario = documento.documento;
    if (this.datosUsuario?.especialidad) {
      this.especialidadSelecionada = this.datosUsuario?.especialidad[0];
      this.horaSelecionada(this.datosUsuario.horario[0].hora);
    }
    if (this.datosUsuario.tipoUsuario == "paciente") {
      this.historialClinicioSelecionado = this.datosUsuario.historial;
      let turno = { paciente: this.datosUsuario }
      this.turnoSelecionado = turno;
      console.log(this.historialClinicioSelecionado);
    }

    await this.firebase.getCitas().subscribe((citas) => {
      if (citas.length > 0) {
        this.turnos = citas;
      } else {
        this.turnos = new Array();
      }
      if (this.datosUsuario.tipoUsuario == "paciente") {
        this.turnos = this.turnos.filter((turno: any) => {
          // Compara el campo 'mail' del turno con 'correoDelUsuario'
          return turno.paciente.mail === this.datosUsuario.mail;
        });
        this.filterTurnosPaciente("");
      }
      if (this.datosUsuario.tipoUsuario == "admin") {
        // this.turnos = this.turnos.filter((turno: any) => {
        //   // Compara el campo 'mail' del turno con 'correoDelUsuario'
        //   // return turno.estado !== "aceptado" &&
        //   // turno.estado !== "rechazado" &&
        //   // turno.estado !== "finalizado" &&  turno.estado !== "cancelado";
        // });
        this.filterTurnosPaciente("");
      }
      if (this.datosUsuario.tipoUsuario == "especialista") {
        this.turnos = this.turnos.filter((turno: any) => {
          return turno.especialista.mail === this.datosUsuario.mail;
        });
        this.historialClinicioSelecionado = false;
        this.filterTurnosPaciente("");
      }
    });
  }

  ngOnDestroy(): void {
  }

  capitalizarNombre(nombreCompleto: string) {
    const palabras = nombreCompleto.split(' ');
    const palabrasCapitalizadas = palabras.map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase());
    return palabrasCapitalizadas.join(" ").toString();
  }
  vistaHorarios() {
    this.mostrarHorarios = !this.mostrarHorarios;
  }
  volverMenu() {
    this.mostrarHorarios = false;
    this.mostrarHistorial = false;
  }

  horaSelecionada(hora: string) {
    this.quince = false;
    this.cuarentaCinco = false;
    this.treinta = false;
    this.sesenta = false;
    this.minutosDuracionConsultaSelecionados = 15;
    switch (hora) {
      case 'quince':
        this.quince = true;
        break;
      case 'cuarentaCinco':
        this.cuarentaCinco = true;
        this.minutosDuracionConsultaSelecionados = 45;

        break;
      case 'treinta':
        this.treinta = true;
        this.minutosDuracionConsultaSelecionados = 30;
        break;
      default:
        this.sesenta = true;
        this.minutosDuracionConsultaSelecionados = 60;
        break;
    }
  }



  determinarindexDeEspecialidad() {
    let index = 0;
    let indexDelElemento = 0;
    this.datosUsuario.especialidad.forEach((especialidad: string) => {
      if (especialidad == this.especialidadSelecionada) {
        indexDelElemento = index;
      }
      index++;
    });
    return indexDelElemento;
  }

  descargarHistorialPdf() { }




  //console.log(historial);

  obtenerFechaFormateada(fecha: any): any {
    const fechaJs = new Date(fecha.seconds * 1000);
    return fechaJs;
  }

  async cancelarTurno(turno: any) {
    if (await this.notificacion.showAlertPedirConfirmacion("Turno", "¿Esta Seguro que desea rechazar el turno?", "Si")) {
      this.turnoSelecionado = turno;
      this.dialogCancelacion?.nativeElement.show();
    }
  }
  async subirRechazo() {
    this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "estado", "Rechazo");
    this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "comentario", this.datosUsuario.apellido + ": " + this.razon);
    this.dialogCancelacion?.nativeElement.close();
  }

  subirCancelacion() {
    this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "estado", "cancelado");
    this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "comentario", this.datosUsuario.apellido + ": " + this.razon);
    this.dialogCancelacion?.nativeElement.close();
  }
  async rechazarTurno(turno: any) {
    if (await this.notificacion.showAlertPedirConfirmacion("Turno", "¿Esta Seguro que desea rechazar el turno?", "Si")) {
      this.turnoSelecionado = turno;
      this.dialogCancelacion?.nativeElement.show();
      // this.firebase.modificarObjetoPorAtributo("citas", turno.uid, "estado", "rechazado");
    }
  }
  async aceptarTurno(turno: any) {
    if (await this.notificacion.showAlertPedirConfirmacion("Turno", "¿Esta Seguro que desea confirmar el turno?", "Si")) {
      this.firebase.modificarObjetoPorAtributo("citas", turno.uid, "estado", "aceptado");
    }
  }
  async finalizarTurno(turno: any) {
    this.turnoSelecionado = turno;
    if (this.dialog != null) {
      this.dialog.nativeElement.showModal();
    }
    //let comentarioEspecialista="comentario especialista";
    //this.firebase.modificarObjetoPorAtributo("citas", turno.uid, "comentarioEspecialista", comentarioEspecialista);

    // if (await this.notificacion.showAlertPedirConfirmacion("Turno", "¿Esta Seguro que desea finalizar el turno?", "Si")) {
    //turno.resenia = await dialog;
    // this.cargarHistorial(turno.paciente);
    // this.firebase.modificarObjetoPorAtributo("citas", turno.uid, "estado", "aceptado");
    // this.firebase.modificarObjetoPorAtributo("citas", turno.uid, "estado", "aceptado");
    // }
  }
  verResenia(turno: any) {
    if (turno.hasOwnProperty('encuesta')) {

      let opcionesActivas='';
      if(turno.encuesta.muyCapacitado){
        opcionesActivas+='Medico muy capacitado, '
      }
      if(turno.encuesta.comodaSala){
        opcionesActivas+='Precio razonable, '
      }
      if(turno.encuesta.precioRazonable){
        opcionesActivas+='Comoda sala, '
      }

      let resultado = `
      Comentario: ${turno?.encuesta.comentario}
      Calificación: ${turno?.encuesta.calificacion}
      Nivel de limpieza: ${turno?.encuesta.nivelLimpieza}
      Opciones seleccionadas: ${opcionesActivas}
      Satisfacción: ${turno.encuesta.satisfacion}
     `;
      resultado = resultado.replace(/\n/g, '<br/>');
      this.notificacion.mostrarSweetAlert(resultado, "Reseña", "info");
    }
    else {
      this.notificacion.mostrarSweetAlert(turno.especialista.apellido + ': ' + turno.historial.resena, "Reseña", "info");
    }
  }

  verComentario(turno: any) {
    this.notificacion.mostrarSweetAlert(turno.comentario, "Comentario", "info");
  }
  async verHistorial(turno: any) {
    const paciente: any = await this.firebase.obtenerUsuarioPorUID(turno.paciente.uid);
    this.turnoSelecionado = turno;
    this.historialClinicioSelecionado = paciente?.documento.historial;
  }

  public filterByInput() {
    this.filterTurnosPaciente(this.filtro);
  }
  formatearFecha(fecha: any) {
    let dia = fecha.getDate();
    let mes = fecha.toLocaleString('es-ES', { month: 'long' });
    let anio = fecha.getFullYear();
    return `${dia} ${mes} ${anio}`;
  }

  filtrarHistorial(historial: any, search: any) {
    if (
      historial &&
      (String(historial.altura) == (search) ||
        String(historial.fechaInforme) == (search) ||
        String(historial.peso) == (search) ||
        String(historial.presion) == (search) ||
        String(historial.temperatura) == (search))
    ) {
      return true;
    } else {
      return false;
    }
  }
  filtrarHistorialDetalles(detalles: any, search: any) {
    if (detalles) {
      return detalles.some((element: any) => {
        return (String)(element.key).includes(search) || (String)(element.value).includes(search);
      });
    } else {
      return false;
    }
  }



  async filterTurnosPaciente(value: string) {
    this.turnosFiltrados = this.turnos.filter((turno: any) => {
      let detalleCoincide = false;
      let historialCoincide = false;
      //Formateo la fecha a string para poder compararla y filtrala
      let diaEscrito = this.obtenerFechaFormateada(turno.dia);
      diaEscrito = this.formatearFecha(diaEscrito);
      //Verifico si tiene historial para poder filtrar historial y detalles que estan dentro del historial
      if (turno.hasOwnProperty('historial')) {
        historialCoincide = this.filtrarHistorial(turno.historial, value);
        detalleCoincide = this.filtrarHistorialDetalles(turno.historial?.detalles, value);
      }
      return (
        //comparaciones del especialista
        turno.especialista.especialidad.includes(value) ||
        turno.especialista.mail.includes(value) ||
        turno.especialista.nombre.includes(value) ||
        turno.especialista.apellido.includes(value) ||
        //comparaciones del turno
        turno.horario.includes(value) || turno.estado.includes(value) || turno.especialidadDelTurno.includes(value)
        || diaEscrito.includes(value) ||
        //Comparaciones del paciente 
        turno.paciente.nombre.includes(value) ||
        turno.paciente.apellido.includes(value) ||
        //comparaciones de historial y detalles
        historialCoincide
        || detalleCoincide
      )
    })
    //this.filtrarHistorialDetalles(this.turnosFiltrados.historial.detalles,value);
  }

  obtenerFormulario() {
    console.log(this.dialog?.nativeElement);
    let detalles: any[] = [];
    this.detalles.forEach((element: any) => {
      detalles.push(element);
    });

    const historial = {
      fechaInforme: new Date(),
      'altura': this.altura,
      'peso': this.peso ? this.peso : "NA",
      'presion': this.presion ? this.peso : "NA",
      'temperatura': this.temperatura ? this.temperatura : "NA",
      'detalles': this.detalles ? this.detalles : "NA",
      'resena': this.resena ? this.resena : "NA",
    }

    if (this.turnoSelecionado) {
      this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "historial", historial);
      this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "estado", "realizado");
      this.firebase.modificarObjetoPorAtributo("pacientes", this.turnoSelecionado.paciente.uid, "historial", historial);
    }
    this.dialog?.nativeElement.close();
  }

  enviarEncuesta(turno: any) {
    this.turnoSelecionado = turno;
    this.dialogEncuesta?.nativeElement.show();
  }

  subirEncuesta() {

    
   
    console.log(this.muyCapacitado);
    console.log(this.precioRazonable);
    console.log(this.comodaSala);

    let encuesta = {
      comentario: this.comentarios ? this.comentarios : "NA",
      calificacion: this.calificacion ? this.calificacion : 1,
      nivelLimpieza: this.opcionSeleccionada ? this.opcionSeleccionada : "Normal",
      muyCapacitado:this.muyCapacitado,
      comodaSala:this.comodaSala,
      precioRazonable:this.precioRazonable,
      satisfacion: this.rango ? this.rango : 1
    }
    this.dialogEncuesta?.nativeElement.close();
    console.log(encuesta);
    this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "encuesta", encuesta);
    this.firebase.modificarObjetoPorAtributo("citas", this.turnoSelecionado.uid, "estado", "finalizado");

  }
}
