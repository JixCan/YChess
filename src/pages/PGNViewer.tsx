import { useEffect, useRef, useState } from 'react';
import LichessPgnViewer from 'lichess-pgn-viewer';
import '../styles/pgnviewer.scss';
import AppButton from './AppButton';

const PGNViewer: React.FC = () => {





    // TODO: ПРИ СМЕНЕ СПОСОБА УКАЗАНИЯ PGN НОВЫЙ PGN ЗАГРУЖАЕТСЯ, НО КОМПОНЕНТ НЕ ОБНОВЛЯЕТСЯ





    const viewerRef = useRef<HTMLDivElement | null>(null);
    const [pgnText, setPgnText] = useState<string>(''); // Используем useState вместо useRef
    const viewer = useRef<ReturnType<typeof LichessPgnViewer> | null>(null); // Экземпляр LichessPgnViewer
    const [gameUrl, setGameUrl] = useState<string>(''); // Для хранения ссылки на игру
    const [loading, setLoading] = useState<boolean>(false); // Состояние загрузки
    const [inputMethod, setInputMethod] = useState<'url' | 'pgn'>('url'); // Выбор метода ввода

    // Инициализация просмотрщика
    const initializeViewer = () => {
        if (!viewerRef.current) {
            console.error('viewerRef.current is null');
            return;
        }



        


        if (!pgnText || pgnText.trim() === '') {
            console.log('Не удалось загрузить PGN'); //TODO: ВЫВОДИТСЯ ДАЖЕ ПРИ ПРАВИЛЬНОМ PGN, ЕСЛИ ДО ЭТОГО PGNTEXT БЫЛ ПУСТОЙ
            return;
        }






        // Очищаем содержимое div, чтобы предотвратить накопление инстансов
        viewerRef.current.innerHTML = '';

        // Инициализируем LichessPgnViewer
        console.log('Initializing LichessPgnViewer with PGN:', pgnText);
        viewer.current = LichessPgnViewer(viewerRef.current, {
            pgn: pgnText,
            showPlayers: 'auto',
            showClocks: true,
            showControls: true,
            scrollToMove: true,
            drawArrows: true,
            menu: {
                getPgn: { enabled: true },
                practiceWithComputer: { enabled: true },
                analysisBoard: { enabled: true },
            },
            lichess: 'https://lichess.org',
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPgnText(e.target.value); // Обновляем PGN с использованием setPgnText
    };

    const handleGameUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGameUrl(e.target.value); // Обновляем ссылку на игру
    };

    const loadGameFromLichess = async () => {
        const gameId = extractGameId(gameUrl);
        if (!gameId) {
            alert('Пожалуйста, укажите корректную ссылку на игру Lichess.');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`https://lichess.org/game/export/${gameId}`, {
                headers: {
                    Accept: 'application/x-chess-pgn',
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки PGN: ${response.statusText}`);
            }

            const pgn = await response.text();
            setPgnText(pgn); // Обновляем PGN с использованием setPgnText
            initializeViewer(); // Перезагружаем просмотрщик
        } catch (error) {
            console.error('Ошибка при загрузке PGN:', error);
            alert('Не удалось загрузить PGN. Проверьте ссылку или попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const extractGameId = (url: string): string | null => {
        const match = url.match(/lichess\.org\/([a-zA-Z0-9]{8})/); 
        return match ? match[1] : null;
    };

    useEffect(() => {
        // Если PGN обновился, перезагружаем просмотрщик
        if (pgnText) {
            initializeViewer();
        }
    }, [pgnText]); // Зависимость от pgnText (состояние)

    return (
        <div className="lpv-main">
            <h2>Эта страница позволяет анализировать PGN-файлы</h2>
            <div className="lpv-board-and-controls">
                <div ref={viewerRef} className="pgn-viewer"></div>

                <div className="lpv-controls">
                    {/* Радио кнопки для выбора типа ввода */}
                    <div>
                        <label>
                            <input
                                type="radio"
                                name="inputMethod"
                                checked={inputMethod === 'url'}
                                onChange={() => setInputMethod('url')}
                            />
                            Ввод из ссылки на игру Lichess
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="inputMethod"
                                checked={inputMethod === 'pgn'}
                                onChange={() => setInputMethod('pgn')}
                            />
                            Ввод PGN вручную
                        </label>
                    </div>

                    {/* Ввод в зависимости от выбранного метода */}
                    {inputMethod === 'url' && (
                        <div>
                            <input
                                type="text"
                                placeholder="Введите ссылку на игру Lichess"
                                value={gameUrl}
                                onChange={handleGameUrlChange}
                                style={{
                                    width: '100%',
                                    marginBottom: '0.5rem',
                                    padding: '0.5rem',
                                }}
                            />

                            {/* Кнопка загрузки из игры */}
                            <AppButton
                                onClick={loadGameFromLichess}
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                                disabled={loading}
                            >
                                {loading ? 'Загрузка...' : 'Загрузить из игры'}
                            </AppButton>
                        </div>
                    )}

                    {inputMethod === 'pgn' && (
                        <div>
                            <textarea
                                placeholder="Вставьте PGN здесь"
                                onChange={handleInputChange}
                                rows={4}
                                style={{
                                    width: '100%',
                                    marginTop: '1rem',
                                    marginBottom: '0.5rem',
                                    padding: '0.5rem',
                                }}
                            ></textarea>

                            {/* Кнопка для загрузки PGN */}
                            <AppButton
                                onClick={initializeViewer}
                                style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}
                            >
                                Загрузить PGN
                            </AppButton>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PGNViewer;
