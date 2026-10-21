import React, { memo } from 'react';
import { Download, Activity, BarChart3, TrendingUp, PieChart, ScatterChart, Gauge, Cloud, Box, Grid3X3, Trees, Circle, Clock, Map, Droplets, Target } from 'lucide-react';
import { ChartType } from '../types';

interface ChartTypeSelectorProps {
  selectedType: ChartType | '';
  onTypeSelect: (type: ChartType) => void;
  handleDownloadSampleData: (chartType: ChartType) => void;
}

const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = memo(({
  selectedType,
  onTypeSelect,
  handleDownloadSampleData
}) => {
  const chartCategories = [
    {
      title: "비교·추세 분석",
      color: "blue",
      charts: [
        { id: 'line' as ChartType, name: '선형 그래프', icon: Activity, description: '데이터·변화 추세 확인용' },
        { id: 'area' as ChartType, name: '누적 영역 그래프', icon: TrendingUp, description: '합계 추세와 구성비 동시 표현' },
        { id: 'bar' as ChartType, name: '막대 그래프', icon: BarChart3, description: '항목 간 값 비교' },
        { id: 'stackedBar' as ChartType, name: '누적 막대 그래프', icon: BarChart3, description: '시간별 누적 추세와 구성비 비교' }
      ]
    },
    {
      title: "비율·구성 분석",
      color: "purple",
      charts: [
        { id: 'pie' as ChartType, name: '원형 차트', icon: PieChart, description: '전체 대비 항목 비율' },
        { id: 'donut' as ChartType, name: '도넛 차트', icon: PieChart, description: '중앙 요약 정보가 있는 원형 차트' },
        { id: 'sunburst' as ChartType, name: '선버스트 차트', icon: PieChart, description: '다층 구조 비율 시각화' },
        { id: 'treemap' as ChartType, name: '트리맵', icon: Trees, description: '계층형 비율 시각화' }
      ]
    },
    {
      title: "분포·관계 분석",
      color: "green",
      charts: [
        { id: 'scatter' as ChartType, name: '산점도', icon: ScatterChart, description: '변수 간 상관관계' },
        { id: 'bubble' as ChartType, name: '버블 차트', icon: Circle, description: '3변수 비교(크기, 위치, 색상)' },
        { id: 'histogram' as ChartType, name: '히스토그램', icon: BarChart3, description: '데이터 분포 확인' },
        { id: 'boxplot' as ChartType, name: '박스플롯', icon: Box, description: '데이터 분포와 이상치 확인' }
      ]
    },
    {
      title: "특수 분석",
      color: "orange",
      charts: [
        { id: 'radar' as ChartType, name: '레이더 차트', icon: Target, description: '다차원 데이터 비교' },
        { id: 'timeline' as ChartType, name: '타임라인(공정표)', icon: Clock, description: '프로젝트 일정 및 공정표 관리' },
        { id: 'gauge' as ChartType, name: '게이지 차트', icon: Gauge, description: 'KPI, 목표 달성률' },
        { id: 'wordcloud' as ChartType, name: '워드클라우드', icon: Cloud, description: '텍스트 데이터 빈도 시각화' }
      ]
    },
    {
      title: "고급 분석",
      color: "red",
      charts: [
        { id: 'heatmap' as ChartType, name: '히트맵', icon: Map, description: '값의 크기를 색으로 표현' },
        { id: 'waterfall' as ChartType, name: '워터폴 차트', icon: Droplets, description: '증가·감소 요인별 변화 시각화' },
        { id: 'combo' as ChartType, name: '콤보 차트', icon: BarChart3, description: '서로 다른 유형 데이터 동시 비교' },
        { id: 'panel' as ChartType, name: '파넬 차트', icon: Grid3X3, description: '여러 차트를 그리드로 배치' }
      ]
    }
  ];

  const getColorClasses = (color: string, isHover: boolean = false) => {
    const colorMap = {
      blue: {
        title: 'text-blue-600',
        border: isHover ? 'border-blue-500' : 'border-blue-200',
        hover: 'hover:border-blue-500 hover:bg-blue-50',
        button: 'bg-blue-600 hover:bg-blue-700'
      },
      purple: {
        title: 'text-purple-600',
        border: isHover ? 'border-purple-500' : 'border-purple-200',
        hover: 'hover:border-purple-500 hover:bg-purple-50',
        button: 'bg-purple-600 hover:bg-purple-700'
      },
      green: {
        title: 'text-green-600',
        border: isHover ? 'border-green-500' : 'border-green-200',
        hover: 'hover:border-green-500 hover:bg-green-50',
        button: 'bg-green-600 hover:bg-green-700'
      },
      orange: {
        title: 'text-orange-600',
        border: isHover ? 'border-orange-500' : 'border-orange-200',
        hover: 'hover:border-orange-500 hover:bg-orange-50',
        button: 'bg-orange-600 hover:bg-orange-700'
      },
      red: {
        title: 'text-red-600',
        border: isHover ? 'border-red-500' : 'border-red-200',
        hover: 'hover:border-red-500 hover:bg-red-50',
        button: 'bg-red-600 hover:bg-red-700'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {chartCategories.map((category) => (
        <div key={category.title} className={`bg-white rounded-lg shadow-sm border-2 p-6 ${getColorClasses(category.color).border}`}>
          <h3 className={`text-lg font-semibold mb-4 ${getColorClasses(category.color).title}`}>{category.title}</h3>
          <div className="space-y-3">
            {category.charts.map((chart) => {
              const IconComponent = chart.icon;
              const colorClasses = getColorClasses(category.color);
              return (
                <div key={chart.id} className="flex items-center gap-3">
                  {/* 샘플 다운로드 버튼 - 좌측에 배치, 분류별 색상 적용 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSampleData(chart.id);
                    }}
                    className={`p-2 ${colorClasses.button} text-white rounded transition-colors flex-shrink-0`}
                    title="샘플 데이터 다운로드"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  
                  {/* 차트 카드 */}
                  <div
                    className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedType === chart.id
                        ? `${getColorClasses(category.color, true).border} ${getColorClasses(category.color).hover.replace('hover:', '')}`
                        : `${getColorClasses(category.color).border} ${getColorClasses(category.color).hover}`
                    }`}
                    onClick={() => onTypeSelect(chart.id)}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 mt-1 flex-shrink-0 ${getColorClasses(category.color).title}`} />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{chart.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{chart.description}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* 지도 위치 시각화 카드 */}
      <div className="bg-white rounded-lg shadow-sm border-2 p-6 border-indigo-200">
        <h3 className="text-lg font-semibold mb-4 text-indigo-600">지도 위치 시각화</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {/* 샘플 다운로드 버튼 - 좌측에 배치, 인디고 색상 적용 */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadSampleData('map');
              }}
              className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors flex-shrink-0"
              title="샘플 데이터 다운로드"
            >
              <Download className="w-4 h-4" />
            </button>
            
            {/* 차트 카드 */}
            <div
              className={`flex-1 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedType === 'map'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50'
              }`}
              onClick={() => onTypeSelect('map')}
            >
              <div className="flex items-start gap-3">
                <Map className="w-5 h-5 mt-1 flex-shrink-0 text-indigo-600" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">지도 시각화</div>
                  <div className="text-sm text-gray-600 mt-1">지도에 마커 서비스 제공</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChartTypeSelector.displayName = 'ChartTypeSelector';

export default ChartTypeSelector; 