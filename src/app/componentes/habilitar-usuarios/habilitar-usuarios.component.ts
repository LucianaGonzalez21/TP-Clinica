import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, async } from 'rxjs';
import { FirebaseService } from 'src/app/servicios/firebase.service';
import { NotificacionesService } from 'src/app/servicios/notificaciones.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-habilitar-usuarios',
  templateUrl: './habilitar-usuarios.component.html',
  styleUrls: ['./habilitar-usuarios.component.css']
})
export class HabilitarUsuariosComponent implements OnInit, OnDestroy {
  arrayEspecialistas: any[] = [];
  arrayPacientes: any[] = [];
  arrayAdministradores: any[] = [];
  arrayCitasTodas: any[] = [];
  suscripcion1: Subscription = new Subscription();
  suscripcion2: Subscription = new Subscription();
  suscripcion3: Subscription = new Subscription();
  suscripcion4: Subscription = new Subscription();
  textoBoton: string = '';
  pacienteSelecionado: any = "";

  constructor(private firebase: FirebaseService, private notificaciones: NotificacionesService) { }

  ngOnDestroy(): void {
    this.suscripcion1.unsubscribe();
    this.suscripcion2.unsubscribe();
    this.suscripcion3.unsubscribe();
    this.suscripcion4.unsubscribe();
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
    this.suscripcion4 = this.firebase.getCitas().subscribe((citas) => {
      this.arrayCitasTodas = citas;
    })
  }
  
  mostrarHistorial(paciente: any) {
    this.pacienteSelecionado = paciente;
  }
  
  async modificarHabilitacion(especialista: any) {
    
    this.firebase.modificarObjetoPorAtributo("especialistas", especialista.uid, "estaHabilitado", !especialista.estaHabilitado).then(() => {
      this.notificaciones.mostrarSuccess("Exito al modificar", "HABILITACION", 2000, "toast-top-right");
    }).catch((error) => {
      this.notificaciones.mostrarError("Error al modificar", "HABILITACION", 2000, "toast-top-right");
    });
  }
  obtenerFechaFormateada(fecha: any): any {
    const fechaJs = new Date(fecha.seconds * 1000);
    return fechaJs;
  }
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }


  async descargarDatosTodosLosUsuarios() {
    const filename = 'ListaCompleta.xlsx';
    let arrayTodosLosUsuarios = this.arrayEspecialistas.concat(this.arrayPacientes, this.arrayAdministradores);
    let arrayFormateado = arrayTodosLosUsuarios.map(usuario => ({
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      edad:usuario.edad,
      tipoUsuario: usuario.tipoUsuario,
      mail: usuario.mail,
     }));
      this.exportAsExcelFile(arrayFormateado, filename);
  }


  CerrarHistorial(){
    this.pacienteSelecionado="";
  }

  async descargarInfoTurnosPaciente(paciente:any){
    const filename = 'informacionTurno.xlsx';

    // let turnosPacienteElegido:any;
    // let citasPaicente =  this.firebase.obtenerTurnosPorPaciente(paciente).subscribe(async turnos => {
    //    turnosPacienteElegido =turnos
    // } );

    // console.log(turnosPacienteElegido)
    
    
    //citasPaicente.unsubscribe();
    
    let citasPaciente = await this.firebase.obtenerTurnosPorPaciente(paciente);
    console.log(citasPaciente);
    let arrayPrueba = citasPaciente.map((datos:any)=>{
      return {
        especialista: datos.especialista.apellido + " " + datos.especialista.nombre,
        horario: datos.horario,
        estadoDelTurno: datos.estado,
        especialidad: datos.especialidadDelTurno,
        dia: this.obtenerFechaFormateada(datos.dia)
      }
    })
    this.exportAsExcelFile(arrayPrueba, filename);

  }


  
}
