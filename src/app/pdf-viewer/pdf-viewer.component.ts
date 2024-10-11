import { Component, OnInit } from '@angular/core';
import { PdfService } from '../services/pdf.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss'],
})
export class PdfViewerComponent  implements OnInit {

  constructor(private pdfService: PdfService) {}

  // Función para generar y mostrar el PDF
  generateAndShowPdf() {
    this.pdfService.createPdf("mipadffinal.pdf");
  }

  ngOnInit() {}

}
