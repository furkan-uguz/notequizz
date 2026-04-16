import { useEffect, useRef } from 'react';
import { connect, useSelector } from 'react-redux';
import { setVideoLoading } from '../states/actions/contentAction';
import { StateType } from '../states/reducers';
import Flex from './Flex';
import { cn } from '../lib/Util';

interface IBackground extends React.PropsWithChildren {
    setVideoLoading: (loading: boolean) => void;
    blurBackground?: boolean;
}

const Background = ({...props}: IBackground) => {
    const content = useSelector((state: StateType) => state.content);
    const mainVideoRef = useRef<HTMLDivElement>(null);
    const mainThemeSoundRef = useRef<HTMLDivElement>(null);
    const initRef = useRef(false);

    useEffect(() => {
        if (!initRef.current) {
            const initialize = () => {
                console.log("Background Initializing...");
                content.backgroundVideo!.className = 'bg-video';
                content.backgroundVideo!.autoplay = true;
                content.backgroundVideo!.muted = true;
                content.backgroundVideo!.playsInline = true;
                content.backgroundVideo!.loop = true;
                content.backgroundVideo!.preload = 'auto';
                content.backgroundVideo!.play();
                mainVideoRef.current!.append(content.backgroundVideo!);
            }
            initialize();
            initRef.current = true;
        }
    }, [content]);

    return (
        <>
            {/* Video Arkaplan Katmanı: Blur sadece buraya uygulanır */}
            <div 
                className={cn(
                    "main-bg-video main-bg-opacity transition-all duration-1000 select-none overflow-hidden -z-10 fixed inset-0", 
                    props.blurBackground ? "blur-xl scale-110" : "blur-0"
                )} 
                ref={mainVideoRef} 
            />

            {/* UI İçerik Katmanı: Bu katman her zaman net kalır */}
            <div className="relative z-10">
                <Flex direction='col' mxAuto={true} align='center' justify='center' className='min-h-screen'>
                    {props.children}
                </Flex>
            </div>
            
            <div ref={mainThemeSoundRef} />
        </>
    );
}

const mapStateToProps = () => ({})
const mapDispatchToProps = { setVideoLoading };

const ConnectedBackground = connect(mapStateToProps, mapDispatchToProps)(Background);

export default ConnectedBackground;