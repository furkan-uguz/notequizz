import React, { FC, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, useNavigate } from 'react-router-dom'
import { Provider, connect, useSelector } from 'react-redux';
import { IAddOptions, Loader, Resource } from 'resource-loader';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import WebFont from 'webfontloader';
import Router from './router';
import AuthContext, { AuthContextProvider } from './contexts/AuthContext';
import store from './states';
import { StateType } from './states/reducers';
import { setGameLoading } from './states/actions/gameActions';
import { setFingerprintInitStatus, setVideoLoading, setFontLoading, setVideoContent, setMusicContent, setMusicLoading } from './states/actions/contentActions';
import Constant, { ContentList } from './utils/Const';
import Loading from './pages/Loading';
import { HeroUIProvider } from '@heroui/react';

interface IMain {
  setGameLoading: Function
  setVideoLoading: Function
  setFontLoading: Function
  setFingerprintInitStatus: Function
  setVideoContent: Function
  setMusicContent: Function
  setMusicLoading: Function
}

const App: FC<IMain> = ({ ...props }: IMain): JSX.Element => {
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthContextProvider>();
  const [authLocale, setAuthLocale] = useState(Constant.GUEST_USER);
  const [componentsInit, setComponentsInit] = useState(false);
  const content = useSelector((state: StateType) => state.content);
  const game = useSelector((state: StateType) => state.game);
  const navigate = useNavigate();
  const loader = new Loader();
  let init = false;

  useEffect(() => {
    if (!init) {
      initialize();
    }
  }, []);

  useEffect(() => {
    if (content.isInit && game.isInit)
      handleLoading();

  }, [content, game]);

  const initialize = () => {
    console.log("Initialization started");
    initFingerPrint();
    setAuthLevel();
    loadFonts();
    loadVideoContent();
    loadMusics();
    init = true;
  }

  const handleLoading = () => {
    if (!componentsInit && !content.isLoading && !game.isLoading) {// Add here authorization flag
      if (content.isFingerPrintInited && content.isFontLoaded && content.isMusicLoaded && content.isVideoLoaded) {
        setComponentsInit(true);
        console.log("Components ready!");
      }
    }
  }

  const setAuthLevel = () => {
    if (game.isLoading) {
      buildAuthenticatedUser(Constant.GUEST_USER, []);
      props.setGameLoading(false);
    }
  }

  const loadFonts = () => {
    if (!content.isFontLoaded) {
      WebFont.load({
        custom: {
          families: ['Niconne-Regular'],
          urls: ['./css/index.css']
        },
        active: () => {
          props.setFontLoading(true);
        }
      });
    }
  }

  const loadVideoContent = () => {
    if (!content.isVideoLoaded) {
      console.log("Video loader proccess starting...");
      const options: IAddOptions = {
        url: ContentList.BG_VIDEO_SRC,
        parentResource: new Resource("resource", {
          url: './assets'
        }),
        crossOrigin: 'anonymous',
        loadType: 2,
        xhrType: 'blob',
      };

      loader.use((resource, next) => {
        // Eğer iOS mime-type'ı boş bırakırsa manuel ata
        if (resource.data instanceof Blob && !resource.data.type) {
          resource.data = resource.data.slice(0, resource.data.size, 'video/mp4');
        }
        next();
      });

      loader.add(options).load((_loader, resource) => {
        props.setVideoContent(resource[ContentList.BG_VIDEO_SRC]?.data);
        props.setVideoLoading(true);
      });
    }
  }

  const loadMusics = () => {
    if (!content.isMusicLoaded) {
      const options: IAddOptions = {
        url: ContentList.BG_THEME_MUSIC,
        crossOrigin: 'anonymous',
        loadType: 3,
        xhrType: 'blob',
        parentResource: new Resource("resource", {
          url: './assets',
        }),
      }

      loader.add(options).load((_loader, resource) => {
        props.setMusicContent(resource[ContentList.BG_THEME_MUSIC]?.data);
        props.setMusicLoading(true);
      });
    }
  }

  const initFingerPrint = () => {
    if (!content.isFingerPrintInited) {
      const fpPromise = FingerprintJS.load();
      (async () => {
        const fp = await fpPromise;
        const result = await fp.get();
        localStorage.setItem(process.env.VITE_REACT_APP_FINGERPRINT_NAME!, result.visitorId);
      })();
      props.setFingerprintInitStatus(true);
    }
  }

  const buildAuthenticatedUser = (authType: string, user: any) => {
    let authUser: AuthContextProvider = {
      authType: authType,
      authenticatedUser: {
        id: 0,
        fullname: "",
        username: "",
        email: "",
        roles: []
      }
    }
    if (authType === Constant.AUTH_USER) {
      authUser.authenticatedUser.id = user.id;
      authUser.authenticatedUser.fullname = user.fullname;
      authUser.authenticatedUser.username = user.username;
      authUser.authenticatedUser.email = user.email;
      authUser.authenticatedUser.roles = user.roles;
    }

    setAuthLocale(authType);
    setAuthenticatedUser(authUser);
  }

  return (!componentsInit ? <><Loading /></> :
    <>
      <HelmetProvider>
        <AuthContext.Provider value={authenticatedUser!}>
          <HeroUIProvider navigate={navigate}>
            <Router auth={authLocale} />
          </HeroUIProvider>
        </AuthContext.Provider>
      </HelmetProvider>
    </>
  );
}
const mapDispatchToProps = {
  setGameLoading,
  setVideoLoading,
  setFontLoading,
  setFingerprintInitStatus,
  setVideoContent,
  setMusicContent,
  setMusicLoading
};
const ConnectedApp = connect(null, mapDispatchToProps)(App);

const AppBuilder = () => {
  return (
    <Provider store={store}>
      <React.StrictMode>
        <BrowserRouter>
          <ConnectedApp />
        </BrowserRouter>
      </React.StrictMode>
    </Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<AppBuilder />);