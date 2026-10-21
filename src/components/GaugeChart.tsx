import React, { useEffect, useRef } from 'react';
import { ChartData, ChartCustomization } from '@/types';

// Plotly를 전역에서 가져오기
declare global {
  interface Window {
    Plotly: any;
  }
}

interface GaugeChartProps {
  data: ChartData[];
  customization: ChartCustomization;
  width?: number;
  height?: number;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  data,
  customization,
  width = 600,
  height = 500
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !window.Plotly || !data || data.length === 0) return;

    // 데이터에서 값과 이름 추출
    const numericKeys = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    
    if (numericKeys.length === 0) return;

    const value = data[0][numericKeys[0]] as number;
    
    // 🎯 게이지 차트 용도 설정 (기본값: 일반)
    const gaugePurpose = customization?.gauge?.purpose?.type || 'normal';
    
    // 🎨 색상 팔레트 설정
    const getColorPalette = () => {
      if (gaugePurpose === 'high') {
        // 고지향: 빨강 → 주황 → 초록 (값이 높을수록 좋음)
        return {
          low: '#ef4444',    // 빨강
          medium: '#f59e0b', // 주황
          high: '#10b981'    // 초록
        };
      } else if (gaugePurpose === 'low') {
        // 저지향: 초록 → 주황 → 빨강 (값이 낮을수록 좋음)
        return {
          low: '#10b981',    // 초록
          medium: '#f59e0b', // 주황
          high: '#ef4444'    // 빨강
        };
      } else {
        // 일반: 팔레트 1번 색상
        return {
          normal: '#3b82f6'  // 파란색
        };
      }
    };

    const colors = getColorPalette();
    
    // 🎨 기본 색상 설정
    const barColor = customization?.gauge?.bar?.color || '#3b82f6';
    const barThickness = customization?.gauge?.bar?.thickness || 0.8;
    
    // 🌈 배경색 설정 (RGB 240, 240, 240)
    const backgroundColor = customization?.gauge?.background?.color || '#F0F0F0';
    
    // 🎯 임계값 설정
    const lowThreshold = customization?.gauge?.thresholds?.low || 33;
    const mediumThreshold = customization?.gauge?.thresholds?.medium || 66;
    const highThreshold = customization?.gauge?.thresholds?.high || 100;
    
    // 🔢 단위 설정
    const showUnits = customization?.gauge?.units?.show || false;
    const unitText = customization?.gauge?.units?.text || '%';

    // 🎨 게이지 차트 데이터 생성
    let gaugeData: any[] = [];

    if (gaugePurpose === 'normal') {
      // 1. 일반 게이지: 회색 배경에 팔레트 1번 색상으로 게이지 채우기
      gaugeData = [{
        type: 'indicator',
        mode: 'gauge+number',
        value: value,
        gauge: {
          min: 0,
          max: 100,
          startAngle: 210,
          endAngle: -30,
          axis: { 
            range: [null, 100],
            tickwidth: 2,
            tickcolor: "#cbd5e1",
            tickmode: 'array',
            tickvals: [0, 25, 50, 75, 100],
            ticktext: [`0${showUnits ? unitText : ''}`, `25${showUnits ? unitText : ''}`, `50${showUnits ? unitText : ''}`, `75${showUnits ? unitText : ''}`, `100${showUnits ? unitText : ''}`],
            tickfont: { 
              size: 12, 
              color: '#64748b',
              family: 'system-ui, sans-serif'
            }
          },
          bar: { 
            color: barColor,
            thickness: barThickness
          },
          bgcolor: backgroundColor,
          borderwidth: 0
        }
      }];
    } else {
      // 2. 고지향/저지향: 바늘침으로 표시
      gaugeData = [{
        type: 'indicator',
        mode: 'gauge+number',
        value: value,
        gauge: {
          min: 0,
          max: 100,
          startAngle: 210,
          endAngle: -30,
          axis: { 
            range: [null, 100],
            tickwidth: 2,
            tickcolor: "#cbd5e1",
            tickmode: 'array',
            tickvals: [0, lowThreshold, mediumThreshold, highThreshold],
            ticktext: [`0${showUnits ? unitText : ''}`, `${lowThreshold}${showUnits ? unitText : ''}`, `${mediumThreshold}${showUnits ? unitText : ''}`, `${highThreshold}${showUnits ? unitText : ''}`],
            tickfont: { 
              size: 12, 
              color: '#64748b',
              family: 'system-ui, sans-serif'
            }
          },
          bar: { 
            color: 'transparent',
            thickness: 0
          },
          bgcolor: backgroundColor,
          borderwidth: 0,
          steps: [
            { range: [0, lowThreshold], color: colors.low },
            { range: [lowThreshold, mediumThreshold], color: colors.medium },
            { range: [mediumThreshold, highThreshold], color: colors.high }
          ],
          threshold: {
            line: { 
              color: '#64748b', 
              width: 4, 
              thickness: 0.8 
            },
            thickness: 0.8,
            value: value
          }
        }
      }];
    }

    // 🎨 레이아웃 설정
    const layout = {
      width: width,
      height: height,
      margin: {
        l: 60,
        r: 60,
        t: 80,
        b: 80
      },
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      font: { 
        family: 'system-ui, sans-serif' 
      },
      showlegend: false,
      // 모드바 완전 숨김
      modebar: {
        remove: true
      }
    };

    // ⚙️ 설정
    const config = {
      displayModeBar: false,
      displaylogo: false,
      responsive: true,
      showTips: false,
      showLink: false
    };

    // 🚀 차트 렌더링
    window.Plotly.newPlot(chartRef.current, gaugeData, layout, config);

  }, [data, customization, width, height]);

  return (
    <div className="gauge-chart-container flex items-center justify-center">
      <div 
        ref={chartRef}
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px'
        }}
      />
    </div>
  );
};

export default GaugeChart;
