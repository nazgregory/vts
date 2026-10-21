// 데이터 내보내기 유틸리티

// CSV 데이터 생성
export const generateCSV = (data: any[], headers: string[]): string => {
  if (!data || data.length === 0) return '';
  
  // 헤더 행
  const csvContent = [headers.join(',')];
  
  // 데이터 행들
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      
      // 문자열에 쉼표가 포함된 경우 따옴표로 감싸기
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
    csvContent.push(values.join(','));
  });
  
  return csvContent.join('\n');
};

// 파일 다운로드 함수 (Excel 호환성 강화)
export const downloadCSV = (csvContent: string, filename: string): void => {
  // UTF-8 BOM 추가 (Excel에서 한글 인코딩 문제 해결)
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;
  
  // Excel 호환성을 위한 MIME 타입 설정
  const blob = new Blob([csvWithBOM], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Excel 다운로드 함수 (XLSX 라이브러리 사용)
export const downloadExcel = async (data: any[][], filename: string): Promise<void> => {
  try {
    // XLSX 라이브러리가 설치되어 있지 않으면 CSV로 대체
    const csvContent = data.map(row => 
      row.map(cell => {
        // null, undefined 처리
        if (cell === null || cell === undefined) {
          return '';
        }
        
        const stringValue = String(cell);
        
        // CSV에서 쉼표, 따옴표, 줄바꿈이 포함된 값 처리
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',')
    ).join('\r\n'); // Windows Excel 호환성을 위해 \r\n 사용
    
    downloadCSV(csvContent, filename);
  } catch (error) {
    console.error('Excel 다운로드 실패, CSV로 대체:', error);
    
    // 에러 발생 시에도 동일한 로직으로 CSV 생성
    const csvContent = data.map(row => 
      row.map(cell => {
        if (cell === null || cell === undefined) {
          return '';
        }
        
        const stringValue = String(cell);
        
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      }).join(',')
    ).join('\r\n');
    
    downloadCSV(csvContent, filename);
  }
};

// 차트 다운로드 함수들
export const downloadChart = async (
  chartContainer: HTMLElement, 
  format: 'png' | 'svg' | 'pdf', 
  filename: string
): Promise<void> => {
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
        throw new Error(`지원하지 않는 형식: ${format}`);
    }
  } catch (error) {
    console.error('차트 다운로드 실패:', error);
    throw error;
  }
};

// PNG 다운로드
export const downloadAsPNG = async (chartContainer: HTMLElement, filename: string): Promise<void> => {
  try {
    // html2canvas 라이브러리 사용
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(chartContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true
    });
    
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('PNG 다운로드 실패:', error);
    throw error;
  }
};

// SVG 다운로드
export const downloadAsSVG = async (chartContainer: HTMLElement, filename: string): Promise<void> => {
  try {
    // Plotly의 toImage 사용 시도
    const plotlyElement = chartContainer.querySelector('.plotly-graph-div');
    if (plotlyElement && (window as any).Plotly) {
      await (window as any).Plotly.toImage(plotlyElement, {
        format: 'svg',
        width: plotlyElement.clientWidth,
        height: plotlyElement.clientHeight
      });
    } else {
      // SVG 요소 직접 추출
      const svgElement = chartContainer.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.svg`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        throw new Error('SVG 요소를 찾을 수 없습니다.');
      }
    }
  } catch (error) {
    console.error('SVG 다운로드 실패:', error);
    throw error;
  }
};

// PDF 다운로드 (jspdf 제거로 인해 비활성화)
export const downloadAsPDF = async (chartContainer: HTMLElement, filename: string): Promise<void> => {
  try {
    // jspdf가 제거되어 PDF 다운로드 기능이 비활성화되었습니다.
    // PNG 또는 SVG 다운로드를 사용해주세요.
    console.warn('PDF 다운로드 기능이 비활성화되었습니다. PNG 또는 SVG 다운로드를 사용해주세요.');
    
    // 대안: PNG로 다운로드
    await downloadAsPNG(chartContainer, filename);
  } catch (error) {
    console.error('PDF 다운로드 실패 (기능 비활성화):', error);
    throw new Error('PDF 다운로드 기능이 비활성화되었습니다. PNG 또는 SVG 다운로드를 사용해주세요.');
  }
};

// 데이터를 CSV로 다운로드
export const downloadDataAsCSV = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    alert('다운로드할 데이터가 없습니다.');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const csvContent = generateCSV(data, headers);
  downloadCSV(csvContent, filename);
};

// 설정을 JSON으로 다운로드
export const downloadConfigAsJSON = (config: any, filename: string): void => {
  try {
    const jsonContent = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('JSON 다운로드 실패:', error);
    alert('설정 다운로드에 실패했습니다.');
  }
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
