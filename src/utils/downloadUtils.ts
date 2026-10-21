import html2canvas from 'html2canvas';

// 차트 다운로드 유틸리티
export const downloadChart = async (
  chartContainer: HTMLElement,
  format: 'png' | 'svg' | 'pdf' = 'png',
  filename: string = 'chart'
) => {
  try {
    switch (format) {
      case 'png':
        await downloadAsPNG(chartContainer, filename);
        break;
      case 'svg':
        await downloadAsSVG(chartContainer, filename);
        break;
      case 'pdf':
        await downloadAsPDF(chartContainer, filename);
        break;
      default:
        console.warn('지원하지 않는 다운로드 형식:', format);
    }
  } catch (error) {
    console.error('다운로드 중 오류 발생:', error);
    alert('다운로드에 실패했습니다.');
  }
};

// PNG 다운로드
const downloadAsPNG = async (chartContainer: HTMLElement, filename: string) => {
  // Plotly 차트 영역만 찾기
  const plotlyChart = chartContainer.querySelector('.plotly-graph-div');
  const targetElement = (plotlyChart || chartContainer) as HTMLElement;
  
  const canvas = await html2canvas(targetElement, {
    backgroundColor: '#ffffff',
    scale: 2, // 고해상도
    useCORS: true,
    allowTaint: true,
    // 차트 영역만 캡처하기 위한 설정
    width: targetElement.scrollWidth,
    height: targetElement.scrollHeight,
    // 여백 제거
    x: 0,
    y: 0
  });
  
  const link = document.createElement('a');
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

// SVG 다운로드 (Plotly 차트의 경우)
const downloadAsSVG = async (chartContainer: HTMLElement, filename: string) => {
  // Plotly 차트의 경우 SVG 데이터가 있는지 확인
  const plotlyChart = chartContainer.querySelector('.plotly-graph-div');
  if (plotlyChart && (plotlyChart as any).toImage) {
    try {
      const svgData = await (plotlyChart as any).toImage({ format: 'svg' });
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = svgData;
      link.click();
    } catch (error) {
      console.warn('SVG 다운로드 실패, PNG로 대체:', error);
      await downloadAsPNG(chartContainer, filename);
    }
  } else {
    // SVG가 지원되지 않는 경우 PNG로 대체
    await downloadAsPNG(chartContainer, filename);
  }
};

// PDF 다운로드
const downloadAsPDF = async (chartContainer: HTMLElement, filename: string) => {
  // PDF 다운로드 기능이 비활성화되었습니다 (jspdf 제거)
  // PNG 다운로드로 대체
  await downloadAsPNG(chartContainer, filename);
};

// 데이터 다운로드 (CSV)
export const downloadDataAsCSV = (data: any[], filename: string = 'chart_data') => {
  if (!data || data.length === 0) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }

  const headers = Object.keys(data[0]);
  
  // CSV 데이터 생성 (한글 및 특수문자 처리 강화)
  const csvContent = [
    // 헤더 행
    headers.map(header => {
      // 헤더에 쉼표나 따옴표가 포함된 경우 처리
      if (typeof header === 'string' && (header.includes(',') || header.includes('"') || header.includes('\n'))) {
        return `"${header.replace(/"/g, '""')}"`;
      }
      return header;
    }).join(','),
    
    // 데이터 행
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        
        // null, undefined 처리
        if (value === null || value === undefined) {
          return '';
        }
        
        // 문자열로 변환
        const stringValue = String(value);
        
        // CSV에서 쉼표, 따옴표, 줄바꿈이 포함된 값 처리
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',')
    )
  ].join('\r\n'); // Windows Excel 호환성을 위해 \r\n 사용

  // UTF-8 BOM 추가 (Excel에서 한글 인코딩 문제 해결)
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 설정 다운로드 (JSON)
export const downloadConfigAsJSON = (config: any, filename: string = 'chart_config') => {
  const jsonContent = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
};

// 샘플 파일 다운로드 (public/sample_data/에서 직접 다운로드)
export const downloadSampleFile = (chartType: string, filename?: string): void => {
  // 차트 타입에 따른 샘플 파일명 매핑 (XLSX 파일로 변경)
  const sampleFileMap: { [key: string]: string } = {
    'bar': 'bar_chart.xlsx',
    'line': 'line_chart.xlsx',
    'pie': 'pie_chart.xlsx',
    'scatter': 'scatter_chart.xlsx',
    'area': 'area_chart.xlsx',
    'heatmap': 'heatmap_chart.xlsx',
    'bubble': 'bubble_chart.xlsx',
    'radar': 'radar_chart.xlsx',
    'gauge': 'gauge_chart.xlsx',
    'map': 'map.xlsx',
    'timeline': 'timeline_chart.xlsx',
    'wordcloud': 'wordcloud_chart.xlsx',
    'histogram': 'histogram_chart.xlsx',
    'boxplot': 'boxplot_chart.xlsx',
    'donut': 'donut_chart.xlsx',
    'treemap': 'treemap_chart.xlsx',
    'sunburst': 'sunburst_chart.xlsx',
    'waterfall': 'waterfall_chart.xlsx',
    'panel': 'panel_chart.xlsx',
    'stackedBar': 'stacked_bar_chart.xlsx',
    'combo': 'combo_chart.xlsx'
  };

  const sampleFileName = sampleFileMap[chartType];
  if (!sampleFileName) {
    alert('해당 차트 타입의 샘플 파일을 찾을 수 없습니다.');
    return;
  }

  // 파일명 설정 (사용자가 지정한 파일명이 있으면 사용, 없으면 차트 타입 기반)
  const downloadFileName = filename || `${chartType}_sample_data`;
  
  // public/sample_data/에서 직접 다운로드
  const link = document.createElement('a');
  link.href = `/sample_data/${sampleFileName}`;
  link.download = `${downloadFileName}.xlsx`;
  link.click();
};
