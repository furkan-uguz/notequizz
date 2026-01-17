export enum ContentList {
    BG_VIDEO_SRC = "/note_background.mp4",
    BG_THEME_MUSIC = "/theme.ogg"
}
export enum GameStatus {
    START,
    PLAYING,
    EXERCISING,
    END,
}
const Constants = {
    APP_NAME: "NoteQuizz",
    AUTH_USER: "USER",
    GUEST_USER: "GUEST",
    START_BUTTON: "Start Game",
    EXERCISE_BUTTON: "Exercise Mode",
    SETTINGS_BUTTON: "Settings",
    HIGH_SCORES_BUTTON: "High Scores",
    GAME_DURATION_MIN:  60,
    GAME_DURATION_MAX: 300,
    GAINED_POINT: 1,
}

export default Constants;