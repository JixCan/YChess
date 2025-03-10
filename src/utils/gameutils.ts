import { Chess, Color } from "chess.js";

/**
 * Возращает FEN текущей игры
 *
 * @param {React.MutableRefObject<Chess>} game
 * @returns {string}
 */
export const getGameFen = (game: React.MutableRefObject<Chess>): string => {
    return game.current.fen();
}

/**
 * Отменяет последний ход игры
 *
 * @param {React.MutableRefObject<Chess>} game
 */
export const cancelGameMove = (game: React.MutableRefObject<Chess>) => {
    game.current.undo();
}

/**
 * Очищает текущую игру
 *
 * @param {React.MutableRefObject<Chess>} game
 */
export const clearGame = (game: React.MutableRefObject<Chess>) => {
    game.current.clear();
}

/**
 * Делает ход в текущей игре
 *
 * @param {React.MutableRefObject<Chess>} game
 * @param {string} from
 * @param {string} to
 * @param {?string} [promotion]
 */
export const makeGameMove = (game: React.MutableRefObject<Chess>, from: string, to: string, promotion?: string) => {
    game.current.move({from, to, promotion});
}

/**
 * Возвращает цвет текущего хода
 *
 * @param {React.MutableRefObject<Chess>} game
 * @returns {Color}
 */
export const getGameTurn = (game: React.MutableRefObject<Chess>): Color => {
    return game.current.turn();
}

/**
 * Метод для расчёта рейтинга Эло
 *
 * @param {number} currentRating
 * @param {number} puzzleRating
 * @param {boolean} isSolved
 * @returns {number}
 */
export const calculateElo = (currentRating: number, puzzleRating: number, isSolved: boolean): number => {
    const K = 32; // коэффициент для корректировки рейтинга
    const expectedScore = 1 / (1 + Math.pow(10, (puzzleRating - currentRating) / 400));
    const score = isSolved ? 1 : 0;
    return Math.round(currentRating + K * (score - expectedScore));
};