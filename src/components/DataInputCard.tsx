import React, { useState, useEffect } from 'react';
import { ChartType } from '@/types';
import { SampleDataManager } from '@/utils/sampleDataManager';
import { useTracking } from '../hooks/useTracking';

interface DataInputCardProps {
  selectedChartType: ChartType;
  onDataSubmit: (data: any[]) => void;
}

const DataInputCard: React.FC<DataInputCardProps> = ({ selectedChartType, onDataSubmit }) => {
  const [inputData, setInputData] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { trackDataInputType } = useTracking();

  // 샘플 데이터 자동 입력 함수
  const loadSampleData = async () => {
    try {
      const sampleData = await SampleDataManager.getSampleDataContent(selectedChartType);
      setInputData(sampleData);
    } catch (error) {
      console.error('샘플 데이터 로드 실패:', error);
      setInputData('');
    }
  };

  // 차트 타입이 변경될 때마다 샘플 데이터 자동 로드
  useEffect(() => {
    if (selectedChartType) {
      loadSampleData();
    }
  }, [selectedChartType]);


  // CSV 파싱 함수
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(value => value.trim());
      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      return row;
    });
    return data;
  };

  // 시각화 버튼 클릭 처리
  const handleVisualize = () => {
    setIsProcessing(true);
    
    try {
      if (inputData.trim()) {
        const parsedData = parseCSV(inputData);
        
        // 데이터 입력 유형 추적 (직접 입력)
        trackDataInputType('manual', 'manual_input.csv', parsedData.length, Object.keys(parsedData[0] || {}).length);
        
        onDataSubmit(parsedData);
      } else {
        alert('데이터를 입력해주세요.');
      }
    } catch (error) {
      alert('데이터 형식이 올바르지 않습니다. CSV 형식을 확인해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">데이터 직접 입력</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV 형식으로 데이터를 입력하세요:
        </label>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          className="w-full h-64 p-3 border rounded-lg font-mono text-sm resize-none"
          placeholder="CSV 형식으로 데이터를 입력하세요..."
        />
        <div className="mt-2 text-sm text-gray-500">
          💡 첫 번째 행은 헤더, 그 다음부터 데이터를 입력하세요. 샘플 데이터가 기본 값으로 기입되어 있습니다.
        </div>
      </div>

      {/* 데이터 작성 요령 */}
      {selectedChartType === 'line' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            📋 선형 그래프 데이터 작성 요령
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>X축 기준값 (월, 날짜, 순서 등 시간 또는 카테고리)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>범례로 분류할 데이터 (부서명, 항목명 등 그룹 이름)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>Y축 수치값 (개수, 금액, 비율, 점수 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <div className="text-xs text-blue-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-blue-700">
                월,부서,값<br/>
                1월,감사담당관,1022<br/>
                2월,감사담당관,1144<br/>
                1월,문화관광과,1195<br/>
                2월,문화관광과,1240
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(월) → X축에 표시
              <br/>• 2열(부서) → 범례로 분류하여 각각 선으로 표시
              <br/>• 3열(값) → Y축 수치로 각 선의 높이 결정
              <br/>• 결과: 월별로 각 부서의 민원건수 변화를 선으로 연결하여 표시
            </div>
          </div>
        </div>
      )}
      
      {selectedChartType === 'area' && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="text-sm font-semibold text-purple-800 mb-3 flex items-center gap-2">
            📈 누적 영역 그래프 데이터 작성 요령
          </h4>
          <div className="text-sm text-purple-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>X축 기준값 (예: 월, 날짜, 순서 등 시간 또는 카테고리)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>범례로 분류할 데이터 (예: 분야명, 항목명 등 그룹 이름)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>Y축 수치값 (예: 개수, 금액, 비율, 점수 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-purple-100">
              <div className="text-xs text-purple-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-purple-700">
                월,분야,값<br/>
                1월,일반행정,419<br/>
                2월,일반행정,458<br/>
                1월,사회복지,516<br/>
                2월,사회복지,622
              </div>
            </div>
            <div className="mt-2 text-xs text-purple-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(월) → X축에 표시
              <br/>• 2열(분야) → 범례로 분류하여 각각 영역으로 표시
              <br/>• 3열(값) → Y축 수치로 각 영역의 높이 결정
              <br/>• 결과: 월별로 각 분야의 민원건수를 누적하여 영역으로 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'bar' && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
            📊 막대 그래프 데이터 작성 요령
          </h4>
          <div className="text-sm text-green-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>X축 카테고리 (항목명, 그룹명, 분류 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>Y축 수치값 (개수, 금액, 비율, 점수 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-green-100">
              <div className="text-xs text-green-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-green-700">
                권역,성별,인구수<br/>
                서초권역,남성,13200<br/>
                서초권역,여성,11800<br/>
                반포권역,남성,13800<br/>
                반포권역,여성,12400
              </div>
            </div>
            <div className="mt-2 text-xs text-green-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(권역) → X축에 표시
              <br/>• 2열(성별) → 범례로 분류하여 각각 막대로 표시
              <br/>• 3열(인구수) → Y축 수치로 각 막대의 높이 결정
              <br/>• 결과: 각 권역별로 성별 인구수를 나란히 막대로 표시
            </div>
          </div>
        </div>
      )}


      {selectedChartType === 'stackedBar' && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
            📊 누적 막대 그래프 데이터 작성 요령
          </h4>
          <div className="text-sm text-orange-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>X축 기준값 (시간, 순서, 카테고리 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>범례로 분류되는 데이터 (시리즈명, 그룹명 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>Y축 수치값 (개수, 금액, 비율, 점수 등)</span>
            </div>

            <div className="mt-3 p-3 bg-white rounded border border-orange-100">
              <div className="text-xs text-orange-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-orange-700">
                월,유형,값<br/>
                1월,생활쓰레기,661<br/>
                2월,생활쓰레기,817<br/>
                1월,재활용,635<br/>
                2월,재활용,808
              </div>
            </div>
            <div className="mt-2 text-xs text-orange-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(월) → X축에 표시
              <br/>• 2열(유형) → 범례로 분류하여 각각 누적 막대로 표시
              <br/>• 3열(값) → Y축 수치로 누적한 합계값으로 각 막대의 높이 결정
              <br/>• 결과: 월별로 각 쓰레기 유형을 누적하여 막대로 표시(100% 누적 막대는 각 유형별 값의 비율을 표시)
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'pie' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
            🥧 원형 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-red-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>항목명 (카테고리, 분류, 그룹 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>수치값 (개수, 금액, 비율, 점수 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-red-100">
              <div className="text-xs text-red-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-red-700">
                항목,값<br/>
                일반행정,20<br/>
                사회복지,24<br/>
                보건,12<br/>
                환경,10
              </div>
            </div>
            <div className="mt-2 text-xs text-red-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(항목) → 원형 차트의 각 조각으로 표시
              <br/>• 2열(값) → 각 조각의 크기(비율) 결정
              <br/>• 결과: 전체 대비 각 항목의 비중을 원형 조각으로 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'donut' && (
        <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
          <h4 className="text-sm font-semibold text-pink-800 mb-3 flex items-center gap-2">
            🍩 도넛 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-pink-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>항목명 (카테고리, 분류, 그룹 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>수치값 (개수, 금액, 비율, 점수 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-pink-100">
              <div className="text-xs text-pink-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-pink-700">
                채널,비중<br/>
                전화,28<br/>
                방문,18<br/>
                모바일앱,22<br/>
                웹,20<br/>
                우편,6<br/>
                SNS,6
              </div>
            </div>
            <div className="mt-2 text-xs text-pink-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(채널) → 도넛 차트의 각 조각으로 표시
              <br/>• 2열(비중) → 각 조각의 크기(비율) 결정
              <br/>• 중앙 공간에 전체 합계나 추가 정보 표시 가능
              <br/>• 결과: 전체 대비 각 채널의 비중을 도넛 형태로 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'sunburst' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            ☀️ 선버스트 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>1단계 분류 (대분류)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>2단계 분류 (중분류)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>3단계 분류 (소분류) - 선택사항</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">4열:</span>
              <span>수치값 (개수, 금액, 비율 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-yellow-100">
              <div className="text-xs text-yellow-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-yellow-700">
                국,과,세부,값<br/>
                문화행정국,문화관광과,세부1,120<br/>
                문화행정국,문화관광과,세부2,80<br/>
                문화행정국,체육진흥과,세부1,90<br/>
                기획재정국,기획예산과,세부1,140
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(국) → 중심 원형의 첫 번째 레이어
              <br/>• 2열(과) → 두 번째 레이어의 원형 조각
              <br/>• 3열(세부) → 세 번째 레이어의 세부 조각
              <br/>• 4열(값) → 각 조각의 크기 결정
              <br/>• 결과: 계층적 구조를 원형 레이어로 표현하여 전체 대비 각 단계별 비중을 시각화
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'treemap' && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
            🌳 트리맵 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-indigo-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>분류 항목 (카테고리, 분야, 그룹 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>수치값 (개수, 금액, 비율 등)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-indigo-100">
              <div className="text-xs text-indigo-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-indigo-700">
                분야,값<br/>
                복지,242<br/>
                보건,58<br/>
                환경,133<br/>
                교통,117<br/>
                문화,271
              </div>
            </div>
            <div className="mt-2 text-xs text-indigo-700">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(분야) → 각 분야별로 별도 사각형 생성
              <br/>• 2열(값) → 사각형의 크기 결정
              <br/>• 결과: 각 분야의 비중을 사각형 크기로 직관적 비교
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'scatter' && (
        <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
          <h4 className="text-sm font-semibold text-teal-800 mb-3 flex items-center gap-2">
            🔵 산점도 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-teal-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>범례 분류 (예: 동, 지역 등 카테고리)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>X축 값 (수치형 데이터)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>Y축 값 (수치형 데이터)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-teal-100">
              <div className="text-xs text-teal-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-teal-700">
                동,인구밀도,통근시간(분)<br/>
                서초동1,17986,67<br/>
                서초동2,15446,68<br/>
                서초동3,18590,58<br/>
                서초동4,22092,59
              </div>
            </div>
            <div className="mt-2 text-xs text-teal-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(동) → 범례로 분류하여 색상으로 구분
              <br/>• 2열(인구밀도) → X축 수치로 표시
              <br/>• 3열(통근시간) → Y축 수치로 표시
              <br/>• 결과: 각 동별 인구밀도와 통근시간 간의 관계를 점으로 시각화
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'bubble' && (
        <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
          <h4 className="text-sm font-semibold text-cyan-800 mb-3 flex items-center gap-2">
            💭 버블 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-cyan-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>범례 분류 (카테고리, 그룹명)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>X축 값 (수치형 데이터)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>Y축 값 (수치형 데이터)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">4열:</span>
              <span>버블 크기 (수치형 데이터)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-cyan-100">
              <div className="text-xs text-cyan-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-cyan-700">
                행정동,PM2.5,응급내원율,인구<br/>
                서초1동,70,10,12943<br/>
                서초2동,58,20,55541<br/>
                서초3동,70,21,38309<br/>
                서초4동,52,5,58986
              </div>
            </div>
            <div className="mt-2 text-xs text-cyan-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(행정동) → 범례로 분류하여 색상으로 구분
              <br/>• 2열(PM2.5) → X축 수치로 표시
              <br/>• 3열(응급내원율) → Y축 수치로 표시
              <br/>• 4열(인구) → 버블 크기로 표시
              <br/>• 결과: 각 행정동별로 PM2.5, 응급내원율, 인구를 3차원으로 시각화
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'histogram' && (
        <div className="mb-6 p-4 bg-lime-50 border border-lime-200 rounded-lg">
          <h4 className="text-sm font-semibold text-lime-800 mb-3 flex items-center gap-2">
            📊 히스토그램 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-lime-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>수치값 (개별 데이터 포인트)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-lime-100">
              <div className="text-xs text-lime-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-lime-700">
                값<br/>
                97<br/>
                49<br/>
                64<br/>
                133<br/>
                87
              </div>
            </div>
            <div className="mt-2 text-xs text-lime-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(값) → 개별 데이터 포인트
              <br/>• 자동으로 구간별 빈도를 계산
              <br/>• 결과: 데이터의 분포와 빈도를 막대로 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'boxplot' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
            📦 박스플롯 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-amber-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>범례 분류 (카테고리, 그룹명)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>수치값 (개별 데이터 포인트)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-amber-100">
              <div className="text-xs text-amber-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-amber-700">
                부서군,점수<br/>
                A부서,33.2<br/>
                A부서,45.32<br/>
                A부서,43.35<br/>
                B부서,40.85<br/>
                B부서,74.72
              </div>
            </div>
            <div className="mt-2 text-xs text-amber-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(부서군) → 범례로 분류하여 각각 박스로 표시
              <br/>• 2열(점수) → 각 부서군별 수치값
              <br/>• 자동으로 사분위수, 중앙값, 이상치 계산
              <br/>• 결과: 각 부서군별 점수 분포를 박스플롯으로 비교
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'radar' && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <h4 className="text-sm font-semibold text-emerald-800 mb-3 flex items-center gap-2">
            🎯 레이더 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-emerald-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>평가 항목 (기준, 지표, 영역 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>첫 번째 대상 (범례1)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>두 번째 대상 (범례2) - 선택사항</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-emerald-100">
              <div className="text-xs text-emerald-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-emerald-700">
                이름,김철수,이영희,박민수,최지영<br/>
                민원처리능력,3.5,2.8,1.4,4.8<br/>
                의사소통,2.8,5,4.2,3.8<br/>
                법규지식,4.8,4.5,4.7,4.8<br/>
                고객서비스,5,3.3,4.4,4.2
              </div>
            </div>
            <div className="mt-2 text-xs text-emerald-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(이름) → 각 평가 항목별로 별도 축 생성
              <br/>• 2-5열(개인별 점수) → 각 대상별로 별도 선으로 표시
              <br/>• 결과: 여러 평가 항목을 동시에 비교하여 각 대상의 강점과 약점을 다각형으로 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'timeline' && (
        <div className="mb-6 p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <h4 className="text-sm font-semibold text-violet-800 mb-3 flex items-center gap-2">
            ⏰ 타임라인(공정표) 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-violet-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>작업명 (태스크, 단계, 활동 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>시작일 (YYYY-MM-DD 형식)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>종료일 (YYYY-MM-DD 형식)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">4열:</span>
              <span>진행률 (0-100%) - 선택사항</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-violet-100">
              <div className="text-xs text-violet-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-violet-700">
                작업명,시작일,종료일,진행률<br/>
                민원접수,2024-01-01,2024-01-01,100<br/>
                민원검토,2024-01-02,2024-01-03,80<br/>
                민원처리,2024-01-04,2024-01-05,60
              </div>
            </div>
            <div className="mt-2 text-xs text-violet-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(작업명) → X축에 표시
              <br/>• 2열(시작일) → 시작 시점 결정
              <br/>• 3열(종료일) → 종료 시점 결정
              <br/>• 4열(진행률) → 진행 상황 표시
              <br/>• 결과: 각 작업의 일정과 진행 상황을 가로 막대로 시각화(최대 12개월만 표현)
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'gauge' && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
          <h4 className="text-sm font-semibold text-rose-800 mb-3 flex items-center gap-2">
            🎯 게이지 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-rose-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>지표명 (측정 항목, 목표 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>현재값 (수치)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-rose-100">
              <div className="text-xs text-rose-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-rose-700">
                지표,값<br/>
                처리기한 준수율,75<br/>
                고객만족도,82<br/>
                목표달성률,91<br/>
                업무효율성,68
              </div>
            </div>
            <div className="mt-2 text-xs text-rose-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(지표) → 각 지표별로 별도 게이지 생성
              <br/>• 2열(값) → 0-100 범위의 수치로 게이지 채움 정도 결정
              <br/>• 결과: 각 지표의 현재 상태를 원형 게이지로 직관적 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'wordcloud' && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
            ☁️ 워드클라우드 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-slate-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>단어/키워드</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>빈도/중요도 (수치)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-slate-100">
              <div className="text-xs text-slate-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-slate-700">
                단어,가중치<br/>
                서초구,157<br/>
                서초구청,277<br/>
                서초1동,172<br/>
                서초2동,200
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(단어) → 워드클라우드에 표시할 텍스트
              <br/>• 2열(가중치) → 단어의 크기 결정
              <br/>• 결과: 가중치가 높을수록 큰 글씨로 표시
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'heatmap' && (
        <div className="mb-6 p-4 bg-fuchsia-50 border border-fuchsia-200 rounded-lg">
          <h4 className="text-sm font-semibold text-fuchsia-800 mb-3 flex items-center gap-2">
            🔥 히트맵 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-fuchsia-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>Y축 카테고리 (행 분류)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>X축 카테고리 (열 분류)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>수치값 (색상 강도)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-fuchsia-100">
              <div className="text-xs text-fuchsia-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-fuchsia-700">
                요일,시간,값<br/>
                월,0:00,61<br/>
                월,1:00,65<br/>
                화,0:00,44<br/>
                화,1:00,56
              </div>
            </div>
            <div className="mt-2 text-xs text-fuchsia-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(요일) → Y축에 표시
              <br/>• 2열(시간) → X축에 표시
              <br/>• 3열(값) → 색상 강도로 표시
              <br/>• 결과: 요일과 시간의 교차점에 해당하는 값을 색상으로 표현
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'waterfall' && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-lg">
          <h4 className="text-sm font-semibold text-sky-800 mb-3 flex items-center gap-2">
            🌊 워터폴 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-sky-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>항목명 (단계, 구분, 카테고리)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>수치값 (증감, 변화량)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-sky-100">
              <div className="text-xs text-sky-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-sky-700">
                항목,변화<br/>
                전년도 이월,0<br/>
                지방교부세,380<br/>
                국고보조,240<br/>
                세외수입,70<br/>
                인건비,-320<br/>
                복지지출,-340
              </div>
            </div>
            <div className="mt-2 text-xs text-sky-700">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(항목) → X축에 표시
              <br/>• 2열(변화) → 각 항목의 증감을 막대로 표시 (양수/음수 구분)
              <br/>• 자동으로 누적 계산하여 전체 흐름 표시
              <br/>• 결과: 예산 항목별 증감을 누적하여 전체 재정 흐름을 시각화
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'combo' && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h4 className="text-sm font-semibold text-orange-800 mb-3 flex items-center gap-2">
            🔀 콤보 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-orange-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>X축 기준값 (시간, 카테고리, 순서 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>막대 그래프 데이터</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>선형 그래프 데이터</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">4열:</span>
              <span>추가 시리즈 - 선택사항</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-orange-100">
              <div className="text-xs text-orange-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-orange-700">
                월,민원건수,집행률(%)<br/>
                1월,3082,70<br/>
                2월,3250,76<br/>
                3월,3304,78<br/>
                4월,3525,80
              </div>
            </div>
            <div className="mt-2 text-xs text-orange-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(월) → X축에 표시
              <br/>• 2열(민원건수) → 막대 그래프로 표시 (절대값)
              <br/>• 3열(집행률) → 선 그래프로 표시 (비율)
              <br/>• 결과: 월별 민원건수(막대)와 집행률(선)을 동시에 비교 분석
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'panel' && (
        <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-lg">
          <h4 className="text-sm font-semibold text-stone-800 mb-3 flex items-center gap-2">
            📋 파넬 차트 데이터 작성 요령
          </h4>
          <div className="text-sm text-stone-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>X축 기준값 (시간, 순서, 카테고리 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>패널 구분 (그룹, 분류, 영역)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>Y축 값 (수치)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-stone-100">
              <div className="text-xs text-stone-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-stone-700">
                월,권역,값<br/>
                1월,서초권역,1025<br/>
                2월,서초권역,1063<br/>
                1월,반포권역,1212<br/>
                2월,반포권역,1221
              </div>
            </div>
            <div className="mt-2 text-xs text-stone-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(월) → X축에 표시
              <br/>• 2열(권역) → 각 권역별로 별도 패널 생성
              <br/>• 3열(값) → Y축 수치로 각 패널의 막대 높이 결정
              <br/>• 결과: 각 권역별로 월별 민원건수를 독립적인 패널로 비교 분석
            </div>
          </div>
        </div>
      )}

      {selectedChartType === 'map' && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
            🗺️ 지도 시각화 데이터 작성 요령
          </h4>
          <div className="text-sm text-blue-700 space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">1열:</span>
              <span>주소 (행정구역, 지번, 도로명 등)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">2열:</span>
              <span>서비스명 (기관 또는 위치 이름)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">3열:</span>
              <span>설명 (툴팁에 표시될 내용)</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[60px]">4열:</span>
              <span>카테고리 (마커 색상 또는 아이콘 구분)</span>
            </div>
            <div className="mt-3 p-3 bg-white rounded border border-blue-100">
              <div className="text-xs text-blue-600 font-medium mb-2">📊 샘플 데이터 구조:</div>
              <div className="font-mono text-xs text-blue-700">
                주소,서비스명,설명,카테고리,우선순위,상태<br/>
                서울특별시 서초구 남부순환로 2584,서초구청,서초구 행정 서비스 제공,구청,높음,운영중<br/>
                서울특별시 서초구 사임당로 89,서초1동 주민센터,서초1동 주민 서비스,동 주민센터,높음,운영중
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600">
              💡 <strong>데이터 변환 과정:</strong> 
              <br/>• 1열(주소) → 지도상 위치로 자동 변환되어 마커 생성
              <br/>• 2열(서비스명) → 마커에 표시할 이름
              <br/>• 3열(설명) → 툴팁에 표시할 상세 정보
              <br/>• 4열(카테고리) → 마커 색상 또는 아이콘 구분 기준
              <br/>• 결과: 각 주소에 해당하는 행정 서비스 정보를 지도 위에 시각화
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          📊 데이터 폼에 값 입력을 완료하고 시각화 버튼을 누르면 시각화가 진행됩니다.
        </div>
        <button
          onClick={handleVisualize}
          disabled={isProcessing}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? '처리 중...' : '시각화'}
        </button>
      </div>
    </div>
  );
};

export default DataInputCard; 