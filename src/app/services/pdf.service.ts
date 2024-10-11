import { Injectable } from '@angular/core';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Directory, Encoding } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Filesystem } from '@capacitor/filesystem';
import {  FileOpener, FileOpenerOptions } from '@capacitor-community/file-opener';


(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private platform: Platform) {
    var writeSecretFile = async () => {
      await this.requestPermissions();
    };
  }


  async requestPermissions() {
    try {
      // Solicitar permisos de almacenamiento
      const permissions = await Filesystem.requestPermissions();

      if (permissions.publicStorage === 'granted') {
        console.log('Permiso de almacenamiento concedido');
        // Puedes continuar accediendo al sistema de archivos
      } else {
        console.log('Permiso de almacenamiento denegado');
      }
    } catch (e) {
      console.error('Error al solicitar permisos:', e);
    }
  }



  async createPdf(nombreArchivo : string) {
    try {
      await this.requestPermissions();
      const pdfmake = require('pdfmake');
      const pdfFonts = require('pdfmake/build/vfs_fonts');
      pdfmake.vfs = pdfFonts.pdfMake.vfs;

      const pdfDocGenerator = pdfMake.createPdf({ content: 'This is a sample PDF' });

      pdfDocGenerator.getBase64( (base64Data) => {
      //   guardar PDF en el sistema de archivos
        Filesystem.writeFile({
          path: nombreArchivo,
          data: base64Data,
          directory: Directory.Documents,
        }).then((writeFileResult) => {
          // Get the file URI
          Filesystem.getUri({
            directory: Directory.Documents,
            path: nombreArchivo,
          }).then((getUriResult) => {
            const path = getUriResult.uri;
            
            // Open the file using the File Opener plugin
            FileOpener.open({ filePath: path.substr(7), contentType: 'application/pdf' });
          }, (error) => {
            console.error('Error while opening pdf', error);
          });


        });
        

      });
    } catch (e) {
      console.error('Error al crear archivo:', e);
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





}