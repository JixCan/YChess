import React, { useRef, useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import * as cg from 'chessground/types';
import { sliceMoveIntoTwo, getAiAndUserMoves } from '../utils/utils';
import { makeGameMove, getGameTurn, cancelGameMove, getGameFen, calculateElo } from '../utils/gameutils';
import { cancelBoardMove, getBoardFen, makeBoardMove, setBoardFen, setBoardTurn, toggleBoard, updateBoardDests } from '../utils/boardutils';
import { PuzzleData } from '../utils/types';
import { toast, ToastContainer } from 'react-toastify'; // Импортируем toast
import 'react-toastify/dist/ReactToastify.css'; 
import '../styles/Board.css';
import '../styles/Puzzles.css';

import { ReactComponent as NextIcon } from '../icons/next.svg';
import { ReactComponent as FlipIcon } from '../icons/flip.svg';
import AppButton from './AppButton';
import axios from 'axios';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const Puzzles: React.FC = () => {
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef(new Chess(DEFAULT_FEN));
    const board = useRef<ReturnType<typeof Chessground> | null>(null);
    const userRatingRef = useRef<number | null>(null);  
    const userIdRef = useRef<number | null>(null);

    const puzzleSolved = useRef(false);

    const aiMovesRef = useRef<string[]>([]);
    const userMovesRef = useRef<string[]>([]);

    const [puzzleData, setPuzzleData] = useState<PuzzleData | undefined>();
    const [userRating, setUserRating] = useState<number>(1200);  // Держим рейтинг в состоянии для отображения

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

    const getUserRating = async () => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            userIdRef.current = user.id;
            try {
                const response = await axios.get(`http://localhost:5000/api/user-rating/${user.id}`);
                if (response.data.rating !== undefined) {
                    userRatingRef.current = response.data.rating;  
                    setUserRating(response.data.rating); // Обновляем рейтинг в состоянии
                } else {
                    userRatingRef.current = 1200; 
                    setUserRating(1200); // Если рейтинга нет, выставляем дефолтное значение
                }
            } catch (error) {
                console.error('Ошибка при получении рейтинга пользователя:', error);
                userRatingRef.current = 1200; 
                setUserRating(1200);
            }
        } else {
            console.log("No user found in local storage!");
        }
    };

    const updateRating = async (newRating: number) => {
        try {
            await axios.post('http://localhost:5000/api/update-rating', { userId: userIdRef.current, newRating });
            userRatingRef.current = newRating; 
            setUserRating(newRating); // Обновляем рейтинг в состоянии
        } catch (error) {
            console.error('Ошибка при обновлении рейтинга:', error);
        }
    };

    const makeNextAiMove = (aiMoves: string[]) => {
        if (!puzzleSolved.current && board.current && userMovesRef.current.length > 0) {
            console.log(aiMoves);
            const [orig, dest] = sliceMoveIntoTwo(aiMoves[0]);
            console.log(`AI is trying to move: ${orig} to ${dest}`);
            makeGameMove(gameRef, orig, dest);
            const remainingMoves = aiMoves.slice(1);
            aiMovesRef.current = remainingMoves; 
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
        aiMovesRef.current = newAIMoves;  
        userMovesRef.current = newUserMoves; 

        board.current.set({ fen: puzzleData.fen });
        const userOrientation = getGameTurn(gameRef) === 'w' ? 'black' : 'white';
        board.current.set({ orientation: userOrientation });

        makeNextAiMove(newAIMoves);
    };

    const handleuserMove = (move: string) => {
        console.log(move, userMovesRef.current);
        if (userMovesRef.current.includes(move)) {
            console.log('User move is correct!');
            userMovesRef.current = userMovesRef.current.slice(1); 
            if (userMovesRef.current.length === 0) {
                puzzleSolved.current = true;
                console.log("Puzzle solved!");
                toast.success("Задача решена!");
                if (puzzleData && puzzleSolved.current) {
                    const initialRating = userRatingRef.current !== null ? userRatingRef.current : 1200;
                    const newRating = calculateElo(initialRating, puzzleData.rating, true);
                    console.log('New rating:', newRating);
                    updateRating(newRating); // Обновление рейтинга после решения задачи
                } else {
                    console.log("puzzledata is ", puzzleData);
                }
            }
            makeNextAiMove(aiMovesRef.current);
        } else {
            cancelGameMove(gameRef);
            cancelBoardMove(board.current!);
            updateBoardDests(board.current!, gameRef);
            setBoardFen(board.current!, getGameFen(gameRef));
            console.log("User move is incorrect!");
        }
    };

    useEffect(() => {
        getUserRating(); 
        if (puzzleData) {
            loadPuzzleOnBoard(puzzleData);
        }
    }, [puzzleData]);

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
        <><h1>Страница решения шахматных задач</h1>
        <div className="puzzle-container">

            <div className="board-and-rating">
                <div className="board-container">
                    <div ref={boardContainerRef} style={{ width: '500px', height: '500px' }}></div>
                </div>
                <div className="rating-and-buttons-container">
                    <div className="rating-container">
                        <h2>Ваш рейтинг: {userRating}</h2>
                    </div>
                    <div className="buttons-container">
                        <AppButton onClick={getPuzzle} className="app-button">
                            <NextIcon style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                            Новая задача
                        </AppButton>
                        <AppButton onClick={() => toggleBoard(board.current!)} className="app-button">
                            <FlipIcon style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                            Перевернуть доску
                        </AppButton>
                    </div>
                </div>
                    
                        
            </div>
            <ToastContainer />
        </div></>
      );
};

export default Puzzles;
