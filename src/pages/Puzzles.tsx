import React, { useRef, useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Chessground } from 'chessground';
import * as cg from 'chessground/types';
import { sliceMoveIntoTwo, getAiAndUserMoves, getLichessAnalysisLink } from '../utils/utils';
import { makeGameMove, getGameTurn, cancelGameMove, getGameFen, calculateElo } from '../utils/gameutils';
import { cancelBoardMove, getBoardFen, makeBoardMove, selectSquare, setBoardFen, setBoardTurn, toggleBoard, updateBoardDests } from '../utils/boardutils';
import { PuzzleData } from '../utils/types';
import { toast, ToastContainer } from 'react-toastify'; // Импортируем toast
import 'react-toastify/dist/ReactToastify.css'; 
import '../styles/Board.css';
import '../styles/Puzzles.css';

import { ReactComponent as NextIcon } from '../icons/next.svg';
import { ReactComponent as FlipIcon } from '../icons/flip.svg';
import { ReactComponent as BulbIcon } from '../icons/bulb.svg';

import AppButton from './AppButton';
import axios from 'axios';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const Puzzles: React.FC = () => {
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef(new Chess(DEFAULT_FEN));
    const board = useRef<ReturnType<typeof Chessground> | null>(null);
    const userRatingRef = useRef<number | null>(null);  
    const userIdRef = useRef<number | null>(null);
    const puzzleFen = useRef<string>();

    const puzzleSolved = useRef(false);
    const userColor = useRef<string>();

    const aiMovesRef = useRef<string[]>([]);
    const userMovesRef = useRef<string[]>([]);

    //const [puzzleData, setPuzzleData] = useState<PuzzleData | undefined>();
    const puzzleData = useRef<PuzzleData>();
    const [userRating, setUserRating] = useState<number>(1200);  // Держим рейтинг в состоянии для отображения

    const getPuzzle = () => {
        const request = new XMLHttpRequest();
        request.open('GET', 'http://localhost:5000/api/random-puzzle');
        request.onload = () => {
            try {
                const data = JSON.parse(request.response);
                //setPuzzleData(data);
                puzzleData.current = data;
                console.log("from getpuzzle: puzzleData.current = ", puzzleData.current);
                if (puzzleData.current) {
                loadPuzzleOnBoard(puzzleData.current);
                }
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
            const [orig, dest] = sliceMoveIntoTwo(aiMoves[0]);
            makeGameMove(gameRef, orig, dest);
            const remainingMoves = aiMoves.slice(1);
            aiMovesRef.current = remainingMoves; 
            setTimeout(() => {
                makeBoardMove(board.current!, orig as cg.Key, dest as cg.Key);
                updateBoardDests(board.current!, gameRef);
            }, 500);
            userColor.current = getGameTurn(gameRef) === 'w' ? 'white' : 'black';
            puzzleFen.current = getGameFen(gameRef);
        } else {
            console.log("Puzzle solved!");
        }
    };

    const loadPuzzleOnBoard = (puzzleData: PuzzleData | undefined) => {
        console.log("from loadPuzzle: puzzledata = ", puzzleData);
        console.log("useridref.current = ", userIdRef.current);
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

    const showHint = () => {
        if (!puzzleSolved.current && puzzleData.current){
            const keyMove = userMovesRef.current[0].slice(0, 2);
            selectSquare(board.current!, keyMove as cg.Key);
        }
    }

    const analysePosition = () => {
        if (puzzleData.current && puzzleFen.current && userColor.current){
            window.open(getLichessAnalysisLink(puzzleFen.current, userColor.current));
        }
    }

    const handleuserMove = (move: string) => {
        console.log(move, userMovesRef.current);
        if (userMovesRef.current[0] === move) {
            console.log('User move is correct!');
            userMovesRef.current = userMovesRef.current.slice(1); 
            userColor.current = getGameTurn(gameRef) === 'w' ? 'white' : 'black';
            puzzleFen.current = getGameFen(gameRef);
            if (userMovesRef.current.length === 0) {
                puzzleSolved.current = true;
                console.log("Puzzle solved!");
                toast.success("Задача решена!");
                if (puzzleData.current && puzzleSolved.current) {
                    const initialRating = userRatingRef.current !== null ? userRatingRef.current : 1200;
                    const newRating = calculateElo(initialRating, puzzleData.current.rating, true);
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
        console.log("from useEffect: puzzleData.current = ", puzzleData.current);
        // if (puzzleData.current) {
        //     loadPuzzleOnBoard(puzzleData.current);
        // }
    }, [puzzleData.current]);

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
        <div className="puzzle-container">
            <div className="board-and-rating">
                <div className="board-container">
                    <div ref={boardContainerRef} style={{ width: '600px', height: '600px' }}></div>
                </div>
                <div className="rating-and-buttons-container">
                    <div className="rating-container">
                        <h3>Решайте миллионы шахматных задач прямо в браузере! Войдите или зарегистрируйтесь, чтобы иметь возможность отслеживать свой прогресс.</h3>
                        {userIdRef.current && <h2>Ваш рейтинг: {userRating}</h2>}
                    </div>
                    <div className="buttons-container">
                        <div className="control-buttons">
                        <AppButton onClick={getPuzzle} className="app-button">
                            <svg className='icon' width="800px" height="800px" viewBox="0 -2 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" fill="#000000">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                            <g id="SVGRepo_iconCarrier"> <title>next [#998]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-144.000000, -3805.000000)" fill="#ffba6a"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M99.684,3649.69353 L95.207,3652.82453 C94.571,3653.25353 94,3652.84553 94,3652.13153 L94,3650.14053 L89.78,3652.82453 C89.145,3653.25353 88,3652.84553 88,3652.13153 L88,3645.86853 C88,3645.15453 89.145,3644.74653 89.78,3645.17453 L94,3647.85953 L94,3645.86853 C94,3645.15453 94.571,3644.74653 95.207,3645.17453 L99.516,3648.30653 C100.03,3648.65353 100.198,3649.34653 99.684,3649.69353" id="next-[#998]"> </path> </g> </g> </g> </g>
                            </svg>
                            Новая задача
                        </AppButton>
                        <AppButton onClick={() => toggleBoard(board.current!)} className="app-button">
                            <svg className='icon' width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                            <g id="SVGRepo_iconCarrier"> <path d="M18.1136 22H5.88638C4.18423 22 3.33316 22 3.05402 21.4576C2.77488 20.9152 3.26956 20.2226 4.25891 18.8375L5.38837 17.2563C5.82827 16.6404 6.04822 16.3325 6.37127 16.1662C6.69432 16 7.07274 16 7.82957 16H16.1704C16.9273 16 17.3057 16 17.6287 16.1662C17.9518 16.3325 18.1717 16.6404 18.6116 17.2563L19.7411 18.8375C20.7304 20.2226 21.2251 20.9152 20.946 21.4576C20.6668 22 19.8158 22 18.1136 22Z" fill="#ffba6a"/> <path d="M18.1136 2L5.88638 2C4.18423 2 3.33316 2 3.05402 2.54242C2.77488 3.08484 3.26956 3.77738 4.25891 5.16247L5.38837 6.74372C5.82827 7.35957 6.04822 7.6675 6.37127 7.83375C6.69432 8 7.07274 8 7.82957 8L16.1704 8C16.9273 8 17.3057 8 17.6287 7.83375C17.9518 7.6675 18.1717 7.35957 18.6116 6.74372L19.7411 5.16248C20.7304 3.77738 21.2251 3.08484 20.946 2.54242C20.6668 2 19.8158 2 18.1136 2Z" fill="#ffba6a"/> <path fill-rule="evenodd" clip-rule="evenodd" d="M1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H6C6.41421 11.25 6.75 11.5858 6.75 12C6.75 12.4142 6.41421 12.75 6 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM9.25 12C9.25 11.5858 9.58579 11.25 10 11.25H14C14.4142 11.25 14.75 11.5858 14.75 12C14.75 12.4142 14.4142 12.75 14 12.75H10C9.58579 12.75 9.25 12.4142 9.25 12ZM17.25 12C17.25 11.5858 17.5858 11.25 18 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H18C17.5858 12.75 17.25 12.4142 17.25 12Z" fill="#ffba6a"/> </g>
                            </svg>
                            Перевернуть доску
                        </AppButton>
                        </div>
                        <div className="hint-buttons">
                        <AppButton onClick={showHint} className='app-button'>Получить подсказку</AppButton>
                        <AppButton onClick={analysePosition}>Анализировать</AppButton>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
    
};

export default Puzzles;
