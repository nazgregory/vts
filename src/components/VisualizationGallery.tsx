import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, ScatterChart, Activity, Target, Gauge, Cloud, Square, Layers, Box, Grid3X3, FileText, Trees, Circle, Clock, Map, Droplets, Brain, Download, Share2, Eye, Settings } from 'lucide-react';
import { ChartType } from '@/types';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  chartType: ChartType;
  category: string;
  tags: string[];
  imageUrl?: string;
  dataSource: string;
  createdAt: string;
  views: number;
  likes: number;
}

const VisualizationGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'name'>('newest');

  // 샘플 갤러리 데이터
  const galleryItems: GalleryItem[] = [
    {
      id: '1',
      title: '월별 매출 추이 분석',
      description: '2023년 월별 매출 데이터를 선형 그래프로 시각화하여 트렌드를 분석합니다.',
      chartType: 'line',
      category: 'business',
      tags: ['매출', '트렌드', '월별'],
      dataSource: '내부 매출 데이터',
      createdAt: '2024-01-15',
      views: 1250,
      likes: 89
    },
    {
      id: '2',
      title: '부서별 인력 현황',
      description: '각 부서별 인력 수를 원형 차트로 표시하여 조직 구조를 한눈에 파악할 수 있습니다.',
      chartType: 'pie',
      category: 'hr',
      tags: ['인력', '부서', '조직'],
      dataSource: '인사팀 데이터',
      createdAt: '2024-01-14',
      views: 890,
      likes: 67
    },
    {
      id: '3',
      title: '지역별 고객 분포',
      description: '전국 지역별 고객 분포를 지도 시각화로 표현하여 지역별 마케팅 전략을 수립합니다.',
      chartType: 'map',
      category: 'marketing',
      tags: ['고객', '지역', '마케팅'],
      dataSource: '고객 데이터베이스',
      createdAt: '2024-01-13',
      views: 2100,
      likes: 156
    },
    {
      id: '4',
      title: '제품 카테고리별 판매량',
      description: '제품 카테고리별 판매량을 막대 그래프로 비교 분석합니다.',
      chartType: 'bar',
      category: 'sales',
      tags: ['제품', '판매량', '카테고리'],
      dataSource: '판매 관리 시스템',
      createdAt: '2024-01-12',
      views: 1450,
      likes: 98
    },
    {
      id: '5',
      title: '고객 만족도 분석',
      description: '고객 만족도 조사 결과를 레이더 차트로 다차원 분석합니다.',
      chartType: 'radar',
      category: 'customer',
      tags: ['만족도', '고객', '분석'],
      dataSource: '고객 만족도 조사',
      createdAt: '2024-01-11',
      views: 780,
      likes: 45
    },
    {
      id: '6',
      title: '시계열 데이터 분석',
      description: '시간에 따른 데이터 변화를 히트맵으로 시각화하여 패턴을 발견합니다.',
      chartType: 'heatmap',
      category: 'analytics',
      tags: ['시계열', '패턴', '분석'],
      dataSource: '시스템 로그 데이터',
      createdAt: '2024-01-10',
      views: 1650,
      likes: 112
    }
  ];

  const categories = [
    { id: 'all', name: '전체', icon: Grid3X3 },
    { id: 'business', name: '비즈니스', icon: BarChart3 },
    { id: 'hr', name: '인사', icon: Users },
    { id: 'marketing', name: '마케팅', icon: Target },
    { id: 'sales', name: '영업', icon: TrendingUp },
    { id: 'customer', name: '고객', icon: Heart },
    { id: 'analytics', name: '분석', icon: Brain }
  ];

  const getChartTypeIcon = (chartType: ChartType) => {
    const icons = {
      line: TrendingUp,
      bar: BarChart3,
      stackedBar: BarChart3,
      pie: PieChart,
      scatter: ScatterChart,
      bubble: ScatterChart,
      area: Activity,
      donut: Circle,
      sunburst: Trees,
      treemap: Square,
      heatmap: Grid3X3,
      radar: Target,
      gauge: Gauge,
      wordcloud: Cloud,
      map: Map,
      timeline: Clock,
      waterfall: Droplets,
      combo: Layers,
      panel: Box,
      histogram: FileText,
      boxplot: FileText
    };
    return icons[chartType] || BarChart3;
  };

  const getChartTypeName = (chartType: ChartType): string => {
    const names: Record<ChartType, string> = {
      line: '선형 그래프',
      area: '누적 영역 그래프',
      bar: '막대 그래프',
      stackedBar: '누적 막대 그래프',
      pie: '원형 차트',
      donut: '도넛 차트',
      sunburst: '선버스트 차트',
      treemap: '트리맵',
      scatter: '산점도',
      bubble: '버블 차트',
      histogram: '히스토그램',
      boxplot: '박스플롯',
      radar: '레이더 차트',
      timeline: '타임라인',
      gauge: '게이지 차트',
      wordcloud: '워드클라우드',
      heatmap: '히트맵',
      waterfall: '워터폴 차트',
      combo: '콤보 차트',
      panel: '파넬 차트',
      map: '지도 시각화'
    };
    return names[chartType] || chartType;
  };

  const filteredItems = galleryItems
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'popular':
          return b.views - a.views;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h1 className="text-3xl font-bold text-gray-900">시각화 갤러리</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span>갤러리에 추가</span>
              </button>
            </div>
          </div>

          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="시각화 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'popular' | 'name')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">최신순</option>
                <option value="popular">인기순</option>
                <option value="name">이름순</option>
              </select>
            </div>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex items-center space-x-2 mt-4 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 갤러리 그리드 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const ChartIcon = getChartTypeIcon(item.chartType);
            return (
              <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* 차트 미리보기 */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <ChartIcon className="w-16 h-16 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">{getChartTypeName(item.chartType)}</p>
                  </div>
                </div>

                {/* 내용 */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {item.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.description}</p>
                  
                  {/* 태그 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>데이터: {item.dataSource}</span>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{item.views.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Heart className="w-4 h-4" />
                        <span>{item.likes}</span>
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>보기</span>
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
            <p className="text-gray-400">다른 검색어나 카테고리를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 아이콘 컴포넌트들
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const Heart = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

export default VisualizationGallery;
