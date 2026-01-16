import { state } from '.';
import Action from '../../utils/Action';
import ActionTypes from '../../utils/Types';

export interface contentState extends state {
    isVideoLoaded: boolean;
    isFontLoaded: boolean;
    isMusicLoaded: boolean;
    isFingerPrintInited: boolean;
    isLoading: boolean;
    loadingBar: number;
    backgroundVideo: HTMLVideoElement | null;
    backgroundMusic: HTMLAudioElement | null;
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
    backgroundMusic: null,
}

const contentReducer = (state: contentState = initialize, action: Action) => {
    var newState: contentState = { ...state };
    newState.isInit = true;
    switch (action.type) {
        case ActionTypes.CONTENT_LOADING:
            newState.isLoading = action.payload.isLoading
            break;
        case ActionTypes.CONTENT_VIDEO_LOADING:
            newState.isVideoLoaded = action.payload.isVideoLoaded;
            break;
        case ActionTypes.CONTENT_FONT_LOADING:
            newState.isFontLoaded = action.payload.isFontLoaded;
            break;
        case ActionTypes.CONTENT_LOADING_BAR:
            newState.loadingBar = action.payload.loadingBar;
            break;
        case ActionTypes.CONTENT_FINGERPRINT_INIT:
            newState.isFingerPrintInited = action.payload.isFingerPrintInited;
            break;
        case ActionTypes.CONTENT_SET_VIDEO:
            newState.backgroundVideo = action.payload.backgroundVideo;
            break;
        case ActionTypes.CONTENT_MUSIC_LOADING:
            newState.isMusicLoaded = action.payload.isMusicLoaded;
            break;
        case ActionTypes.CONTENT_SET_MUSIC:
            newState.backgroundMusic = action.payload.backgroundMusic;
            break;
        case ActionTypes.CONTENT_REFRESH:
            newState = { ...initialize };
            newState.isInit = true;
            break;
        default:
            return state;
    }
    return newState;
}

export default contentReducer;