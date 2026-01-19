export enum ContentList {
    CLOUDINARY_URL = "https://res.cloudinary.com/imagerapp/video/upload/v1768844082/notequizz/",
    BG_VIDEO_SRC = "note_background_i0avb9.mp4",
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
    PLAY_AGAIN_BUTTON: "Play Again",
    MAIN_MENU_BUTTON: "Main Menu",
    STATS_HEADER: "Here The Stats",
    GAME_OVER_HEADER: "Game Over",
    POINTS: "Point(s)",
    CORRECT_ANSWER: "Correct(s)",
    WRONG_ANSWER: "Wrong(s)",
    GAME_DURATION_MIN:  60,
    GAME_DURATION_MAX: 300,
    GAINED_POINT: 1,
    RESET_POINT: -1,
    DEFAULT_POINT: 0,
}

export default Constants;