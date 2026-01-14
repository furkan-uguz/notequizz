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

    let size = props.size !== undefined ? containerSize[props.size] : 'container';
    let mxAuto = props.mxAuto ? ' mx-auto' : '';
    let classN = props.className !== undefined ? ' ' + props.className : '';
    let clazz = size + mxAuto + classN;
    return (
        <div className={clazz} 
            onTransitionEnd={props.onTransitionEnd} 
            onAnimationEnd={props.onAnimationEnd}>
            {props.children}
        </div>
    );
};

export default Box;