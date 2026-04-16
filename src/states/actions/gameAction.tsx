import { Dispatch } from 'redux';
import Action from '../../utils/Action';
import { ActionType } from '../../constants/ActionType';
import { answerState, gameState, initialize } from '../reducers/gameReducer';
import { dispatcher } from '..';
import { GameStatus } from '../../constants/GameStatus';


export const setGameLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.isLoading = state;

    dispatcher(ActionType.GAME_LOADING, payload, dispatch);
}

export const setPoint = (answer: answerState) => (dispatch: Dispatch<Action>) => {
    dispatcher(ActionType.GAME_SET_USER_POINT, answer, dispatch);
}

export const setStreak = (streak: number) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.streak = streak;

    dispatcher(ActionType.GAME_SET_STREAK, payload, dispatch);
}

export const setResetGame = () => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    
    dispatcher(ActionType.GAME_REFRESH, payload, dispatch);
}

export const setGameStatus = (status: GameStatus) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.gameStatus = status;

    dispatcher(ActionType.GAME_CHANGE_STATUS, payload, dispatch);
}