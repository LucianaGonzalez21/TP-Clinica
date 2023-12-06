import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DiasSelecionadosArray {
  [key: string]: boolean;
  lunes: boolean;
  martes: boolean;
  miercoles: boolean;
  jueves: boolean;
  viernes: boolean;
}
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.css']
})
export class MiPerfilComponent implements OnInit, OnDestroy {

  datosUsuario: any;
  mostrarHorarios: boolean = false;

  //Botones horarios Especialista
  quince = true;
  treinta = false;
  cuarentaCinco = false;
  sesenta = false;
  minutosDuracionConsultaSelecionados = 15;
  especialidadSelecionada = "";
  diasSelecionadosArray: DiasSelecionadosArray = { 'lunes': false, 'martes': false, 'miercoles': false, 'jueves': false, 'viernes': false };
  mostrarHistorial = false;
  historialClinicioSelecionado: any = "";
  turnos:any;

  constructor(private firebase: FirebaseService, private notificacion: NotificacionesService) { }

  async ngOnInit(): Promise<void> {
    let documento: any = await this.firebase.obtenerUsuarioDeBaseDeDatos();
    this.datosUsuario = documento.documento;
    if (this.datosUsuario?.especialidad) {
      this.especialidadSelecionada = this.datosUsuario?.especialidad[0];
      console.log(this.datosUsuario.horario[0]);
      this.horaSelecionada(this.datosUsuario.horario[0].hora);
      this.diasSelecionadosArray = this.datosUsuario.horario[0].dias;
    }
    
    
    await this.firebase.getCitas().subscribe((citas) => {
      if (citas.length > 0) {
        this.turnos = citas;
      } else {
        this.turnos = new Array();
      }
      if (this.datosUsuario.tipoUsuario == "paciente") {
        this.turnos=  this.turnos.filter((turno:any) => {
          // Compara el campo 'mail' del turno con 'correoDelUsuario'
          return turno.paciente.mail === this.datosUsuario.mail;
        });
        this.historialClinicioSelecionado = this.datosUsuario.historial;
      }
      if (this.datosUsuario.tipoUsuario == "especialista") {
        this.turnos =  this.turnos.filter((turno:any) => {
          // Compara el campo 'mail' del turno con 'correoDelUsuario'
          return turno.especialista.mail === this.datosUsuario.mail;
        });
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
  verHistorialCitas() {
    this.mostrarHistorial = true;
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
  horaSelecionadaInt(hora: number) {
    this.quince = false;
    this.cuarentaCinco = false;
    this.treinta = false;
    this.sesenta = false;
    this.minutosDuracionConsultaSelecionados = 15;
    switch (hora) {
      case 15:
        this.quince = true;
        break;
      case 45:
        this.cuarentaCinco = true;
        this.minutosDuracionConsultaSelecionados = 45;

        break;
      case 30:
        this.treinta = true;
        this.minutosDuracionConsultaSelecionados = 30;
        break;
      default:
        this.sesenta = true;
        this.minutosDuracionConsultaSelecionados = 60;
        break;
    }
  }
  diasSelecionados(dia: any) {
    this.diasSelecionadosArray[dia] = !this.diasSelecionadosArray[dia];
  }
  cambiarEspecialidad(especialidad: string) {
    this.especialidadSelecionada = especialidad;
    const indexHorarioEspecialidad = this.determinarindexDeEspecialidad();
    this.diasSelecionadosArray = this.datosUsuario.horario[indexHorarioEspecialidad].dias;
    console.log(this.datosUsuario.horario[indexHorarioEspecialidad].duracionMinutos);
    this.horaSelecionadaInt(this.datosUsuario.horario[indexHorarioEspecialidad].duracionMinutos);
    //this.minutosDuracionConsultaSelecionados = this.datosUsuario.horario[indexHorarioEspecialidad].duracionMinutos;
  }

  async subirHorarioBD() {
    const indexEspecialidad = this.determinarindexDeEspecialidad();
    let horarioActual = this.datosUsuario;

    horarioActual = {
      ...this.datosUsuario.horario,
      [indexEspecialidad]: { 'duracionMinutos': this.minutosDuracionConsultaSelecionados, 'dias': this.diasSelecionadosArray, 'especialidad': this.especialidadSelecionada }
    }
    this.firebase.modificarObjetoPorAtributo('especialistas', this.datosUsuario.uid, 'horario', horarioActual);
    this.notificacion.mostrarSuccess("Horario Actualizado con exito", "Notificación de Horario", 1000, 'toast-top-right')
    const documento = await this.firebase.obtenerUsuarioDeBaseDeDatos();
    this.datosUsuario = documento?.documento;
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

  descargarHistorialPdf() {
    const DATA = document.getElementById('pdf');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
      useCORS: true,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas: any) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult: any) => {
        docResult.save(`historial_clinico.pdf`);
      });
  }

  async cargarHistorial(paciente: any) {
    let historial: any;
    console.log(paciente.email);
    historial = ""; //obtener el historial
    let historialNuevo: any;
    historialNuevo = await this.notificacion.showFormulario();

    if (historial != null) {
      historial = historial.historialesList[0];
      console.log("entre");
      historial = {
        uid: historial.uid,
        altura: historialNuevo?.altura || historial.altura,
        peso: historialNuevo?.peso || historial.peso,
        temperatura: historialNuevo?.temperatura || historial.temperatura,
        presion: historialNuevo?.presion || historial.presion,
        fechaInforme: new Date(),
        paciente: paciente,
        detalles: {
          // ...historial?.detalles,
          ...historialNuevo?.detalles,
        },

      };
      console.log(historial);

    } else {
      historial = {
        fechaInforme: new Date(),
        paciente: paciente,
        ...historialNuevo,
      };
    }

    

    //this.firebase.subirHistorial(historial);

    console.log(historial);
  }
  obtenerFechaFormateada( fecha: any): any {
    const fechaJs = new Date(fecha.seconds * 1000);
    return fechaJs;
  }

}
