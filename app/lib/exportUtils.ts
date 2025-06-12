import { FlowchartData, ExportFormat } from './types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class FlowchartExporter {
  /**
   * フローチャートをPDFとしてエクスポート
   */
  static async exportToPDF(
    elementId: string, 
    filename: string = 'flowchart.pdf'
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Element not found');

      // 高解像度でキャンバスを作成
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }

  /**
   * フローチャートをPNGとしてエクスポート
   */
  static async exportToPNG(
    elementId: string, 
    filename: string = 'flowchart.png'
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Element not found');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('PNG export failed:', error);
      throw error;
    }
  }

  /**
   * フローチャートをSVGとしてエクスポート
   */
  static async exportToSVG(
    elementId: string, 
    filename: string = 'flowchart.svg'
  ): Promise<void> {
    try {
      const element = document.getElementById(elementId);
      if (!element) throw new Error('Element not found');

      const svgElement = element.querySelector('svg');
      if (!svgElement) throw new Error('SVG element not found');

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const link = document.createElement('a');
      link.href = svgUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(svgUrl);
    } catch (error) {
      console.error('SVG export failed:', error);
      throw error;
    }
  }

  /**
   * フローチャートをJSONとしてエクスポート
   */
  static exportToJSON(
    data: FlowchartData, 
    filename: string = 'flowchart.json'
  ): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('JSON export failed:', error);
      throw error;
    }
  }

  /**
   * 汎用エクスポート関数
   */
  static async export(
    format: ExportFormat,
    data: FlowchartData,
    elementId: string,
    filename?: string
  ): Promise<void> {
    const baseFilename = filename || `flowchart_${new Date().toISOString().split('T')[0]}`;
    
    switch (format) {
      case 'pdf':
        await this.exportToPDF(elementId, `${baseFilename}.pdf`);
        break;
      case 'png':
        await this.exportToPNG(elementId, `${baseFilename}.png`);
        break;
      case 'svg':
        await this.exportToSVG(elementId, `${baseFilename}.svg`);
        break;
      case 'json':
        this.exportToJSON(data, `${baseFilename}.json`);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }
}

export class FlowchartImporter {
  /**
   * JSONファイルからフローチャートデータをインポート
   */
  static async importFromJSON(file: File): Promise<FlowchartData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const data = JSON.parse(content) as FlowchartData;
          
          // 基本的なバリデーション
          if (!data.metadata || !data.nodes || !data.edges) {
            throw new Error('Invalid flowchart data format');
          }
          
          resolve(data);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * ファイル選択ダイアログを表示してインポート
   */
  static async selectAndImport(): Promise<FlowchartData> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }
        
        try {
          const data = await this.importFromJSON(file);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      
      input.click();
    });
  }
} 