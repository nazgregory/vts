import React, { useEffect, useRef } from 'react';
import cloud from 'd3-cloud';
import * as d3 from 'd3';
import { ChartData, ChartCustomization } from '@/types';

export interface WordDatum {
  text: string;
  size: number;
  color: string;
  rotate: number; // 회전각도 추가
}

const WordCloudChartD3: React.FC<{ data: ChartData[]; customization: ChartCustomization; width?: number; height?: number }> = ({
  data,
  customization,
  width = 600,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const wordMap = new Map<string, number>();
    const textKeys = Object.keys(data[0]).filter((key) => typeof data[0][key] === 'string');
    const numericKeys = Object.keys(data[0]).filter((key) => typeof data[0][key] === 'number');

    data.forEach((row) => {
      textKeys.forEach((textKey) => {
        const text = String(row[textKey]);
        numericKeys.forEach((numericKey) => {
          const value = Number(row[numericKey]);
          if (text && !isNaN(value)) {
            const current = wordMap.get(text) || 0;
            wordMap.set(text, current + value);
          }
        });
      });
    });

    const maxWords = 50;
    const entries = Array.from(wordMap.entries())
      .filter(([text]) => text.length >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxWords);

    const maxVal = d3.max(entries, ([, val]) => val) || 1;
    const minVal = d3.min(entries, ([, val]) => val) || 0;

    // 강조 효과를 위한 지수적 크기 차이 확대
    const scale = d3.scalePow().exponent(2).domain([minVal, maxVal]).range([10, 100]);

    const colorScale = d3.scaleOrdinal<string>()
      .domain(entries.map(([text]) => text))
      .range(['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']);

      const words = entries.map(([text, value], index) => ({
        text,
        size: scale(value),
        color: colorScale(text) as string,
        rotate: index < 10 ? 0 : (Math.random() > 0.5 ? 90 : 0)
      }));

    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(2)
      .rotate(() => Math.random() > 0.9 ? 90 : 0)  // 수직은 10% 정도만 허용
      .font('sans-serif')
      .fontSize((d: any) => d.size)
      .on('end', draw);

    layout.start();

    function draw(words: any[]) {
      const svg = d3.select(svgRef.current);
      svg.selectAll('*').remove();

      const g = svg
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      g.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', (d: any) => `${d.size}px`)
        .style('fill', (d: any) => d.color)
        .style('font-family', 'sans-serif')
        .attr('text-anchor', 'middle')
        .attr('transform', (d: any) => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
        .text((d: any) => d.text)
        .on('mouseover', function (_, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('font-size', `${d.size * 1.2}px`)
            .style('font-weight', 'bold')
            .style('fill', d.color);
        })
        .on('mouseout', function (_, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('font-size', `${d.size}px`)
            .style('font-weight', 'normal')
            .style('fill', d.color);
        });
    }
  }, [data, customization, width, height]);

  return <svg ref={svgRef} width={width} height={height} />;
};

export default WordCloudChartD3;