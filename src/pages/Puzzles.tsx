import React, { useRef, useState, useEffect } from 'react';
import Board from '../components/Board';
import { Chess } from 'chess.js';
import * as cg from 'chessground/types';

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const Puzzles: React.FC = () => {
    const boardRef = useRef<{ move: (orig: cg.Key, dest: cg.Key) => void, toggle: () => void }>(null);
    const gameRef = useRef(new Chess(DEFAULT_FEN));
    
    // Consolidate board-related states into one object
    const [boardState, setBoardState] = useState({
        fen: DEFAULT_FEN,
        dests: new Map<cg.Key, cg.Key[]>(),
        userColor: '' as cg.Color,
    });
    const [puzzleData, setPuzzleData] = useState(null);

    const updateDests = () => {
        const dests = new Map<cg.Key, cg.Key[]>();
        gameRef.current.moves({ verbose: true }).forEach(({ from, to }) => {
            if (!dests.has(from)) dests.set(from, []);
            dests.get(from)!.push(to);
        });
        setBoardState(prevState => ({
            ...prevState,
            dests,
        }));
        console.log("dests updated for fen: ", gameRef.current.fen(), dests);
    };
    const toggleBoard = () =>{
        boardRef.current?.toggle();
    }
    const getRandomPuzzle = () => {
        fetch('http://localhost:5000/api/random-puzzle')
            .then((res) => res.json())
            .then((data) => {
                setPuzzleData(data);
                gameRef.current = new Chess(data.fen);
                
                // Update boardState with new puzzle FEN, user color, and initial move
                const [orig, dest] = [data.moves.slice(0, 2), data.moves.slice(2, 4)];
                setBoardState({
                    fen: data.fen,
                    dests: new Map(),
                    userColor: data.fen.split(' ')[1] === 'w' ? 'black' : 'white',
                });
                
                setTimeout(() => {
                    boardRef.current?.move(orig as cg.Key, dest as cg.Key);
                    gameRef.current.move({ from: orig, to: dest });
                    updateDests();
                }, 500);
            })
            .catch((error) => console.error('Error fetching puzzle:', error));
    };

    useEffect(updateDests, [boardState.fen]);

    return (
        <div>
            <h1>Страница решения шахматных задач</h1>
            <Board config={boardState} ref={boardRef}/>
            <button onClick={getRandomPuzzle}>Получить задачу</button>
            <button onClick={toggleBoard}>Перевернуть доску</button>
            {puzzleData && (
                <div>
                    <h2>Данные о задаче:</h2>
                    <pre>{JSON.stringify(puzzleData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default Puzzles;
