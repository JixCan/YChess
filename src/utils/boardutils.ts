import { Chess } from "chess.js";
import { Api } from "chessground/api";
import { Color, Key } from "chessground/types";


// board: Api


/**
 * Выполняет указанный ход на доске
 *
 * @param {React.MutableRefObject<Api | null>} board
 * @param {Key} orig
 * @param {Key} dest
 */
export const makeBoardMove = (board: Api, orig: Key, dest: Key) => {
    board.move(orig, dest);
    const moveSound = new Audio('/move-self.mp3');
    if (moveSound) {
        moveSound.currentTime = 0;
        moveSound.play();
    }
}

/**
 * Переворачивает доску
 *
 * @param {React.MutableRefObject<Api | null>} board
 */
export const toggleBoard = (board: Api) => {
    board.toggleOrientation();
}

/**
 * Отменяет ход на доске
 *
 * @param {React.MutableRefObject<Api | null>} board
 */
export const cancelBoardMove = (board: Api) => {
    board.cancelMove();
}

/**
 * Получает текущий FEN доски
 *
 * @param {React.MutableRefObject<Api | null>} board
 */
export const getBoardFen = (board: Api) => {
    return board.getFen();
}

/**
 * Устанавливает FEN доски
 *
 * @param {React.MutableRefObject<Api | null>} board
 * @param {string} fen
 */
export const setBoardFen = (board: Api, fen: string) => {
    if (board && typeof board.set === "function") {
        board.set({ fen });
    } else {
        console.warn("Chessground instance is not initialized or set method is missing.");
        console.log("Current board reference:", board);
    }
};


/**
 * Считает все возможные ходы для данной позиции
 *
 * @param {React.MutableRefObject<Chess>} game
 * @returns {Map<Key, Key[]>}
 */
export const getCurrentDests = (game: React.MutableRefObject<Chess>): Map<Key, Key[]> => {
    const dests = new Map<Key, Key[]>();
    game.current.moves({ verbose: true }).forEach(({ from, to }) => {
        if (!dests.has(from)) dests.set(from, []);
        dests.get(from)!.push(to);
    });
    return dests;
}

/**
 * Обновляет возможные ходы для данной позиции
 *
 * @param {React.MutableRefObject<Api | null>} board
 * @param {React.MutableRefObject<Chess>} game
 */
export const updateBoardDests = (board: Api, game: React.MutableRefObject<Chess>) => {
    board.set({movable: { dests: getCurrentDests(game) }})
}

/**
 * Устанавливает указанную ориентацию для доски
 *
 * @param {React.MutableRefObject<Api | null>} board
 * @param {Color} orientation
 */
export const setBoardOrientation = (board: Api, orientation: Color) => {
    board.set({orientation});
}

export const setBoardTurn = (board: Api, turn: Color) => {
    board.set({movable: {color: turn}});
}

export const selectSquare = (board: Api, key: Key) => {
    board.selectSquare(key);
}

