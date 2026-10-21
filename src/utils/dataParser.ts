import { readSheet, type CellValue } from 'read-excel-file/browser';
import Papa from 'papaparse';
import { ChartData, FileUploadResult } from '@/types';

/**
 * CSV 텍스트를 파싱하여 JavaScript 객체 배열로 변환
 */
export const parseCSV = (csvText: string): ChartData[] => {
  try {
    if (!csvText || typeof csvText !== 'string') {
      throw new Error('유효하지 않은 CSV 텍스트입니다');
    }

    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      delimiter: '', // 자동 감지
      dynamicTyping: false, // 수동 변환 사용
      transform: (value, field) => {
        // 숫자로 변환 가능한 값은 숫자로 변환
        if (field && !isNaN(Number(value)) && value !== '') {
          return Number(value);
        }
        return value;
      }
    });

    // errors 배열이 존재하는지 확인
    if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
      const firstError = result.errors[0];
      const errorMessage = firstError.message || firstError.type || '알 수 없는 파싱 오류';
      throw new Error(`CSV 파싱 오류: ${errorMessage}`);
    }

    // data 배열이 존재하고 비어있지 않은지 확인
    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      throw new Error('CSV에서 데이터를 읽을 수 없습니다. 파일이 비어있거나 형식이 올바르지 않습니다.');
    }

    // 빈 객체나 undefined 값이 있는 행 제거
    const validData = result.data.filter(row => 
      row && typeof row === 'object' && Object.keys(row).length > 0
    );

    if (validData.length === 0) {
      throw new Error('유효한 데이터 행을 찾을 수 없습니다.');
    }

    return validData as ChartData[];
  } catch (error) {
    throw new Error(`CSV 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

/**
 * Excel 파일을 파싱하여 데이터 배열로 변환
 */
const normalizeCell = (value: CellValue | null | undefined): string | number | '' => {
  if (value == null) return '';
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10);
  }
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  const text = String(value).trim();
  if (text !== '' && !Number.isNaN(Number(text))) return Number(text);
  return text;
};

export const parseExcel = async (file: File): Promise<ChartData[]> => {
  try {
    const rows = await readSheet(file);
    if (rows.length < 2) {
      throw new Error('데이터가 충분하지 않습니다. 헤더와 최소 1개의 데이터 행이 필요합니다.');
    }

    const headers = rows[0].map((cell) => String(normalizeCell(cell) ?? '').trim());
    const chartData: ChartData[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const rowData: ChartData = {};

      headers.forEach((header, index) => {
        if (!header) return;
        const value = normalizeCell(row[index]);
        if (value !== '') {
          rowData[header] = value;
        }
      });

      if (Object.keys(rowData).length > 0) {
        chartData.push(rowData);
      }
    }

    return chartData;
  } catch (error) {
    throw new Error(`Excel 파싱 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

/**
 * 파일 유효성 검사
 */
export const validateFile = (file: File): FileUploadResult => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['.csv', '.xlsx'];
  
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `파일 크기가 너무 큽니다. 최대 ${maxSize / (1024 * 1024)}MB까지 허용됩니다.`
    };
  }

  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedTypes.includes(fileExtension)) {
    return {
      isValid: false,
      error: `지원하지 않는 파일 형식입니다. ${allowedTypes.join(', ')} 형식만 지원됩니다.`
    };
  }

  return { isValid: true };
};

/**
 * 수치형 컬럼 키들을 반환
 */
export const getNumericKeys = (data: ChartData[]): string[] => {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]).filter(key => 
    typeof data[0][key] === 'number'
  );
};

/**
 * 범주형 컬럼 키들을 반환
 */
export const getCategoricalKeys = (data: ChartData[]): string[] => {
  if (!data || data.length === 0) return [];
  return Object.keys(data[0]).filter(key => 
    typeof data[0][key] === 'string'
  );
}; 