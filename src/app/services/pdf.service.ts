import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';  // Para abrir el PDF en el navegador
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private platform: Platform) { }


  async generatePdf() {
    const documentDefinition = {
      content: [
        { text: 'PDF generado desde Ionic usando pdfMake', style: 'header' },
        { text: 'Este es un PDF de ejemplo creado con pdfMake en una aplicación Ionic.' }
      ]
    };

    // Generar el PDF en base64
    try{
      const pdfDocGenerator = pdfMake.createPdf(documentDefinition);

      pdfDocGenerator.getBuffer(async (buffer) => {
      
        if (this.platform.is('android')) {
          console.log('Generando PDF en Android...');
          const hasPermission = await this.checkPermissions();
  
          if (hasPermission) {
            // Aquí llamas a tu lógica para generar y abrir el PDF
            console.log('entro por que tiene permisos');
            pdfDocGenerator.getBase64(async (base64Data) => {
              console.log('inicia la descarga');
              await this.saveToDevice(base64Data);
            });
            console.log('fin descarga');
          }
          
        } else {
          const blob = new Blob([buffer], { type: 'application/pdf' });
          console.log('inicia la descarga en pc');
          await this.downloadPdfPC(blob);
          console.log('fin la descarga');
        }
      });
      
    }
      catch (e) {
      console.error('Error generando el PDF:', e);
    }



   


   
  }


  
  async downloadPdfPC(blob: Blob) {
       // Crear una URL para descargar el PDF en el navegador
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = 'planillapc.pdf';
       a.click();
  }

  // Función para guardar el archivo PDF en el sistema de archivos del dispositivo
  async saveToDevice(base64Data: string) {
    try {
      // Nombre del archivo
      const fileName = 'myPdf.pdf';

      // Guardar el archivo en el sistema de archivos
      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,  // Puedes usar otros directorios si es necesario
        encoding: Encoding.UTF8,  // Importante para guardar en formato base64
      });

      console.log('Archivo guardado en:', result.uri);
      //descargar el archivo
      await this.downloadPdf(result.uri);

      // Abrir el archivo PDF guardado
      //await this.openPdf(result.uri);
    } catch (e) {
      console.error('Error guardando el archivo:', e);
    }
  }

  // Función para abrir el archivo PDF utilizando el navegador o visor web
  async openPdf(uri: string) {
    await Browser.open({ url: uri });
  }

  
  async checkPermissions() {
    // Sólo para Android, ya que el manejo de permisos es específico para plataformas móviles.
    if (this.platform.is('android')) {
      try {
        // Aquí intentamos leer una carpeta para verificar si los permisos están disponibles.
        await Filesystem.readFile({
          path: 'dummy.txt',
          directory: Directory.Data,
        });

        // Si se puede leer, entonces ya tenemos permisos.
        console.log('Tiene permisos bien');
        return true;
      } catch (e) {
        // Si no se pueden leer archivos, intentamos solicitar los permisos.
        console.log('No tenemos permisos, solicitando...');
        return await this.requestPermissions();
      }
    }
    // Si no estamos en Android, no necesitamos permisos adicionales.
    return true;
  }

  async requestPermissions() {
    // A partir de Android 6.0 (API 23), necesitamos solicitar permisos en tiempo de ejecución.
    if (Capacitor.isNativePlatform()) {
      try {
        const permissionStatus = await Filesystem.checkPermissions();

        // Si el permiso no está concedido, lo solicitamos.
        if (permissionStatus.publicStorage !== 'granted') {
          const result = await Filesystem.requestPermissions();

          // Verificamos si el permiso fue concedido después de la solicitud.
          if (result.publicStorage === 'granted') {
            console.log('Permisos concedidos.');
            return true;
          } else {
            console.error('Permiso denegado. No se puede continuar sin permisos de almacenamiento. ');
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('Error al solicitar permisos: ', error);
        return false;
      }
    }

    return false;
  }


  // NUEVA FUNCIÓN: Permite descargar el PDF generado
  async downloadPdf(patharchivo : string) {
    try {
      const fileName = 'myPdf.pdf';
        if (!this.platform.is('android')) {
          // Si estamos en Android, ofrecer el archivo para descargar
          const filePath = patharchivo;
          const link = document.createElement('a');
          link.href = filePath;
          link.download = fileName;
          link.click();

          console.log('Archivo descargado:', patharchivo);
        }

        if (this.platform.is('android')) {
          await this.openPdf(patharchivo);
        }
      
    } catch (e) {
      console.error('Error descargando el archivo:', e);
    }
  }

}