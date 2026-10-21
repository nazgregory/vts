import React, { useEffect, useRef } from 'react';
import { ChartData, ChartCustomization } from '@/types';

declare global {
  interface Window {
    Plotly: any;
  }
}

interface TimelineChartProps {
  data: ChartData[];
  customization: ChartCustomization;
  width?: number;
  height?: number;
}

interface TimelineTask {
  name: string;
  lane: string;
  start: string;
  end: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  customization,
  width = 800,
  height = 530
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const timelineData = prepareTimelineData(data);
    const lanes = Array.from(new Set(timelineData.map(d => d.lane)));
    
         // 공통 색상 팔레트 적용
     const getCommonPalette = () => {
       const paletteName = customization.common?.colors?.palette;
       const customColors = customization.common?.colors?.customColors;
       
       switch (paletteName) {
         case 'brand':
           return ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'];
         case 'rainbow':
           return ['#FF6B6B', '#FF8E53', '#FFD93D', '#6BCF7F', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
         case 'reference18':
           return ['#FF6B6B', '#4169E1', '#4ECDC4', '#9932CC', '#FFA500', '#FFD700', '#FF69B4', '#20B2AA', '#9370DB', '#32CD32'];
         case 'custom':
           return customColors && customColors.length > 0 ? customColors : ['#FF6B6B', '#4169E1', '#4ECDC4', '#9932CC', '#FFA500'];
         default:
           return ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6366F1'];
       }
     };
     
     const commonPalette = getCommonPalette();
     const laneColor: Record<string, string> = {};
     lanes.forEach((lane, i) => laneColor[lane] = commonPalette[i % commonPalette.length]);

    const durationMs = (s: string, e: string) => new Date(e).getTime() - new Date(s).getTime();

         const plotlyData = timelineData.map(task => ({
       type: 'bar' as const,
       orientation: 'h' as const,
       base: [task.start],
       x: [durationMs(task.start, task.end)],
       y: [task.lane],
       name: task.lane,
       legendgroup: task.lane,
       showlegend: false,
       marker: {
         color: laneColor[task.lane],
         opacity: customization.opacity || 0.8
       },
       hoverinfo: 'skip'
     }));

    // 데이터에서 실제 시작일과 종료일을 읽어서 월 범위 계산
    const allDates = timelineData.flatMap(task => [
      new Date(task.start),
      new Date(task.end)
    ]).filter(date => !isNaN(date.getTime()));
    
    if (allDates.length === 0) {
      console.warn('타임라인 차트: 유효한 날짜를 찾을 수 없습니다');
      return;
    }
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // 월 단위로 범위 확장 (시작월의 1일부터 종료월의 마지막일까지)
    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    
    // 전체 기간의 월 수 계산
    const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;

    // 월 헤더 색상 커스터마이징
    const monthGridColor = customization.monthGridColor || '#e2e8f0';

    const monthLines = Array.from({ length: totalMonths }).map((_, i) => {
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1).toISOString().slice(0, 10);
      return {
        type: 'line', xref: 'x', yref: 'paper',
        x0: month, x1: month, y0: 0, y1: 1,
        line: { color: monthGridColor, width: 1 }
      };
    });

    const laneLines = lanes.map((_, i) => {
      return {
        type: 'line', xref: 'paper', yref: 'y',
        x0: 0, x1: 1,
        y0: i + 0.5, y1: i + 0.5,
        line: { color: '#d1d5db', width: 1 }
      };
    });

         const headerBackground = {
       type: 'rect',
       xref: 'paper',
       yref: 'paper',
       x0: 0,
       y0: 1.01,
       x1: 1,
       y1: 1.12, // 헤더 높이를 늘려서 월 라벨 공간 확보
       fillcolor: '#1F2937', // 진한 회색/검은 계열로 변경
       line: { width: 0 },
       layer: 'below'
     };

    const shapes = [headerBackground, ...monthLines, ...laneLines];

    // 작업 라인 라벨 annotation
    const laneAnnotations = lanes.map((lane) => ({
      xref: 'paper', yref: 'y', x: 0, y: lane,
      xanchor: 'right', xshift: -8, showarrow: false,
      align: 'right',
      text: `<b>${lane}</b>`,
      font: {
        family: 'Noto Sans KR Black, Noto Sans KR, sans-serif',
        size: customization.laneLabelSize || 18,
        color: laneColor[lane]
      }
    }));
    
         // 월 라벨 annotation (동적으로 생성) - 월 칸 중앙에 배치
     const monthAnnotations = Array.from({ length: totalMonths }).map((_, i) => {
       const monthDate = new Date(start.getFullYear(), start.getMonth() + i, 1);
       const monthText = `${monthDate.getMonth() + 1}월`;
       
       // 월의 중앙 지점에 라벨 배치 (월의 15일 경)
       const monthMiddle = new Date(start.getFullYear(), start.getMonth() + i, 15);
       const monthX = monthMiddle.toISOString().slice(0, 10);
       
                                 return {
            xref: 'x', yref: 'paper', x: monthX, y: 1.065, // 헤더 높이 중앙에 위치 (1.01~1.12의 중앙)
            xanchor: 'center', yanchor: 'middle', showarrow: false, // middle 정렬로 헤더 중앙에 맞춤
            text: monthText,
            font: {
              family: 'Noto Sans KR Black, Noto Sans KR, sans-serif',
              size: customization.monthLabelSize || 16,
              color: '#FFFFFF' // 흰색 글씨로 변경
            }
          };
     });
    
    const annotations = [...laneAnnotations, ...monthAnnotations];

    // 커스터마이징된 제목 적용
    const chartTitle = customization.chartTitle || '타임라인(공정표)';
    


    const layout = {
      title: {
        text: chartTitle,
        font: {
          family: 'Noto Sans KR Black, Noto Sans KR, sans-serif',
          size: customization.titleSize || 20,
          color: customization.titleColor || '#1f2937'
        },
        x: 0.5,
        xanchor: 'center'
      },
      width,
      height,
      bargap: customization.barGap || 0.25,
      margin: { l: 150, r: 30, t: 140, b: 42 }, // 제목과 헤더가 겹치지 않도록 상단 여백 증가
      showlegend: false,
      barmode: 'stack' as const,
      plot_bgcolor: customization.plotBackgroundColor || 'white',
      paper_bgcolor: customization.paperBackgroundColor || 'white',
      // 차트 중앙 정렬을 위한 설정
      autosize: true,
      // 차트 영역을 중앙에 배치
      xaxis: {
        type: 'date' as const,
        range: [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)],
        tick0: start.toISOString().slice(0, 10),
        dtick: 'M1',
        side: 'top',
        showgrid: true,
        gridcolor: monthGridColor,
        gridwidth: 1,
        showticklabels: false, // 월 라벨은 annotation으로 표시하므로 x축 라벨 숨김
        ticks: 'outside',
        layer: 'above'
      },
      yaxis: {
        type: 'category' as const,
        categoryorder: 'array' as const,
        categoryarray: lanes,
        autorange: 'reversed' as const,
        showticklabels: false,
        ticks: '',
        showgrid: false
      },
      annotations,
      shapes
    };

    if (chartRef.current && window.Plotly) {
      window.Plotly.newPlot(chartRef.current, plotlyData, layout, {
        displayModeBar: false,
        responsive: true,
        // 차트 중앙 정렬을 위한 설정
        autosize: true,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'zoom2d']
      });
    }
  }, [data, customization, width, height]);

  const prepareTimelineData = (rawData: ChartData[]): TimelineTask[] => {
    return rawData.map((row) => {
      const keys = Object.keys(row);

      const nameKey = keys.find(k => k.includes('공정') || k.includes('작업') || k.toLowerCase().includes('name'));
      const startKey = keys.find(k => k.includes('시작') || k.toLowerCase().includes('start'));
      const endKey = keys.find(k => k.includes('종료') || k.includes('끝') || k.toLowerCase().includes('end'));

      if (!nameKey || !startKey || !endKey) {
        console.warn('필수 키를 찾을 수 없습니다:', keys);
        return null;
      }

      const name = String(row[nameKey]);
      const start = new Date(row[startKey] as string);
      const end = new Date(row[endKey] as string);

      return {
        name,
        lane: name,
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10)
      };
    }).filter((d): d is TimelineTask => d !== null);
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div ref={chartRef} className="w-full h-full flex items-center justify-center" style={{ minHeight: '100%' }} />
    </div>
  );
};

export default TimelineChart;
