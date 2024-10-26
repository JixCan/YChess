import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Chessground } from 'chessground';
import './Board.css'; // Ваши стили
import * as cg from 'chessground/types';

interface BoardProps {
    fen?: string; // Опциональный пропс для передачи FEN
    check?: boolean; // Пропс для состояния шаха
    dests?: cg.Dests | undefined; // Тип для dests
    destsColor?: cg.Color | 'white'; // Цвет пользователя
    destsRef?: React.MutableRefObject<cg.Dests | undefined>; // Передаем реф для dests
}

// Определяем интерфейс для методов, доступных через ref
interface BoardHandle {
    move: (orig: cg.Key, dest: cg.Key) => void;
}

// Создаем реф для Board с помощью forwardRef
const Board = forwardRef<BoardHandle, BoardProps>(({ fen = 'start', check = false, dests = undefined, destsColor, destsRef }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const groundRef = useRef<ReturnType<typeof Chessground> | null>(null);
    const moveSound = new Audio('/move-self.mp3'); // Укажите путь к вашему аудиофайлу

    useImperativeHandle(ref, () => ({
        move: (orig: cg.Key, dest: cg.Key) => {
            if (groundRef.current) {
                console.log('Board moving: ${orig} -> ${dest}');
                groundRef.current.move(orig as any, dest as any); // Выполняем перемещение фигуры
                moveSound.currentTime = 0; // Сбрасываем время воспроизведения
                moveSound.play(); // Воспроизводим звук
            }
        },
    }));

    useEffect(() => {
        if (containerRef.current) {
            const config = {
                fen: fen === 'start' ? 'start' : fen,
                ranksPosition: 'right',
                highlight: {
                    check: true,
                },
                orientation: destsColor,
                movable: {
                    color: destsColor,
                    showDests: true,
                    dests: destsRef?.current, // Используем переданный destsRef
                    free: false,
                    events: {
                        after: (orig: cg.Key, dest: cg.Key) => {
                            console.log('Пользователь сделал ход: ${orig} -> ${dest}');
                        },
                    },
                },
                draggable: {
                    showGhost: true,
                },
            };

            groundRef.current = Chessground(containerRef.current, config);
            groundRef.current.set({ check });
            if (destsRef?.current){
                groundRef.current.set({ movable: { dests: destsRef?.current } }); // Обновляем dests на доске
                console.log("got dests from useeffect");
            }

            return () => groundRef.current?.destroy();
        }
    }, [fen, check, destsRef?.current]); // Добавьте destsRef.current в зависимости

    return (
        <div ref={containerRef} className="chessground" style={{ width: '400px', height: '400px' }}>
            {/* Доска будет инициализирована здесь */}
        </div>
    );
});

export default Board;
