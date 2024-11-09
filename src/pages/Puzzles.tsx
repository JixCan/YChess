import React, { useRef, useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import * as cg from 'chessground/types';
import { sliceMoveIntoTwo, getAiAndUserMoves } from '../utils/utils';
import { makeGameMove, getGameTurn, cancelGameMove, getGameFen } from '../utils/gameutils';
import { cancelBoardMove, getBoardFen, makeBoardMove, setBoardFen, setBoardTurn, toggleBoard, updateBoardDests } from '../utils/boardutils';
import { PuzzleData } from '../utils/types';
import { toast, ToastContainer } from 'react-toastify'; // Импортируем toast
import 'react-toastify/dist/ReactToastify.css'; // Стили для Toastify
import '../styles/Board.css';
import '../styles/Puzzles.css';

//TODO: Обработка превращений на 8 горизонтали


import { ReactComponent as NextIcon } from '../icons/next.svg';
import { ReactComponent as FlipIcon } from '../icons/flip.svg';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const Puzzles: React.FC = () => {
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef(new Chess(DEFAULT_FEN));
    const board = useRef<ReturnType<typeof Chessground> | null>(null);

    const puzzleSolved = useRef(false);

    // Используем useRef для хранения массивов ходов, чтобы избежать перерисовок
    const aiMovesRef = useRef<string[]>([]);
    const userMovesRef = useRef<string[]>([]);

    const [puzzleData, setPuzzleData] = useState<PuzzleData | undefined>();

    const getPuzzle = () => {
        const request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:5000/api/random-puzzle');
        request.onload = () => {
            try {
                const data = JSON.parse(request.response);
                setPuzzleData(data);
                console.log(data);
            } catch (error) {
                console.error('Ошибка при разборе JSON:', error);
            }
        };
        request.send();
    };

    const makeNextAiMove = (aiMoves: string[]) => {
        if (!puzzleSolved.current && board.current && userMovesRef.current.length > 0) {
            console.log(aiMoves);
            const [orig, dest] = sliceMoveIntoTwo(aiMoves[0]);
            console.log(`AI is trying to move: ${orig} to ${dest}`);
            makeGameMove(gameRef, orig, dest);
            const remainingMoves = aiMoves.slice(1);
            aiMovesRef.current = remainingMoves; // Обновляем ссылку на массив
            setTimeout(() => {
                makeBoardMove(board.current!, orig as cg.Key, dest as cg.Key);
                updateBoardDests(board.current!, gameRef);
            }, 500);
        } else {
            console.log("Puzzle solved!");
        }
    };

    const loadPuzzleOnBoard = (puzzleData: PuzzleData | undefined) => {
        if (!puzzleData || !board.current) return;

        puzzleSolved.current = false;

        gameRef.current = new Chess(puzzleData.fen);
        const [newAIMoves, newUserMoves] = getAiAndUserMoves(puzzleData.moves.split(" "));
        aiMovesRef.current = newAIMoves;  // Сохраняем новые ходы AI
        userMovesRef.current = newUserMoves; // Сохраняем новые ходы пользователя

        board.current.set({ fen: puzzleData.fen });
        const userOrientation = getGameTurn(gameRef) === 'w' ? 'black' : 'white';
        board.current.set({ orientation: userOrientation });

        makeNextAiMove(newAIMoves);
    };

    const handleuserMove = (move: string) => {
        console.log(move, userMovesRef.current);
        if (userMovesRef.current.includes(move)) {
            console.log('User move is correct!');
            userMovesRef.current = userMovesRef.current.slice(1); // Обновляем массив
            if (userMovesRef.current.length === 0) {
                puzzleSolved.current = true;
                console.log("Puzzle solved!");
                toast.success("Задача решена!");
            }
            makeNextAiMove(aiMovesRef.current);
        } else {
            cancelGameMove(gameRef);
            cancelBoardMove(board.current!);
            updateBoardDests(board.current!, gameRef);
            setBoardFen(board.current!, getGameFen(gameRef));
            console.log("User move is incorrect!");
            toast.error("Неверный ход!");
        }
    };

    useEffect(() => {
        if (puzzleData) {
            // Загружаем новый пазл
            loadPuzzleOnBoard(puzzleData);
        }
    }, [puzzleData]); // Следим за изменением puzzleData

    useEffect(() => {
        if (boardContainerRef.current) {
            board.current = Chessground(boardContainerRef.current, {
                fen: DEFAULT_FEN,
                orientation: 'white',
                movable: {
                    free: false,
                    events: {
                        after: (orig, dest) => {
                            const move = orig + dest;
                            makeGameMove(gameRef, orig, dest);
                            handleuserMove(move);
                        },
                    },
                },
                draggable: { showGhost: true },
            });
        }

        return () => board.current?.destroy();
    }, []);

    return (
        <div>
            <h1>Страница решения шахматных задач</h1>
            <div className='board-container'>
                <div ref={boardContainerRef} style={{ width: '500px', height: '500px' }}></div>
                <div className="button-container">
                <button onClick={getPuzzle}>
                        <NextIcon style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                        Новая задача
                    </button>
                    <button onClick={() => toggleBoard(board.current!)}>
                        <FlipIcon style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                        Перевернуть доску
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
    
};

export default Puzzles;
