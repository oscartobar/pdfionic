import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Directory, Encoding } from '@capacitor/filesystem';
import { Browser } from '@capacitor/browser';  // Para abrir el PDF en el navegador
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { PermissionStatus } from '@capacitor/filesystem';
import { Filesystem } from '@capacitor/filesystem';


const writeSecretFile = async () => {
  await Filesystem.writeFile({
    path: 'secrets/text.txt',
    data: 'This is a test',
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
  console.log('creado el archivo en', Directory.Documents);

};

const readSecretFile = async () => {
  const contents = await Filesystem.readFile({
    path: 'secrets/text.txt',
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
  console.log('lee en:', Directory.Documents);
  console.log('secrets:', contents);
};

const deleteSecretFile = async () => {
  await Filesystem.deleteFile({
    path: 'secrets/text.txt',
    directory: Directory.Documents,
  });
};

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private platform: Platform) { 
    this.checkPermissions();
  }

  
  async checkPermissions() {
    try {
      // Solicitar permisos de almacenamiento
      const permissions = await Filesystem.requestPermissions();

      if (permissions.publicStorage === 'granted') {
        console.log('Permiso de almacenamiento concedido');
        // Puedes continuar accediendo al sistema de archivos
        this.createFile();
      } else {
        console.log('Permiso de almacenamiento denegado');
      }
    } catch (e) {
      console.error('Error al solicitar permisos:', e);
    }
  }

  async createFile() {
    try {
      // Crear un archivo como ejemplo
      const result = await Filesystem.writeFile({
        path: 'test.txt',
        data: 'Contenido de prueba para el archivo',
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      console.log('Archivo creado en:', result.uri);
    } catch (e) {
      console.error('Error al crear archivo:', e);
    }
  }

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
          //const hasPermission = await this.checkPermissions2();
          
            // Aquí llamas a tu lógica para generar y abrir el PDF
            console.log('entro por que tiene permisos');
            pdfDocGenerator.getBase64(async (base64Data) => {
              console.log('inicia la descarga');
              await this.saveToDevice(base64Data);
            });
            console.log('fin descarga');
         
          
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