import { state } from '.';
import Action from '../../utils/Action';
import { GameStatus } from '../../constants/GameStatus';
import { Constant } from '../../constants/Constant';
import { ActionType } from '../../constants/ActionType';

export interface gameState extends state {
    isLoading: boolean | false,
    gameStatus: GameStatus,
    point: number,
    correct: number,
    wrong: number,
    total: number,
    streak: number,
    totalStreak: number
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
    total: 0,
    streak: 0,
    totalStreak: 0
}

const defaultInit: gameState = {
    isInit: false,
    isLoading: true,
    gameStatus: GameStatus.START,
    point: Constant.DEFAULT_POINT,
    correct: 0,
    wrong: 0,
    total: 0,
    streak: 0,
    totalStreak: 0
}

const authReducer = (state: gameState = initialize, action: Action) => {
    let newState: gameState = { ...state };
    newState.isInit = true;
    switch (action.type) {
        case ActionType.GAME_LOADING:
            newState.isLoading = action.payload.isLoading;
            break;
        case ActionType.GAME_SET_USER_POINT:
            newState.point += action.payload.point;
            newState.correct += action.payload.type == Constant.GAINED_POINT ? 1 : 0;
            newState.wrong += action.payload.type == Constant.DEFAULT_POINT ? 1 : 0;
            newState.total = newState.correct + newState.wrong;
            break;
        case ActionType.GAME_CHANGE_STATUS:
            newState.gameStatus = action.payload.gameStatus;
            break;
        case ActionType.GAME_REFRESH:
            newState = defaultInit;
            newState.isInit = true;
            break;
        case ActionType.GAME_SET_STREAK:
            newState.streak = action.payload.streak;
            newState.totalStreak += action.payload.streak >= 2 ? 1 : 0;
            break;
        default:
            return state;
    }
    return newState;
}

export default authReducer;