/**
 * Разделяет список ходов на ходы компьютера и ходы пользователя.
 *
 * @param {string[]} moves - Массив строк, представляющих ходы в формате шахматной нотации.
 * @returns {[string[], string[]]} - Массив, содержащий два массива: 
 *                                  первый — ходы компьютера, 
 *                                  второй — ходы пользователя.
 */
export const getAiAndUserMoves = (moves: string[]): [string[], string[]] => {
    const aiMoves = [];
    const userMoves = [];
    
    for (let i = 0; i < moves.length; i++) {
        if (i % 2 === 0) aiMoves.push(moves[i]);
        else userMoves.push(moves[i]);
    }
    
    return [aiMoves, userMoves];
}


/**
 * Делит ход в нотации Клетка1Клетка2 на две соответствующие клетки
 *
 * @param {string} move - Ход в формате "Клетка1Клетка2" (например, "e2e4")
 * @returns {[string, string]} - Возвращает массив из двух клеток
 */
export const sliceMoveIntoTwo = (move: string): [string, string] => {
    return [move.slice(0, 2), move.slice(2, 4)];
}



