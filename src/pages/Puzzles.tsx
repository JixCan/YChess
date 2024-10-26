import React, { useRef, useState, useEffect } from 'react';
import Board from '../components/Board';
import { Chess, SQUARES } from 'chess.js';
import * as cg from 'chessground/types';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const Puzzles: React.FC = () => {
    const boardRef = useRef<{ move: (orig: cg.Key, dest: cg.Key) => void }>(null);
    const [puzzleData, setPuzzleData] = useState<any>(null); // Состояние для данных о задаче
    const [fen, setFen] = useState(DEFAULT_FEN);
    const gameRef = useRef(new Chess(DEFAULT_FEN)); // Сохраняем игру в рефе
    const destsRef = useRef<cg.Dests>(new Map<cg.Key, cg.Key[]>()); // Передаем ref для возможных ходов
    const [userColor, setUserColor] = useState<cg.Color>('white');

    const getOppositeColorFromFEN = (fen: string): cg.Color => {
        const color = fen.split(' ')[1]; // Получаем часть FEN, указывающую на цвет
        return color === 'w' ? 'black' : 'white'; // Возвращаем противоположный цвет
    };

    const toDests = (): cg.Dests => {
        const dests: cg.Dests = new Map<cg.Key, cg.Key[]>(); // Создаем новую карту
        const moves = gameRef.current.moves({ verbose: true });

        moves.forEach(move => {
            const orig = move.from as cg.Key; // Начальная позиция
            const dest = move.to as cg.Key; // Конечная позиция

            if (!dests.has(orig)) {
                dests.set(orig, []); // Инициализируем массив для начальной позиции
            }
            dests.get(orig)!.push(dest); // Добавляем конечную позицию в массив
        });

        return dests; // Возвращаем объект типа cg.Dests
    };

    const updateDests = () => {
        const newDests = toDests(); // Получаем возможные назначения
        destsRef.current = newDests; // Обновляем реф dests
        console.log("dests updated for fen: ", gameRef.current.fen());
        console.log("Current dests:", newDests); // Лог для проверки новых значений
    };

    const getRandomPuzzle = () => {
        console.log('Fetching new puzzle');
        fetch('http://localhost:5000/api/random-puzzle')
            .then((response) => response.json())
            .then((data) => {
                console.log('Puzzle received:', data);
                setPuzzleData(data); // Сохраняем данные о задаче в состоянии
                setFen(data.fen); // Устанавливаем FEN на доске
                gameRef.current = new Chess(data.fen); // Обновляем состояние игры
                setUserColor(getOppositeColorFromFEN(data.fen));

                // Получаем первый ход из массива moves
                const firstMove = data.moves.split(' ')[0];
                if (firstMove) {
                    const orig = firstMove.slice(0, 2) as cg.Key; // Первые две буквы
                    const dest = firstMove.slice(2, 4) as cg.Key; // Последние две буквы

                    // Выполняем ход на доске с задержкой в 500 мс
                    setTimeout(() => {
                        console.log(`Moving from ${orig} to ${dest}`);
                        boardRef.current?.move(orig, dest);
                        gameRef.current.move({ from: orig, to: dest });
                        updateDests(); // Обновляем возможные назначения после выполнения хода
                    }, 500);
                }
            })
            .catch((error) => {
                console.error('Error fetching puzzle:', error);
            });
    };

    useEffect(() => {
        updateDests(); // Обновляем возможные назначения при первоначальной загрузке
    }, [fen]); // При изменении FEN

    return (
        <div>
            <h1>Страница решения шахматных задач</h1>
            <Board ref={boardRef} fen={fen} dests={destsRef.current} destsColor={userColor} destsRef={destsRef} /> {/* Передаем destsRef в Board */}
            <button onClick={getRandomPuzzle}>Получить задачу</button> {/* Кнопка для получения задачи */}
            {puzzleData && (
                <div>
                    <h2>Данные о задаче:</h2>
                    <pre>{JSON.stringify(puzzleData, null, 2)}</pre> {/* Отображаем данные о задаче */}
                </div>
            )}
        </div>
    );
};

export default Puzzles;
