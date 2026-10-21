import { ChartType } from '@/types';

// 샘플 데이터 관리 유틸리티
export class SampleDataManager {
  
  // CSV 형식의 샘플 데이터 반환 (DataInputCard용)
  static async getSampleDataContent(chartType: ChartType): Promise<string> {
    try {
      // 차트 타입별 CSV 파일명 매핑
      const fileMapping: Record<ChartType, string> = {
        line: 'line_chart.csv',
        area: 'area_chart.csv',
        bar: 'bar_chart.csv',
        stackedBar: 'stacked_bar_chart.csv',
        pie: 'pie_chart.csv',
        donut: 'donut_chart.csv',
        sunburst: 'sunburst_chart.csv',
        treemap: 'treemap_chart.csv',
        scatter: 'scatter_chart.csv',
        bubble: 'bubble_chart.csv',
        histogram: 'histogram_chart.csv',
        boxplot: 'boxplot_chart.csv',
        radar: 'radar_chart.csv',
        timeline: 'timeline_chart.csv',
        gauge: 'gauge_chart.csv',
        wordcloud: 'wordcloud_chart.csv',
        heatmap: 'heatmap_chart.csv',
        waterfall: 'waterfall_chart.csv',
        combo: 'combo_chart.csv',
        panel: 'panel_chart.csv',
        map: 'map.csv'
      };

      const fileName = fileMapping[chartType];
      if (!fileName) {
        throw new Error(`Unknown chart type: ${chartType}`);
      }

      // CSV 파일을 fetch로 읽기
      const response = await fetch(`/sample_data/${fileName}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: ${response.statusText}`);
      }

      const csvContent = await response.text();
      
      // 디버깅을 위한 로그
      console.log(`Successfully loaded ${fileName}:`, csvContent.substring(0, 200) + '...');
      
      return csvContent;
    } catch (error) {
      console.error(`Error loading sample data for ${chartType}:`, error);
      // 에러 발생 시 기본 데이터 반환
      return this.getFallbackData(chartType);
    }
  }

  // 폴백 데이터 (에러 발생 시 사용)
  private static getFallbackData(chartType: ChartType): string {
    const fallbackData: Record<ChartType, string> = {
      line: '월,값\n1월,100\n2월,150\n3월,200',
      area: '월,값\n1월,100\n2월,150\n3월,200',
      bar: '카테고리,값\nA,100\nB,150\nC,200',
      stackedBar: '월,시리즈1,시리즈2\n1월,100,50\n2월,150,75\n3월,200,100',
      pie: '항목,값\nA,30\nB,25\nC,45',
      donut: '항목,값\nA,30\nB,25\nC,45',
      sunburst: '레벨1,레벨2,값\nA,A1,20\nA,A2,30\nB,B1,25',
      treemap: '항목,값\nA,100\nB,150\nC,200',
      scatter: 'X,Y\n10,20\n15,25\n20,30',
      bubble: 'X,Y,크기\n10,20,5\n15,25,8\n20,30,12',
      histogram: '값\n10\n15\n20\n25\n30',
      boxplot: '그룹,값\nA,10\nA,15\nA,20\nB,25\nB,30',
      radar: '지표,값\nA,80\nB,70\nC,90',
      timeline: '작업,시작,종료\n작업1,2024-01-01,2024-01-02\n작업2,2024-01-02,2024-01-03',
      gauge: '지표,값\n성과,75',
      wordcloud: '단어,빈도\n안녕,10\n반갑,8\n좋아,12',
      heatmap: '행,열,값\nA,1,10\nA,2,15\nB,1,20',
      waterfall: '항목,값\n시작,100\n변화,50\n최종,150',
      combo: '월,값1,값2\n1월,100,80\n2월,150,90\n3월,200,100',
      panel: '그룹,월,값\nA,1월,100\nA,2월,150\nB,1월,120',
      map: '위치,설명\n서울,수도\n부산,항구도시'
    };

    return fallbackData[chartType] || '데이터,값\n샘플,100';
  }

  // 차트 유형별 샘플 데이터 설명
  static getSampleDataDescription(chartType: ChartType): string {
    const descriptions: Record<ChartType, string> = {
      line: '시계열 데이터로 선형 그래프를 그리는 샘플 데이터입니다.',
      area: '여러 시리즈의 누적 효과를 영역 차트로 표현하는 샘플 데이터입니다.',
      bar: '카테고리별 수치를 막대 그래프로 표현하는 샘플 데이터입니다.',
      stackedBar: '여러 시리즈를 누적하여 표시하는 샘플 데이터입니다.',
      pie: '전체 대비 비율을 원형 차트로 표현하는 샘플 데이터입니다.',
      donut: '전체 대비 비율을 도넛 차트로 표현하는 샘플 데이터입니다.',
      sunburst: '계층적 데이터를 동심원 형태로 표현하는 샘플 데이터입니다.',
      treemap: '계층적 데이터를 사각형 영역으로 표현하는 샘플 데이터입니다.',
      scatter: '두 변수 간의 관계를 점으로 표현하는 샘플 데이터입니다.',
      bubble: '세 변수를 x, y 좌표와 버블 크기로 표현하는 샘플 데이터입니다.',
      histogram: '데이터의 분포를 구간별로 표현하는 샘플 데이터입니다.',
      boxplot: '데이터의 분포를 사분위수와 이상치로 표현하는 샘플 데이터입니다.',
      radar: '여러 차원의 데이터를 방사형으로 표현하는 샘플 데이터입니다.',
      timeline: '시간 순서대로 작업을 표현하는 샘플 데이터입니다.',
      gauge: '목표 대비 현재 값을 게이지로 표현하는 샘플 데이터입니다.',
      wordcloud: '텍스트의 빈도를 단어 크기로 표현하는 샘플 데이터입니다.',
      heatmap: '두 차원의 데이터를 색상 강도로 표현하는 샘플 데이터입니다.',
      waterfall: '누적 효과를 단계별로 표현하는 샘플 데이터입니다.',
      combo: '여러 차트 유형을 조합한 샘플 데이터입니다.',
      panel: '여러 차트를 패널로 구성하는 샘플 데이터입니다.',
      map: '지리적 데이터를 지도에 표시하는 샘플 데이터입니다.'
    };
    return descriptions[chartType] || '샘플 데이터입니다.';
  }
}
