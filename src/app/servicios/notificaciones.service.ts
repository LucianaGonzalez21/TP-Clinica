import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificacionesService {

  constructor(private notificaciones: ToastrService ,private spinner: NgxSpinnerService) { }

  mostrarSuccess(mensaje:string, titulo:string, tiempo:number, posicion:string){
    this.notificaciones.success(mensaje, titulo, {
      timeOut:tiempo,
      positionClass:posicion
    })
  }

  mostrarWarning(mensaje:string, titulo:string, tiempo:number, posicion:string){
    this.notificaciones.warning(mensaje, titulo, {
      timeOut:tiempo,
      positionClass:posicion
    })
  }

  mostrarError(mensaje:string, titulo:string, tiempo:number, posicion:string){
    this.notificaciones.error(mensaje, titulo, {
      timeOut:tiempo,
      positionClass:posicion
    })
  }

  mostrarInfo(mensaje:string, titulo:string, tiempo:number, posicion:string){
    this.notificaciones.info(mensaje, titulo, {
      timeOut:tiempo,
      positionClass:posicion
    })
  }

  mostrarSweetAlert(mensaje:string, titulo:string, icono:SweetAlertIcon) {
    Swal.fire(titulo, mensaje, icono);
  }

  async showAlertPedirConfirmacion(titulo:string,mensaje:string,btnTextConfirmacion:string): Promise<boolean> {
    // You can customize the title, text, and other options here
    const result = await Swal.fire({
      title: titulo,
      text: mensaje,
      background: 'rgba(6, 214, 160, 0.8)',
      color:'white',
      showCancelButton: true,
      confirmButtonText: btnTextConfirmacion,
      cancelButtonText: 'No',
    });
  
    if (result.isConfirmed) {
     return true;
    } else {
    return false;
    }
  }

  showSpinner(){
    this.spinner.show();
  }
  hideSpinner(){
    this.spinner.hide();
  }

  async showFormulario(): Promise<{ altura: number, peso: number, temperatura: number, presion: number, detalles: any} | null> {
    const { value: formValues } = await Swal.fire({
      title: 'Ingrese los datos',
      html:
        `<input id="altura" class="swal2-input" type="number" placeholder="Altura (cm)" step="0.01" required>` +
        `<input id="peso" class="swal2-input" type="number" placeholder="Peso (kg)" step="0.01" required>` +
        `<input id="temperatura" class="swal2-input" type="number" placeholder="Temperatura (°C)" step="0.01" required>` +
        `<input id="presion" class="swal2-input" type="number" placeholder="Presión (mmHg)" step="0.01" required>` +
        `<div id="detalles-container"></div>` +
        `<button id="agregar-detalle" class="swal2-confirm swal2-styled" type="button" style="display: none">Agregar Detalle</button>`,
      background: 'rgba(6, 214, 160, 0.8)',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const alturaInput = document.getElementById('altura') as HTMLInputElement;
        const pesoInput = document.getElementById('peso') as HTMLInputElement;
        const temperaturaInput = document.getElementById('temperatura') as HTMLInputElement;
        const presionInput = document.getElementById('presion') as HTMLInputElement;
        const detallesContainer = document.getElementById('detalles-container');
        const detallesInputs = detallesContainer?.getElementsByClassName('detalle-input') as HTMLCollectionOf<HTMLInputElement>;
        const claveInputs = detallesContainer?.getElementsByClassName('clave-input') as HTMLCollectionOf<HTMLInputElement>;
  
        const altura = parseFloat(alturaInput.value);
        const peso = parseFloat(pesoInput.value);
        const temperatura = parseFloat(temperaturaInput.value);
        const presion = parseFloat(presionInput.value);
  
        let detalles: any ={};
  
        for (let i = 0; i < detallesInputs.length; i++) {
          const unaClave = claveInputs[i].value;
          const valor = detallesInputs[i].value;
          detalles = {...detalles, [unaClave]:valor}
          console.log(detalles);
        }
        console.log(detalles);
        return { altura, peso, temperatura, presion, detalles };
      },
      didOpen: () => {
        const agregarDetalleButton = document.getElementById('agregar-detalle');
        const detallesContainer = document.getElementById('detalles-container');
  
        agregarDetalleButton!.style.display = 'block';
  
        let detalleCount = 0;
  
        agregarDetalleButton!.addEventListener('click', () => {
          if (detalleCount < 3) {
            const claveInput = document.createElement('input');
            claveInput.classList.add('swal2-input');
            claveInput.classList.add('clave-input');
            claveInput.setAttribute('placeholder', 'Clave ' + (detalleCount + 1));
            claveInput.setAttribute('data-clave', '');
            detallesContainer!.appendChild(claveInput);
            const detalleInput = document.createElement('input');
            detalleInput.classList.add('swal2-input');
            detalleInput.classList.add('detalle-input');
            detalleInput.setAttribute('placeholder', 'Valor ' + (detalleCount + 1));
            detalleInput.setAttribute('data-clave', '');
            detallesContainer!.appendChild(detalleInput);
            detalleCount++;
          }
  
          if (detalleCount === 3) {
            agregarDetalleButton!.style.display = 'none';
          }
        });
  
        const alturaInput = document.getElementById('altura') as HTMLInputElement;
        const pesoInput = document.getElementById('peso') as HTMLInputElement;
        const temperaturaInput = document.getElementById('temperatura') as HTMLInputElement;
        const presionInput = document.getElementById('presion') as HTMLInputElement;
        const confirmButton = Swal.getConfirmButton();
        confirmButton!.disabled = true;
  
        function validateInputs() {
          if (alturaInput.value && pesoInput.value && temperaturaInput.value && presionInput.value) {
            confirmButton!.disabled = false;
          } else {
            confirmButton!.disabled = true;
          }
        }
  
        alturaInput.addEventListener('input', validateInputs);
        pesoInput.addEventListener('input', validateInputs);
        temperaturaInput.addEventListener('input', validateInputs);
        presionInput.addEventListener('input', validateInputs);
  
        validateInputs();
      },
      willClose: () => {
        const detallesContainer = document.getElementById('detalles-container');
        detallesContainer!.innerHTML = ''; 
      },
      focusConfirm: false,
      allowOutsideClick: false,
      allowEnterKey: false,
      inputValidator: () => {
        const alturaInput = document.getElementById('altura') as HTMLInputElement;
        const pesoInput = document.getElementById('peso') as HTMLInputElement;
        const temperaturaInput = document.getElementById('temperatura') as HTMLInputElement;
        const presionInput = document.getElementById('presion') as HTMLInputElement;
  
        if (!alturaInput.value || !pesoInput.value || !temperaturaInput.value || !presionInput.value) {
          return 'Por favor, complete todos los campos obligatorios.';
        }
        return null;
      },
    });
  
    if (formValues && formValues.altura && formValues.peso && formValues.temperatura && formValues.presion) {
      return formValues as { altura: number, peso: number, temperatura: number, presion: number, detalles: any };
    } else {
      return null;
    }
  }
  
  async showAlertComentario(titulo: string, mensaje: string): Promise<string | false> {
    const result = await Swal.fire({
      title: titulo,
      html: `<input type="text" id="comentario" class="swal2-input" placeholder="Ingrese su comentario">`,
      background: 'rgba(6, 214, 160, 0.8)',
      color: 'white',
      showCancelButton: true,
      confirmButtonText: "Enviar",
      cancelButtonText: 'No',
      preConfirm: () => {
        const comentarioInput = document.getElementById('comentario') as HTMLInputElement;
        return comentarioInput.value;
      },
    });
  
    if (result.isConfirmed) {
      return result.value as string;
    } else {
      return false;
    }
  }
}
