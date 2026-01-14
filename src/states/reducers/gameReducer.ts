import { state } from '.';
import Action from '../../utils/Action';
import { GameStatus } from '../../utils/Const';
import ActionTypes from '../../utils/Types';

export interface gameState extends state {
    isLoading: boolean | false,
    gameStatus: GameStatus,
    point: number,
    correctAnswer: number,
}

export const initialize: gameState = {
    isInit: false,
    isLoading: true,
    gameStatus: GameStatus.START,
    point: 0,
    correctAnswer: 0,
}

const authReducer = (state: gameState = initialize, action: Action) => {
    let newState: gameState = { ...state };
    newState.isInit = true;
    switch (action.type) {
        case ActionTypes.GAME_LOADING:
            newState.isLoading = action.payload.isLoading;
            break;
        case ActionTypes.GAME_SET_USER_POINT:
            newState.point = action.payload.point;
            newState.correctAnswer += action.payload.point > 0 ? 1 : 0;
            break;
        case ActionTypes.GAME_CHANGE_STATUS:
            newState.gameStatus = action.payload.gameStatus;
            break;
        case ActionTypes.GAME_REFRESH:
            newState = { ...initialize };
            newState.isInit = true;
            break;
        default:
            return state;
    }
    return newState;
}

export default authReducer;