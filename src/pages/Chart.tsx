// Chart.tsx
import React, { useEffect } from 'react';
import * as d3 from 'd3';

interface ChartProps {
  data: { chesscom?: number | null; lichess?: number | null };
  title: string;
}

const Chart: React.FC<ChartProps> = ({ data, title }) => {
  useEffect(() => {
    const renderChart = () => {
      d3.select(`#${title}-chart`).selectAll("*").remove(); // Очищаем предыдущий график

      const chartData = [
        { category: 'Chess.com', rating: data.chesscom },
        { category: 'Lichess', rating: data.lichess },
      ].filter(d => d.rating !== null);

      if (chartData.length === 0) return;

      // Настройки размеров
      const margin = { top: 20, right: 30, bottom: 40, left: 40 };
      const width = 250 - margin.left - margin.right;
      const height = 300 - margin.top - margin.bottom;

      const svg = d3.select(`#${title}-chart`)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand()
        .domain(chartData.map(d => d.category))
        .range([0, width])
        .padding(0.1);

      const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.rating) || 0])
        .nice()
        .range([height, 0]);

      svg.selectAll("rect")
        .data(chartData)
        .enter().append("rect")
        .attr("x", d => x(d.category)!)
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("fill", "#4CAF50")
        .attr("rx", 5)
        .transition()
        .duration(1000)
        .attr("y", d => y(d.rating as number))
        .attr("height", d => height - y(d.rating as number));

      svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .call(d3.axisLeft(y));
    };

    renderChart();
  }, [data]);

  return (
    <div className="chart-container">
      <div className="chart-title">{title}</div>
      <div id={`${title}-chart`} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
};

export default Chart;
