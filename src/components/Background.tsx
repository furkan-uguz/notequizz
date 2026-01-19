import { useEffect, useRef } from 'react';
import { connect, useSelector } from 'react-redux';
import { setVideoLoading } from '../states/actions/contentActions';
import { StateType } from '../states/reducers';
import Flex from './Flex';

interface IBackground extends React.PropsWithChildren {
    setVideoLoading: Function;
}

const Background = ({ ...props }: IBackground) => {
    const content = useSelector((state: StateType) => state.content);
    const mainVideoRef = useRef<HTMLDivElement>(null);
    const mainThemeSoundRef = useRef<HTMLDivElement>(null);
    let init = false;

    useEffect(() => {
        if (!init) {
            initialize();
        }
    }, []);

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

        content.backgroundMusic!.autoplay = true;
        content.backgroundMusic!.muted = false;
        content.backgroundMusic!.loop = true;
        content.backgroundMusic!.controls = false;
        content.backgroundMusic!.volume = 0.5;
        content.backgroundMusic!.play();
        mainThemeSoundRef.current!.append(content.backgroundMusic!);
        init = true;
    }

    return (
        <>
            <div className='main-bg-video main-bg-opacity opacity-anim select-none overflow-hidden' ref={mainVideoRef}>
                <Flex direction='col' mxAuto={true} align='center' justify='center' className='h-screen'>
                    <Flex>{props.children}</Flex>
                </Flex>
            </div>
            <div ref={mainThemeSoundRef}>
            </div>
        </>
    );
}

const mapStateToProps = () => ({})
const mapDispatchToProps = { setVideoLoading };

export default connect(mapStateToProps, mapDispatchToProps)(Background);