import { FC } from "react";

interface IBoxInterface extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    mxAuto?: boolean;
}

const containerSize = {
    'sm': 'sm:container',
    'md': 'md:container',
    'lg': 'lg:container',
    'xl': 'xl:container',
    '2xl': '2xl:container',
}

const Box: FC<IBoxInterface> = (props: IBoxInterface) => {

    const size = props.size !== undefined ? containerSize[props.size] : 'container';
    const mxAuto = props.mxAuto ? ' mx-auto' : '';
    const classN = props.className !== undefined ? ' ' + props.className : '';
    const clazz = size + mxAuto + classN;
    return (
        <div className={clazz} 
            onTransitionEnd={props.onTransitionEnd} 
            onAnimationEnd={props.onAnimationEnd}
            onClick={props.onClick}>
            {props.children}
        </div>
    );
};

export default Box;