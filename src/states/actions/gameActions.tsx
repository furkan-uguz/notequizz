import { Dispatch } from 'redux';
import Action from '../../utils/Action';
import ActionTypes from '../../utils/Types';
import { answerState, gameState, initialize } from '../reducers/gameReducer';
import { dispatcher } from '..';
import { GameStatus } from '../../utils/Const';


export const setGameLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.isLoading = state;

    dispatcher(ActionTypes.GAME_LOADING, payload, dispatch);
}

export const setPoint = (answer: answerState) => (dispatch: Dispatch<Action>) => {
    dispatcher(ActionTypes.GAME_SET_USER_POINT, answer, dispatch);
}

export const setResetGame = () => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    
    dispatcher(ActionTypes.GAME_REFRESH, payload, dispatch);
}

export const setGameStatus = (status: GameStatus) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.gameStatus = status;

    dispatcher(ActionTypes.GAME_CHANGE_STATUS, payload, dispatch);
}