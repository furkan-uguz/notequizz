import { state } from '.';
import Action from '../../utils/Action';
import { ActionType } from '../../constants/ActionType';

export interface contentState extends state {
    isVideoLoaded: boolean;
    isFontLoaded: boolean;
    isMusicLoaded: boolean;
    isFingerPrintInited: boolean;
    isLoading: boolean;
    loadingBar: number;
    backgroundVideo: HTMLVideoElement | null;
    isSoundsLoaded: boolean;
}

export const initialize: contentState = {
    isInit: false,
    isVideoLoaded: false,
    isMusicLoaded: false,
    isFontLoaded: false,
    isFingerPrintInited: false,
    isLoading: true,
    loadingBar: 0,
    backgroundVideo: null,
    isSoundsLoaded: false,
}

const contentReducer = (state: contentState = initialize, action: Action) => {
    let newState: contentState = { ...state };
    newState.isInit = true;
    switch (action.type) {
        case ActionType.CONTENT_LOADING:
            newState.isLoading = action.payload.isLoading
            break;
        case ActionType.CONTENT_VIDEO_LOADING:
            newState.isVideoLoaded = action.payload.isVideoLoaded;
            break;
        case ActionType.CONTENT_FONT_LOADING:
            newState.isFontLoaded = action.payload.isFontLoaded;
            break;
        case ActionType.CONTENT_LOADING_BAR:
            newState.loadingBar = action.payload.loadingBar;
            break;
        case ActionType.CONTENT_FINGERPRINT_INIT:
            newState.isFingerPrintInited = action.payload.isFingerPrintInited;
            break;
        case ActionType.CONTENT_SET_VIDEO:
            newState.backgroundVideo = action.payload.backgroundVideo;
            break;
        case ActionType.CONTENT_MUSIC_LOADING:
            newState.isMusicLoaded = action.payload.isMusicLoaded;
            break;
        case ActionType.CONTENT_SOUNDS_LOADING:
            newState.isSoundsLoaded = action.payload.isSoundsLoaded;
            break;
        case ActionType.CONTENT_REFRESH:
            newState = { ...initialize };
            newState.isInit = true;
            break;
        default:
            return state;
    }
    return newState;
}

export default contentReducer;