import React, { useState } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { createRatingsBarChartConfig, createWDLDonutConfig, createWLDBarChartConfig, ModeStats, PuzzleStats, RatingStats } from '../utils/chartutils';
import '../styles/Stats.css';
import AppButton from './AppButton';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const Stats: React.FC = () => {
    const [username, setUsername] = useState<string>('Yan'); //default username
    const [gameMode, setGameMode] = useState<string>('chess_bullet'); // default mode
    const [platform, setPlatform] = useState<'Chess.com' | 'Lichess.org'>('Chess.com'); // default platform

    const [wdlChartData, setWdlChartData] = useState<{ data: any; options: any } | null>(null);
    const [wdlBarChartData, setWdlBarChartData] = useState<{ data: any; options: any } | null>(null);
    const [ratingsBarChartData, setRatingsBarChartData] = useState<{ data: any; options: any } | null>(null);
    const [puzzlesChartData, setPuzzlesChartDara] = useState<PuzzleStats>();

    const [error, setError] = useState<string | null>(null);

    const elementsTextColor = window.getComputedStyle(document.documentElement).getPropertyValue('--elements-text-color').trim();

    const endpoints = {
        chesscom: {
            ratings: "https://api.chess.com/pub/player/{username}/stats",
            modeStats: "https://api.chess.com/pub/player/{username}/stats",
            puzzles: "http://localhost:5000/api/chesscom/puzzles/{username}",
        },
        lichess: {
            ratings: "https://lichess.org/api/user/{username}",
            modeStats: "https://lichess.org/api/user/{username}/perf/{gamemode}",
            puzzles: "https://lichess.org/api/user/{username}"
        }
    };

    const handleFetchData = async () => {
        try {
            setError(null);
            let ratingsResponse;
            let modeStatsResponse;
            let puzzleResponse;

            if (platform === 'Chess.com') {
                ratingsResponse = await fetch(endpoints.chesscom.ratings.replace("{username}", username));
                modeStatsResponse = await fetch(endpoints.chesscom.modeStats.replace("{username}", username));
                puzzleResponse = await fetch(endpoints.chesscom.puzzles.replace("{username}", username));
            } else {
                ratingsResponse = await fetch(endpoints.lichess.ratings.replace("{username}", username));
                modeStatsResponse = await fetch(endpoints.lichess.modeStats.replace("{username}", username).replace("{gamemode}", gameMode.replace("chess_", "")));
                puzzleResponse = await fetch(endpoints.lichess.puzzles.replace("{username}", username));
            }

            if (!(modeStatsResponse.ok && ratingsResponse.ok)) {
                setError('Пользователь не найден или произошла ошибка при получении данных');
                return;
            }

            const modeStatsData = await modeStatsResponse.json();
            const ratingsData = await ratingsResponse.json();
            const puzzlesData = await puzzleResponse.json();

            let ratingStats: RatingStats;
            let modeStats: ModeStats;
            let puzzleStats: PuzzleStats;

            if (platform === "Chess.com") {
                const rData = ratingsData;
                const mData = modeStatsData[gameMode];
                const pData = puzzlesData;

                // Проверяем доступность данных, если данных нет - заменяем на 0
                ratingStats = {
                    bullet: rData?.chess_bullet?.last?.rating || 0,
                    blitz: rData?.chess_blitz?.last?.rating || 0,
                    rapid: rData?.chess_rapid?.last?.rating || 0,
                };

                modeStats = {
                    wins: mData?.record?.win || 0,
                    draws: mData?.record?.draw || 0,
                    losses: mData?.record?.loss || 0,
                };


                puzzleStats = {
                    games: pData?.games || 0,
                    rating: pData?.rating || 0,
                };

            } else {
                const rData = ratingsData;
                const mData = modeStatsData;
                const pData = puzzlesData;

                // Проверяем доступность данных, если данных нет - заменяем на 0
                ratingStats = {
                    bullet: rData?.perfs?.bullet?.rating || 0,
                    blitz: rData?.perfs?.blitz?.rating || 0,
                    rapid: rData?.perfs?.rapid?.rating || 0,
                };

                modeStats = {
                    wins: mData?.stat?.count?.win || 0,
                    draws: mData?.stat?.count?.draw || 0,
                    losses: mData?.stat?.count?.loss || 0,
                };

                puzzleStats = {
                    games: pData?.perfs?.puzzle?.games || 0,
                    rating: pData?.perfs?.puzzle?.rating || 0,
                };
            }


            setRatingsBarChartData(createRatingsBarChartConfig(ratingStats, username, platform, elementsTextColor));
            setWdlChartData(createWDLDonutConfig(modeStats, 300, 300, username, platform, elementsTextColor));
            setWdlBarChartData(createWLDBarChartConfig(modeStats, username, platform, elementsTextColor));
            setPuzzlesChartDara(puzzleStats);

        }
        catch (err) {
            console.error(err);
            setError('Пользователь не найден или произошла ошибка при получении данных');
        }
    }

    return (
        <div className='main'>
            <h1>Статистика сторонних аккаунтов</h1>

            <div className="input-fields">
                <div className='radio-buttons'>
                    <div className="rb">

                        <input
                            type="radio"
                            id="Chess.com"
                            name="platform"
                            value="Chess.com"
                            checked={platform === 'Chess.com'}
                            onChange={() => setPlatform('Chess.com')}
                        />
                        <label htmlFor="Chess.com">Chess.com</label>
                    </div>

                    <div className="rb">

                        <input
                            type="radio"
                            id="Lichess.org"
                            name="platform"
                            value="Lichess.org"
                            checked={platform === 'Lichess.org'}
                            onChange={() => setPlatform('Lichess.org')}
                        />
                        <label htmlFor="Lichess.org">Lichess.org</label>
                    </div>
                </div>

                <div className="inputs-and-button">
                    <div className="inputs">
                        {/* Input для ника пользователя */}
                        <input
                            type="text"
                            placeholder="Введите ник"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        {/* Select для выбора режима игры */}
                        <select value={gameMode} onChange={(e) => setGameMode(e.target.value)}>
                            <option value="chess_bullet">Пуля</option>
                            <option value="chess_blitz">Блиц</option>
                            <option value="chess_rapid">Рапид</option>
                        </select>
                    </div>
                    {/* Кнопка для запроса данных */}
                    <AppButton className='get-data-button' onClick={handleFetchData}>Получить статистику</AppButton>
                </div>
            </div>



            {/* Обработка ошибок */}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {ratingsBarChartData || wdlChartData || wdlBarChartData || puzzlesChartData ? (
                <div className="ratings-and-wdl-container">
                    <div className="chart-container">
                        <h3>Рейтинги по режимам</h3>
                        <div className="stat-rating-chart-container">
                            {ratingsBarChartData && (
                                <Bar data={ratingsBarChartData.data} options={ratingsBarChartData.options} />
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Победы, ничьи и поражения</h3>
                        <div className="wdl-charts-container">
                            {wdlChartData && (
                                <div className="wdl-chart-container">
                                    <Doughnut data={wdlChartData.data} options={wdlChartData.options} />
                                </div>
                            )}
                            {wdlBarChartData && (
                                <div className="wdl-chart-container">
                                    <Bar data={wdlBarChartData.data} options={wdlBarChartData.options} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="chart-container">
                        <h3>Статистика решённых задач</h3>
                        {puzzlesChartData && (
                            <div className="puzzles-container">
                                <h3>Попыток: {puzzlesChartData.games}</h3>
                                <h3>Рейтинг: {puzzlesChartData.rating}</h3>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <p>Для отображения данных укажите ник пользователя на одной из выбранных платформ.</p>
            )}

        </div>
    )
}

export default Stats;