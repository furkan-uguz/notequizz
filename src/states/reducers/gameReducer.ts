import { state } from '.';
import Action from '../../utils/Action';
import Constants, { GameStatus } from '../../utils/Const';
import ActionTypes from '../../utils/Types';

export interface gameState extends state {
    isLoading: boolean | false,
    gameStatus: GameStatus,
    point: number,
    correct: number,
    wrong: number,
    total: number
}

export interface answerState {
    point: number,
    type: number
}

export const initialize: gameState = {
    isInit: false,
    isLoading: true,
    gameStatus: GameStatus.START,
    point: 0,
    correct: 0,
    wrong: 0,
    total: 0
}

const defaultInit: gameState = {
    isInit: false,
    isLoading: true,
    gameStatus: GameStatus.START,
    point: Constants.DEFAULT_POINT,
    correct: 0,
    wrong: 0,
    total: 0
}

const authReducer = (state: gameState = initialize, action: Action) => {
    let newState: gameState = { ...state };
    newState.isInit = true;
    switch (action.type) {
        case ActionTypes.GAME_LOADING:
            newState.isLoading = action.payload.isLoading;
            break;
        case ActionTypes.GAME_SET_USER_POINT:
            newState.point += action.payload.point;
            newState.correct += action.payload.type == Constants.GAINED_POINT ? 1 : 0;
            newState.wrong += action.payload.type == Constants.DEFAULT_POINT ? 1 : 0;
            newState.total = newState.correct + newState.wrong;
            break;
        case ActionTypes.GAME_CHANGE_STATUS:
            newState.gameStatus = action.payload.gameStatus;
            break;
        case ActionTypes.GAME_REFRESH:
            newState = defaultInit;
            newState.isInit = true;
            break;
        default:
            return state;
    }
    return newState;
}

export default authReducer;