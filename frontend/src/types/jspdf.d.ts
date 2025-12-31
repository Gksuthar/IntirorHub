declare module 'jspdf' {
  // Minimal ambient declarations to satisfy TypeScript when @types/jspdf isn't available
  export class jsPDF {
    constructor(options?: any);
    addPage(): void;
    setFontSize(size: number): void;
    setFont(fontName: string, fontStyle?: string): void;
    text(text: string | string[], x: number, y: number, options?: any): void;
    rect(x: number, y: number, w: number, h: number, style?: any): void;
    setFillColor(r: number, g?: number, b?: number): void;
    setLineWidth(w: number): void;
    internal: any;
    output(type?: string): any;
    save(filename?: string): void;
    addImage(...args: any[]): void;
    splitTextToSize(text: string, maxWidth: number): string[];
  }

  const jsPDFExport: typeof jsPDF;
  export default jsPDFExport;
}
