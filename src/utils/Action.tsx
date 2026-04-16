import { ActionType } from '../constants/ActionType';

interface Action {
    type: ActionType,
    payload: any;
}

export default Action;