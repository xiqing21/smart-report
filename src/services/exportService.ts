import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'exceljs';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import PptxGenJS from 'pptxgenjs';
import Handlebars from 'handlebars';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'html';
  template?: string;
  data: any;
  fileName: string;
  settings?: {
    includeCharts?: boolean;
    includeData?: boolean;
    watermark?: boolean;
    pageOrientation?: 'portrait' | 'landscape';
  };
}

export interface ExportProgress {
  progress: number;
  status: 'preparing' | 'processing' | 'generating' | 'completed' | 'error';
  message: string;
}

class ExportService {
  private progressCallback?: (progress: ExportProgress) => void;

  setProgressCallback(callback: (progress: ExportProgress) => void) {
    this.progressCallback = callback;
  }

  private updateProgress(progress: number, status: ExportProgress['status'], message: string) {
    if (this.progressCallback) {
      this.progressCallback({ progress, status, message });
    }
  }

  async exportToPDF(options: ExportOptions): Promise<Blob> {
    this.updateProgress(10, 'preparing', '准备PDF导出...');
    
    try {
      // 创建临时容器用于渲染内容
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.width = '210mm'; // A4宽度
      container.style.backgroundColor = 'white';
      container.style.padding = '20mm';
      container.style.fontFamily = 'Arial, sans-serif';
      
      // 使用模板渲染内容
      const template = this.getTemplate(options.template || 'default');
      const compiledTemplate = Handlebars.compile(template);
      container.innerHTML = compiledTemplate(options.data);
      
      document.body.appendChild(container);
      
      this.updateProgress(30, 'processing', '渲染页面内容...');
      
      // 使用html2canvas截图
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      this.updateProgress(60, 'generating', '生成PDF文件...');
      
      // 创建PDF
      const pdf = new jsPDF({
        orientation: options.settings?.pageOrientation || 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4宽度
      const pageHeight = 295; // A4高度
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // 添加第一页
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // 如果内容超过一页，添加更多页面
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // 添加水印
      if (options.settings?.watermark) {
        const pageCount = pdf.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
          pdf.setTextColor(200, 200, 200);
          pdf.setFontSize(50);
          pdf.text('智能报告系统', 105, 150, {
            angle: 45,
            align: 'center'
          });
        }
      }
      
      // 清理临时元素
      document.body.removeChild(container);
      
      this.updateProgress(100, 'completed', 'PDF导出完成');
      
      return pdf.output('blob');
    } catch (error) {
      this.updateProgress(0, 'error', `PDF导出失败: ${error}`);
      throw error;
    }
  }

  async exportToWord(options: ExportOptions): Promise<Blob> {
    this.updateProgress(10, 'preparing', '准备Word导出...');
    
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: options.data.title || '智能报告',
                    bold: true,
                    size: 32,
                  }),
                ],
                heading: HeadingLevel.TITLE,
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `生成时间: ${new Date().toLocaleString()}`,
                    size: 20,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
              new Paragraph({
                text: '',
              }),
              ...this.generateWordContent(options.data),
            ],
          },
        ],
      });
      
      this.updateProgress(70, 'generating', '生成Word文档...');
      
      const buffer = await Packer.toBuffer(doc);
      
      this.updateProgress(100, 'completed', 'Word导出完成');
      
      return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    } catch (error) {
      this.updateProgress(0, 'error', `Word导出失败: ${error}`);
      throw error;
    }
  }

  async exportToExcel(options: ExportOptions): Promise<Blob> {
    this.updateProgress(10, 'preparing', '准备Excel导出...');
    
    try {
      const workbook = new XLSX.Workbook();
      workbook.creator = '智能报告系统';
      workbook.lastModifiedBy = '智能报告系统';
      workbook.created = new Date();
      workbook.modified = new Date();
      
      // 如果有模板，使用模板渲染数据
      if (options.template) {
        this.updateProgress(20, 'processing', '正在应用模板...');
        const template = Handlebars.compile(options.template);
        const renderedData = template(options.data);
        // 这里可以解析渲染后的模板内容来构建Excel
      }
      
      // 创建概览工作表
      const summarySheet = workbook.addWorksheet('报告概览');
      summarySheet.columns = [
        { header: '项目', key: 'item', width: 20 },
        { header: '值', key: 'value', width: 30 },
      ];
      
      // 添加基本信息
      summarySheet.addRow({ item: '报告标题', value: options.data.title || '智能报告' });
      summarySheet.addRow({ item: '生成时间', value: new Date().toLocaleString() });
      summarySheet.addRow({ item: '数据来源', value: options.data.dataSource || '系统数据' });
      
      // 设置标题样式
      const titleRow = summarySheet.getRow(1);
      titleRow.font = { bold: true };
      titleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      
      this.updateProgress(40, 'processing', '处理数据表格...');
      
      // 如果有图表数据，创建数据工作表
      if (options.data.charts && options.settings?.includeData) {
        options.data.charts.forEach((chart: any, index: number) => {
          const chartSheet = workbook.addWorksheet(`图表${index + 1}数据`);
          
          if (chart.data && Array.isArray(chart.data)) {
            // 动态创建列
            const columns = Object.keys(chart.data[0] || {}).map(key => ({
              header: key,
              key: key,
              width: 15
            }));
            chartSheet.columns = columns;
            
            // 添加数据
            chart.data.forEach((row: any) => {
              chartSheet.addRow(row);
            });
            
            // 设置表头样式
            chartSheet.getRow(1).font = { bold: true };
            chartSheet.getRow(1).fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFE0E0E0' }
            };
            
            // 添加边框
            chartSheet.eachRow((row, rowNumber) => {
              row.eachCell((cell) => {
                cell.border = {
                  top: { style: 'thin' },
                  left: { style: 'thin' },
                  bottom: { style: 'thin' },
                  right: { style: 'thin' }
                };
              });
            });
          }
        });
      }
      
      // 添加统计分析工作表
      if (options.data.analysis) {
        const analysisSheet = workbook.addWorksheet('数据分析');
        analysisSheet.columns = [
          { header: '分析项', key: 'item', width: 20 },
          { header: '结果', key: 'result', width: 30 },
        ];
        
        Object.entries(options.data.analysis).forEach(([key, value]) => {
          analysisSheet.addRow({ item: key, result: String(value) });
        });
        
        // 设置表头样式
        analysisSheet.getRow(1).font = { bold: true };
        analysisSheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF70AD47' }
        };
      }
      
      this.updateProgress(80, 'generating', '生成Excel文件...');
      
      const buffer = await workbook.xlsx.writeBuffer();
      
      this.updateProgress(100, 'completed', 'Excel导出完成');
      
      return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
    } catch (error) {
      this.updateProgress(0, 'error', `Excel导出失败: ${error}`);
      throw error;
    }
  }

  async exportToPowerPoint(options: ExportOptions): Promise<Blob> {
    this.updateProgress(10, 'preparing', '准备PowerPoint导出...');
    
    try {
      const pptx = new PptxGenJS();
      
      // 设置演示文稿属性
      pptx.author = '智能报告系统';
      pptx.company = '智能报告系统';
      pptx.revision = '1';
      pptx.subject = options.data.title || '智能报告';
      pptx.title = options.data.title || '智能报告';
      
      this.updateProgress(30, 'processing', '创建标题页...');
      
      // 创建标题页
      const titleSlide = pptx.addSlide();
      titleSlide.addText(options.data.title || '智能报告', {
        x: 1,
        y: 2,
        w: 8,
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: '363636',
        align: 'center'
      });
      
      titleSlide.addText(`生成时间: ${new Date().toLocaleString()}`, {
        x: 1,
        y: 4,
        w: 8,
        h: 0.5,
        fontSize: 18,
        color: '666666',
        align: 'center'
      });
      
      this.updateProgress(50, 'processing', '创建内容页...');
      
      // 创建摘要页
      if (options.data.summary) {
        const summarySlide = pptx.addSlide();
        summarySlide.addText('报告摘要', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1,
          fontSize: 32,
          bold: true,
          color: '363636'
        });
        
        summarySlide.addText(options.data.summary, {
          x: 0.5,
          y: 1.8,
          w: 9,
          h: 4,
          fontSize: 18,
          color: '666666',
          valign: 'top'
        });
      }
      
      // 创建关键指标页
      if (options.data.metrics && Array.isArray(options.data.metrics)) {
        const metricsSlide = pptx.addSlide();
        metricsSlide.addText('关键指标', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1,
          fontSize: 32,
          bold: true,
          color: '363636'
        });
        
        // 创建指标网格
        const metricsPerRow = 2;
        const cardWidth = 4;
        const cardHeight = 1.5;
        const startX = 0.5;
        const startY = 2;
        
        options.data.metrics.forEach((metric: any, index: number) => {
          const row = Math.floor(index / metricsPerRow);
          const col = index % metricsPerRow;
          const x = startX + col * (cardWidth + 0.5);
          const y = startY + row * (cardHeight + 0.5);
          
          // 添加背景矩形
          metricsSlide.addShape(pptx.ShapeType.rect, {
            x: x,
            y: y,
            w: cardWidth,
            h: cardHeight,
            fill: { color: 'F8F9FA' },
            line: { color: 'E9ECEF', width: 1 }
          });
          
          // 添加指标名称
          metricsSlide.addText(metric.name, {
            x: x + 0.2,
            y: y + 0.2,
            w: cardWidth - 0.4,
            h: 0.6,
            fontSize: 16,
            bold: true,
            color: '007BFF',
            align: 'center'
          });
          
          // 添加指标值
          metricsSlide.addText(metric.value, {
            x: x + 0.2,
            y: y + 0.8,
            w: cardWidth - 0.4,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '333333',
            align: 'center'
          });
        });
      }
      
      // 创建图表页
      if (options.data.charts && Array.isArray(options.data.charts) && options.settings?.includeCharts) {
        options.data.charts.forEach((chart: any, index: number) => {
          const chartSlide = pptx.addSlide();
          chartSlide.addText(chart.title || `图表 ${index + 1}`, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 32,
            bold: true,
            color: '363636'
          });
          
          // 如果有图表数据，创建简单的柱状图
          if (chart.data && Array.isArray(chart.data)) {
            const chartData = chart.data.map((item: any) => ({
              name: item.month || item.name || 'Item',
              labels: [item.month || item.name || 'Item'],
              values: [item.revenue || item.value || 0]
            }));
            
            chartSlide.addChart(pptx.ChartType.bar, chartData, {
              x: 1,
              y: 2,
              w: 8,
              h: 4
            });
          }
        });
      }
      
      this.updateProgress(80, 'generating', '生成PowerPoint文件...');
      
      const pptxBuffer = await pptx.write();
      
      this.updateProgress(100, 'completed', 'PowerPoint导出完成');
      
      return new Blob([pptxBuffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    } catch (error) {
      this.updateProgress(0, 'error', `PowerPoint导出失败: ${error}`);
      throw error;
    }
  }

  async exportToHTML(options: ExportOptions): Promise<Blob> {
    this.updateProgress(10, 'preparing', '准备HTML导出...');
    
    try {
      const template = this.getHTMLTemplate(options.template || 'default');
      const compiledTemplate = Handlebars.compile(template);
      
      this.updateProgress(50, 'processing', '渲染HTML内容...');
      
      const html = compiledTemplate({
        ...options.data,
        exportTime: new Date().toLocaleString(),
        includeCharts: options.settings?.includeCharts,
        includeData: options.settings?.includeData
      });
      
      this.updateProgress(100, 'completed', 'HTML导出完成');
      
      return new Blob([html], { type: 'text/html;charset=utf-8' });
    } catch (error) {
      this.updateProgress(0, 'error', `HTML导出失败: ${error}`);
      throw error;
    }
  }

  private generateWordContent(data: any): Paragraph[] {
    const paragraphs: Paragraph[] = [];
    
    // 添加摘要
    if (data.summary) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '报告摘要',
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: data.summary,
              size: 24,
            }),
          ],
        }),
        new Paragraph({ text: '' })
      );
    }
    
    // 添加关键指标
    if (data.metrics && Array.isArray(data.metrics)) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '关键指标',
              bold: true,
              size: 28,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
        })
      );
      
      data.metrics.forEach((metric: any) => {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${metric.name}: ${metric.value}`,
                size: 24,
              }),
            ],
          })
        );
      });
      
      paragraphs.push(new Paragraph({ text: '' }));
    }
    
    return paragraphs;
  }

  private getTemplate(templateName: string): string {
    const templates: Record<string, string> = {
      default: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <header style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px;">
            <h1 style="color: #007bff; margin: 0; font-size: 2.5em;">{{title}}</h1>
            <p style="color: #666; margin: 10px 0 0 0;">生成时间: {{exportTime}}</p>
          </header>
          
          {{#if summary}}
          <section style="margin-bottom: 30px;">
            <h2 style="color: #007bff; border-left: 4px solid #007bff; padding-left: 10px;">报告摘要</h2>
            <p style="background: #f8f9fa; padding: 15px; border-radius: 5px;">{{summary}}</p>
          </section>
          {{/if}}
          
          {{#if metrics}}
          <section style="margin-bottom: 30px;">
            <h2 style="color: #007bff; border-left: 4px solid #007bff; padding-left: 10px;">关键指标</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
              {{#each metrics}}
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: #007bff;">{{this.name}}</h3>
                <p style="font-size: 1.5em; font-weight: bold; margin: 0; color: #333;">{{this.value}}</p>
              </div>
              {{/each}}
            </div>
          </section>
          {{/if}}
          
          <footer style="margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
            <p>本报告由智能报告系统自动生成</p>
          </footer>
        </div>
      `,
      financial: `
        <div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #333;">
          <header style="text-align: center; margin-bottom: 40px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 2.8em;">{{title}}</h1>
            <h2 style="color: #7f8c8d; margin: 10px 0; font-weight: normal;">财务分析报告</h2>
            <p style="color: #95a5a6;">报告期间: {{reportPeriod}} | 生成时间: {{exportTime}}</p>
          </header>
          
          {{#if executiveSummary}}
          <section style="margin-bottom: 40px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">执行摘要</h2>
            <p style="text-align: justify; background: #ecf0f1; padding: 20px; border-radius: 5px;">{{executiveSummary}}</p>
          </section>
          {{/if}}
          
          {{#if financialMetrics}}
          <section style="margin-bottom: 40px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">财务指标</h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background: #3498db; color: white;">
                  <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">指标名称</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">当期值</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">同比变化</th>
                </tr>
              </thead>
              <tbody>
                {{#each financialMetrics}}
                <tr style="{{#if @index}}{{#if (eq (mod @index 2) 1)}}background: #f8f9fa;{{/if}}{{/if}}">
                  <td style="padding: 10px; border: 1px solid #ddd;">{{this.name}}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd; font-weight: bold;">{{this.value}}</td>
                  <td style="padding: 10px; text-align: right; border: 1px solid #ddd; color: {{#if (gt this.change 0)}}#27ae60{{else}}#e74c3c{{/if}};">{{this.change}}%</td>
                </tr>
                {{/each}}
              </tbody>
            </table>
          </section>
          {{/if}}
        </div>
      `
    };
    
    return templates[templateName] || templates.default;
  }

  private getHTMLTemplate(templateName: string): string {
    return `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{title}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 20px; }
          .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .metric-card { background: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; }
          .chart-container { margin: 30px 0; text-align: center; }
          .footer { margin-top: 50px; text-align: center; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        ${this.getTemplate(templateName)}
      </body>
      </html>
    `;
  }

  async export(data: any, options: ExportOptions): Promise<void> {
    const { format, fileName, template } = options;
    
    // 如果有模板，先编译模板
    let processedData = data;
    if (template) {
      try {
        const compiledTemplate = Handlebars.compile(template);
        processedData = {
          ...data,
          renderedContent: compiledTemplate(data)
        };
      } catch (error) {
        console.error('Template compilation error:', error);
      }
    }
    
    // 创建新的options对象，包含处理后的数据
    const exportOptions = {
      ...options,
      data: processedData
    };
    
    let blob: Blob;
    switch (format) {
      case 'pdf':
        blob = await this.exportToPDF(exportOptions);
        break;
      case 'docx':
        blob = await this.exportToWord(exportOptions);
        break;
      case 'xlsx':
        blob = await this.exportToExcel(exportOptions);
        break;
      case 'pptx':
        blob = await this.exportToPowerPoint(exportOptions);
        break;
      case 'html':
        blob = await this.exportToHTML(exportOptions);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
    
    // 下载文件
    this.downloadFile(blob, fileName);
  }


  
  // 生成HTML内容
  private generateHTMLContent(data: any, options: ExportOptions): string {
    const { template } = options;
    
    // 基础HTML模板
    const baseTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #1890ff 0%, #52c41a 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 300;
        }
        
        .header .meta {
            opacity: 0.9;
            font-size: 1.1em;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section h2 {
            color: #1890ff;
            font-size: 1.8em;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #1890ff;
        }
        
        .section h3 {
            color: #333;
            font-size: 1.4em;
            margin: 20px 0 15px 0;
        }
        
        .summary {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            border-left: 5px solid #1890ff;
            font-size: 1.1em;
            line-height: 1.8;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        
        .metric-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            transition: transform 0.3s ease;
            border: 1px solid #e8e8e8;
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .metric-value {
            font-size: 2.2em;
            font-weight: bold;
            color: #1890ff;
            margin-bottom: 8px;
        }
        
        .metric-label {
            color: #666;
            font-size: 1em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .chart-container {
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin: 20px 0;
        }
        
        .chart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            transition: background 0.3s ease;
        }
        
        .chart-item:hover {
            background: #e6f7ff;
        }
        
        .chart-label {
            font-weight: 500;
            color: #333;
        }
        
        .chart-bar {
            flex: 1;
            height: 12px;
            background: #f0f0f0;
            border-radius: 6px;
            margin: 0 15px;
            overflow: hidden;
        }
        
        .chart-fill {
            height: 100%;
            background: linear-gradient(90deg, #1890ff, #52c41a);
            border-radius: 6px;
            transition: width 0.8s ease;
        }
        
        .chart-value {
            font-weight: bold;
            color: #1890ff;
            min-width: 60px;
            text-align: right;
        }
        
        .footer {
            background: #f5f5f5;
            padding: 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e8e8e8;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .data-table th,
        .data-table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e8e8e8;
        }
        
        .data-table th {
            background: #1890ff;
            color: white;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .data-table tr:hover {
            background: #f8f9fa;
        }
        
        @media (max-width: 768px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 20px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .content {
                padding: 20px;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
        
        @media print {
            body {
                background: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{title}}</h1>
            <div class="meta">
                <div>生成时间: {{date}}</div>
                <div>报告作者: {{author}}</div>
            </div>
        </div>
        
        <div class="content">
            {{#if summary}}
            <div class="section">
                <h2>执行摘要</h2>
                <div class="summary">
                    {{summary}}
                </div>
            </div>
            {{/if}}
            
            {{#if data}}
            <div class="section">
                <h2>关键指标</h2>
                <div class="metrics-grid">
                    {{#each data}}
                    <div class="metric-card">
                        <div class="metric-value">{{this.value}}</div>
                        <div class="metric-label">{{this.label}}</div>
                    </div>
                    {{/each}}
                </div>
            </div>
            {{/if}}
            
            {{#if charts}}
            <div class="section">
                <h2>数据分析</h2>
                <div class="chart-container">
                    {{#each charts}}
                    <div class="chart-item">
                        <div class="chart-label">{{this.name}}</div>
                        <div class="chart-bar">
                            <div class="chart-fill" style="width: {{this.value}}%"></div>
                        </div>
                        <div class="chart-value">{{this.value}}%</div>
                    </div>
                    {{/each}}
                </div>
            </div>
            {{/if}}
            
            {{#if tableData}}
            <div class="section">
                <h2>详细数据</h2>
                <table class="data-table">
                    <thead>
                        <tr>
                            {{#each tableHeaders}}
                            <th>{{this}}</th>
                            {{/each}}
                        </tr>
                    </thead>
                    <tbody>
                        {{#each tableData}}
                        <tr>
                            {{#each this}}
                            <td>{{this}}</td>
                            {{/each}}
                        </tr>
                        {{/each}}
                    </tbody>
                </table>
            </div>
            {{/if}}
            
            {{#if renderedContent}}
            <div class="section">
                <h2>自定义内容</h2>
                <div class="custom-content">
                    {{{renderedContent}}}
                </div>
            </div>
            {{/if}}
        </div>
        
        <div class="footer">
            <p>此报告由智能报告系统自动生成 | 生成时间: {{date}}</p>
        </div>
    </div>
    
    <script>
        // 添加交互效果
        document.addEventListener('DOMContentLoaded', function() {
            // 图表动画
            const chartFills = document.querySelectorAll('.chart-fill');
            chartFills.forEach(fill => {
                const width = fill.style.width;
                fill.style.width = '0%';
                setTimeout(() => {
                    fill.style.width = width;
                }, 500);
            });
            
            // 卡片悬停效果
            const cards = document.querySelectorAll('.metric-card');
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-5px) scale(1.02)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });
        });
    </script>
</body>
</html>`;
    
    // 使用自定义模板或基础模板
    const finalTemplate = template || baseTemplate;
    
    // 编译模板
    const compiledTemplate = Handlebars.compile(finalTemplate);
    
    // 准备数据
    const templateData = {
      title: data.title || '数据分析报告',
      date: new Date().toLocaleString('zh-CN'),
      author: data.author || '系统管理员',
      summary: data.summary || '本报告展示了关键业务指标的分析结果，为决策提供数据支持。',
      data: data.metrics || data.data,
      charts: data.charts,
      tableData: data.tableData,
      tableHeaders: data.tableHeaders,
      renderedContent: data.renderedContent,
      ...data
    };
    
    return compiledTemplate(templateData);
  }
  
  private downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


}

export const exportService = new ExportService();
export default exportService;