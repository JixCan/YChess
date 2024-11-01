import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Chessground } from 'chessground';
import './Board.css';
import * as cg from 'chessground/types';

interface BoardProps {
    config: {
        fen?: string;
        dests?: cg.Dests;
        userColor?: cg.Color;
    };
}

interface BoardHandle {
    move: (orig: cg.Key, dest: cg.Key) => void;
}

const Board = forwardRef<BoardHandle, BoardProps>(({ config }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const groundRef = useRef<ReturnType<typeof Chessground> | null>(null);
    const moveSound = useRef(new Audio('/move-self.mp3'));

    useImperativeHandle(ref, () => ({
        move: (orig: cg.Key, dest: cg.Key) => {
            groundRef.current?.move(orig as any, dest as any);
            if (moveSound.current) {
                moveSound.current.currentTime = 0;
                moveSound.current.play();
            }
        },
        toggle: () => {
            groundRef.current?.toggleOrientation();
        }
    }));

    useEffect(() => {
        if (containerRef.current) {
            groundRef.current = Chessground(containerRef.current, {
                fen: config.fen === 'start' ? 'start' : config.fen,
                orientation: config.userColor,
                movable: {
                    dests: config.dests,
                    free: false,
                    events: {
                        after: (orig, dest) => {
                            console.log(`Пользователь сделал ход: ${orig} -> ${dest}`);
                            moveSound.current.play();
                        }
                    },
                },
                draggable: { showGhost: true },
            });
        }
        
        return () => groundRef.current?.destroy();
    }, [config.fen, config.userColor]);

    // Effect to update `dests` whenever it changes
    useEffect(() => {
        if (groundRef.current && config.dests) {
            groundRef.current.set({ movable: { dests: config.dests } });
            groundRef.current.set({orientation: config.userColor});
            console.log("Updated dests in Board component:", config.dests, "color: ", config.userColor);
        }
    }, [config.dests]);

    return <div ref={containerRef} className="chessground" style={{ width: '400px', height: '400px' }} />;
});

export default Board;
