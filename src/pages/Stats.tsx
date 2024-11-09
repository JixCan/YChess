//todo: графики обновляются при каждом вводе букв

import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';

const Stats: React.FC = () => {
  const [chesscomNickname, setChesscomNickname] = useState('');
  const [lichessNickname, setLichessNickname] = useState('');
  const [chesscomData, setChesscomData] = useState<any>(null);
  const [lichessData, setLichessData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isDataFetched, setIsDataFetched] = useState(false); // Состояние для управления анимацией графиков

  const fetchChesscomData = async () => {
    try {
      const statsResponse = await fetch(`https://api.chess.com/pub/player/${chesscomNickname}/stats`);

      if (!statsResponse.ok) {
        throw new Error('Ошибка при получении данных с Chess.com');
      }

      const statsData = await statsResponse.json();
      setChesscomData(statsData);
      setError('');
      setIsDataFetched(true); // Установите состояние в true при успешном получении данных
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка');
      }
      setChesscomData(null);
    }
  };

  const fetchLichessData = async () => {
    try {
      const bulletResponse = await fetch(`https://lichess.org/api/user/${lichessNickname}/perf/bullet`);
      const blitzResponse = await fetch(`https://lichess.org/api/user/${lichessNickname}/perf/blitz`);
      const rapidResponse = await fetch(`https://lichess.org/api/user/${lichessNickname}/perf/rapid`);
      const puzzleResponse = await fetch(`https://lichess.org/api/user/${lichessNickname}/perf/puzzle`);

      if (!bulletResponse.ok || !blitzResponse.ok || !rapidResponse.ok) {
        throw new Error('Ошибка при получении данных с Lichess');
      }

      const bulletData = await bulletResponse.json();
      const blitzData = await blitzResponse.json();
      const rapidData = await rapidResponse.json();
      const puzzleData = await puzzleResponse.json();

      setLichessData({ bullet: bulletData, blitz: blitzData, rapid: rapidData, puzzle: puzzleData });
      setError('');
      setIsDataFetched(true); // Установите состояние в true при успешном получении данных
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла неизвестная ошибка');
      }
      setLichessData(null);
    }
  };

  const handleSubmit = () => {
    if (chesscomNickname) {
      fetchChesscomData();
    } else {
      setChesscomData(null); // Очистить данные, если поле пустое
    }
    if (lichessNickname) {
      fetchLichessData();
    } else {
      setLichessData(null); // Очистить данные, если поле пустое
    }
  };

  // Компонент для графика
  const Chart: React.FC<{ data: any; title: string }> = ({ data, title }) => {
    useEffect(() => {
      const renderChart = () => {
        d3.select(`#${title}-chart`).selectAll("*").remove(); // Clear previous chart
  
        const chesscomRating = data?.chesscom ?? null;
        const lichessRating = data?.lichess ?? null;
  
        const chartData = [
          { category: 'Chess.com', rating: chesscomRating },
          { category: 'Lichess', rating: lichessRating },
        ].filter(d => d.rating !== null); // Фильтруем пустые данные
  
        if (chartData.length === 0) return; // Если нет данных, ничего не рисуем
  
        // Set dimensions and margins
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
          .domain([0, d3.max(chartData, d => d.rating) || 0]) // Убедитесь, что здесь есть корректные значения
          .nice()
          .range([height, 0]);
  
        svg.selectAll("rect")
          .data(chartData)
          .enter().append("rect")
          .attr("x", d => x(d.category)!)
          .attr("y", height) // Начальная позиция по оси Y
          .attr("width", x.bandwidth())
          .attr("height", 0) // Начальная высота 0
          .attr("fill", "darkgreen")
          .transition() // Плавная анимация
          .duration(1000)
          .attr("y", d => y(d.rating))
          .attr("height", d => {
            const heightValue = height - y(d.rating);
            return isNaN(heightValue) ? 0 : heightValue; // Проверяем на NaN
          });
  
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x));
  
        svg.append("g")
          .call(d3.axisLeft(y));
      };
  
      renderChart();
    }, [data]);
  
    return <div id={`${title}-chart`} style={{ flex: 1 }}></div>; // Добавим стиль для флекса
  };
  

  return (
    <div>
      <h2>Личный кабинет</h2>

      <div>
        <h3>Chess.com</h3>
        <input
          type="text"
          placeholder="Введите ник на Chess.com"
          value={chesscomNickname}
          onChange={(e) => setChesscomNickname(e.target.value)}
        />
      </div>

      <div>
        <h3>Lichess</h3>
        <input
          type="text"
          placeholder="Введите ник на Lichess"
          value={lichessNickname}
          onChange={(e) => setLichessNickname(e.target.value)}
        />
      </div>

      <button onClick={handleSubmit}>Получить информацию</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Отображаем графики для каждого режима */}
      <div style={{ display: 'flex', justifyContent: 'space-around' }}> {/* Контейнер для графиков в ряд */}
        {chesscomData && (chesscomData.chess_bullet || lichessData?.bullet) && (
          <>
            <h4>Bullet</h4>
            <Chart data={{
              chesscom: chesscomData?.chess_bullet?.last?.rating,
              lichess: lichessData?.bullet?.perf?.glicko?.rating
            }} title="bullet" />
          </>
        )}

        {chesscomData && (chesscomData.chess_blitz || lichessData?.blitz) && (
          <>
            <h4>Blitz</h4>
            <Chart data={{
              chesscom: chesscomData?.chess_blitz?.last?.rating,
              lichess: lichessData?.blitz?.perf?.glicko?.rating
            }} title="blitz" />
          </>
        )}

        {chesscomData && (chesscomData.chess_rapid || lichessData?.rapid) && (
          <>
            <h4>Rapid</h4>
            <Chart data={{
              chesscom: chesscomData?.chess_rapid?.last?.rating,
              lichess: lichessData?.rapid?.perf?.glicko?.rating
            }} title="rapid" />
          </>
        )}

        {chesscomData && (chesscomData.tactics?.highest?.rating || lichessData?.puzzle) && (
          <>
            <h4>Puzzles</h4>
            <Chart data={{
              chesscom: chesscomData?.tactics?.highest?.rating,
              lichess: lichessData?.puzzle?.perf?.glicko?.rating
            }} title="puzzles" />
          </>
        )}
      </div>
    </div>
  );
};

export default Stats;
