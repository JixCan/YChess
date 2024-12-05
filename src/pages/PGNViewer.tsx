import { useRef, useState } from 'react';
import LichessPgnViewer from 'lichess-pgn-viewer';
import '../styles/pgnviewer.scss';
import AppButton from './AppButton';

const PGNViewer: React.FC = () => {
    const viewerRef = useRef<HTMLDivElement | null>(null);
    const [pgnText, setPgnText] = useState<string>(''); // Состояние для PGN
    const viewer = useRef<ReturnType<typeof LichessPgnViewer> | null>(null); // Экземпляр LichessPgnViewer

    const initViewer = (newPgn: string) => {

        if (!newPgn || newPgn.trim() === '') {
            alert('Ошибка: PGN пустой или недействителен');
            return;
        }
        if (viewerRef.current) {
            viewer.current = LichessPgnViewer(viewerRef.current, {
                pgn: newPgn,
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

            console.log(viewer.current);
        }
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        console.log('Изменение текста PGN:', e.target.value);
        setPgnText(e.target.value); // Обновляем состояние PGN
    };

    const loadPgn = () => {
        console.log('Загрузка нового PGN...');
        initViewer(pgnText); // Передаем текущий PGN
    };

    return (
        <div className="lpv-main">
            <h2>Эта страница позволяет анализировать PGN-файлы</h2>
            <div className="lpv-board-and-controls">
                <div ref={viewerRef} className="pgn-viewer"></div>

                <div className="lpv-controls">
                    <textarea
                        placeholder="Вставьте PGN здесь"
                        value={pgnText} // Устанавливаем значение из состояния
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
                        onClick={loadPgn}
                    >
                        Загрузить PGN
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default PGNViewer;
