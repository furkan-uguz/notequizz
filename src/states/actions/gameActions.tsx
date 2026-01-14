import { Dispatch } from 'redux';
import Action from '../../utils/Action';
import ActionTypes from '../../utils/Types';
import { gameState, initialize } from '../reducers/gameReducer';
import { dispatcher } from '..';
import { GameStatus } from '../../utils/Const';


export const setGameLoading = (state: boolean) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.isLoading = state;

    dispatcher(ActionTypes.GAME_LOADING, payload, dispatch);
}

export const setPoint = (state: number) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.point = state;

    dispatcher(ActionTypes.GAME_SET_USER_POINT, payload, dispatch);
}

export const setGameStatus = (status: GameStatus) => (dispatch: Dispatch<Action>) => {
    const payload: gameState = initialize;
    payload.gameStatus = status;

    dispatcher(ActionTypes.GAME_CHANGE_STATUS, payload, dispatch);
}