import { useEffect, useRef, useState } from 'react';
import LichessPgnViewer from 'lichess-pgn-viewer';
import '../styles/pgnviewer.scss';
//TODO: сделать динамическое обновление при загрузке pgn
const PGNViewer: React.FC = () => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const [pgnText, setPgnText] = useState<string>(''); // начальный PGN
    const viewer = useRef<ReturnType<typeof LichessPgnViewer> | null>(null); // Сохраняем инстанс LichessPgnViewer


    const initializeViewer = () => {
        if (viewerRef.current) {
            // Очищаем содержимое viewerRef, чтобы предотвратить накопление экземпляров
             viewerRef.current.innerHTML = '';

            // Создаем новый экземпляр LichessPgnViewer с текущим значением pgnText
            viewer.current = LichessPgnViewer(viewerRef.current, {
                pgn: pgnText,
                showPlayers: 'auto',
                showClocks: true,
                showControls: true,
                scrollToMove: true,
                orientation: undefined,
                initialPly: 0,
                drawArrows: true,
                menu: {
                    getPgn: {
                        enabled: true,
                        fileName: undefined,
                    },
                    practiceWithComputer: {
                        enabled: true,
                    },
                    analysisBoard: {
                        enabled: true,
                    },
                },
                lichess: 'https://lichess.org',
            });
        }
    };

    // Инициализация вьюера при изменении текста PGN
    useEffect(() => {
        initializeViewer();
    }, [pgnText]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPgnText(e.target.value); // Обновляем pgnText при изменении текста
    };

    return (
        <div>
            <h2>Эта страница позволяет анализировать pgn-файлы.</h2>
            <div
                ref={viewerRef}
                className="pgn-viewer"
                style={{ maxWidth: '400px', border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}
            ></div>

            {/* Инпут и кнопка для обновления PGN */}
            <textarea
                placeholder="Вставьте PGN здесь"
                value={pgnText}
                onChange={handleInputChange}
                rows={4}
                style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
            ></textarea>
            <button onClick={initializeViewer} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                Загрузить PGN
            </button>
        </div>
    );
};

export default PGNViewer;
