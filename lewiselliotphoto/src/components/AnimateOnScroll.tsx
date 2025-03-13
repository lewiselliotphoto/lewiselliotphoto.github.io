import { ReactNode, useEffect, useRef, useState } from "react";

import './animateOnScroll.css';

interface AnimateOnScrollProps {
    children?: ReactNode;
    classes?: string[];
    style: object; ///< The styling parameters
}

const AnimateOnScroll = ({
    children,
    classes = [],
    style
}: AnimateOnScrollProps) => {
    
    const ref = useRef<HTMLDivElement | null>(null);

    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    const [inViewport, setInViewport] = useState<boolean>(false);
    const [delayFraction, setDelayFraction] = useState<number>(0);

    // Update the dimensions when the element is resized
    useEffect(() => {

        if (!ref.current) {
            return;
        }

        const onResize = () => {
       
            if (!ref.current) {
                return;
            }

            const boundingRect = ref.current.getBoundingClientRect();
            const { width, height } = boundingRect;
            setDimensions({
                width: Math.round(width),
                height: Math.round(height)
            });
        };
    
        const observer = new ResizeObserver(onResize);
        observer.observe(ref.current);
        onResize();
        
        return () => observer.disconnect();

    }, [ref]);
    
    // Set visibility state in the viewport
    useEffect(() => {

        const onViewportChanged = () => {

            if (inViewport) {
                return;
            }

            if (!ref.current) {
                setInViewport(false);
                return;
            }

            const boundingRect = ref.current.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            setInViewport(
                boundingRect.top >= -dimensions.height &&
                boundingRect.left >= -dimensions.width &&
                boundingRect.bottom <= windowHeight + dimensions.height &&
                boundingRect.right <= windowWidth + dimensions.width
            );

            setDelayFraction((boundingRect.left + boundingRect.right) / (2 * windowWidth));
        };

        window.removeEventListener('scroll', onViewportChanged);
        window.removeEventListener('resize', onViewportChanged);
        window.addEventListener('scroll', onViewportChanged, { passive: true });
        window.addEventListener('resize', onViewportChanged, { passive: true });
        onViewportChanged();
        
        return () => {
            window.removeEventListener('scroll', onViewportChanged);
            window.removeEventListener('resize', onViewportChanged);
        }

    }, [dimensions, inViewport, ref]);
    
    
    return (
        <div
            ref={ref}
            className={classes?.concat(inViewport ? 'inViewport' : 'notInViewport').join(' ')}
            style={{
                ...style,
                ...{
                    animationDelay: `${delayFraction * 0.2}s`
                }
            }}
        >
            {children}
        </div>
    )
};

export default AnimateOnScroll;