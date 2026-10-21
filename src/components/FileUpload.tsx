import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import StarLoader from './StarLoader';
import { ChartType } from '@/types';
import { parseExcel } from '@/utils/dataParser';
import { SampleDataManager } from '@/utils/sampleDataManager';
import { useFileUploadTracking, useTracking } from '../hooks/useTracking';


interface FileUploadProps {
  onDataSubmit: (data: any[]) => void;
  selectedChartType: ChartType;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataSubmit, selectedChartType }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 트래킹 훅 사용
  const { trackUpload } = useFileUploadTracking();
  const { trackDataInputType } = useTracking();

  // CSV 파싱 함수
  const parseCSV = (text: string): any[] => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        // 숫자로 변환 가능한 경우 숫자로, 아니면 문자열로
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      return row;
    });
    return data;
  };

  // 파일 처리 함수
  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      let data: any[];
      
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const text = await file.text();
        data = parseCSV(text);
      } else if (file.type.includes('spreadsheet') || file.name.match(/\.xlsx$/)) {
        data = await parseExcel(file);
      } else {
        throw new Error('지원하지 않는 파일 형식입니다. CSV 또는 Excel 파일을 업로드해주세요.');
      }

      if (data.length === 0) {
        throw new Error('파일에 데이터가 없습니다.');
      }

      // 파일 업로드 트래킹
      trackUpload(file, data, true);

      // 데이터 입력 유형 추적 (커스텀 파일 업로드)
      trackDataInputType('upload', file.name, data.length, Object.keys(data[0] || {}).length);

      setUploadedFile(file);
      onDataSubmit(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 처리 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      // 오류 트래킹
      if (file) {
        trackUpload(file, [], false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // SampleDataManager를 사용하여 샘플 데이터 로드

  // 샘플 데이터 입력 처리
  const handleSampleDataInput = useCallback(async () => {
    if (!selectedChartType) {
      setError('차트 유형을 먼저 선택해주세요.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // SampleDataManager에서 샘플 데이터 로드
      const sampleData = await SampleDataManager.getSampleDataContent(selectedChartType);
      
      // CSV 데이터 파싱
      const parsedData = parseCSV(sampleData);
      
      // 파일 정보 설정
      const sampleFile = new File([sampleData], `${selectedChartType}_sample_data.csv`, {
        type: 'text/csv',
      });
      setUploadedFile(sampleFile);

      // 샘플 데이터 업로드 트래킹
      trackUpload(sampleFile, parsedData, true);

      // 데이터 입력 유형 추적 (샘플 데이터)
      trackDataInputType('sample', sampleFile.name, parsedData.length, Object.keys(parsedData[0] || {}).length);

      // 데이터 전달
      onDataSubmit(parsedData);
      
    } catch (error) {
      setError('샘플 데이터 처리 중 오류가 발생했습니다.');
      console.error('Sample data processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedChartType, onDataSubmit]);

  // 드래그앤드롭 이벤트 핸들러
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">데이터 업로드</h3>
      
      {/* 파일 선택 및 샘플 데이터 입력 버튼 */}
      <div className="flex gap-3 mb-4">
        <label className="flex-1">
          <input
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-center">
            <FileText className="w-4 h-4 inline mr-2" />
            파일 선택
          </div>
        </label>
        
        <button
          onClick={handleSampleDataInput}
          disabled={!selectedChartType || isProcessing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isProcessing ? (
            <StarLoader size={16} speed={1.0} gap={6} />
          ) : (
            <FileText className="w-4 h-4 mr-2" />
          )}
          샘플 데이터 입력
        </button>
      </div>

      {/* 드래그앤드롭 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium text-gray-700 mb-2">
          파일을 여기에 드래그앤드롭하세요
        </p>
        <p className="text-sm text-gray-500">
          CSV, Excel 파일을 지원합니다
        </p>
      </div>

      {/* 업로드된 파일 정보 */}
      {uploadedFile && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">
                {uploadedFile.name}
              </span>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-green-600 hover:text-green-800"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* 처리 상태 */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
          <StarLoader size={20} speed={1.0} gap={8} />
          <span className="text-blue-800">데이터를 처리하고 있습니다...</span>
        </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 