import { useEffect, useRef, useState } from "react";

import './lazyLoadImage.css'

interface LazyLoadImageProps {
    preview: string; ///< A small but fast to load image (blurred)
    medium: string; ///< A medium sized image, suitable for use in a gallery view
    large: string; ///< A large version of the image, for full-screen view
    description: string; ///< A description to use as alt text
    style: object; ///< The styling parameters
    focus?: [number, number]; /// The x & y fractional position at which the image should be focused
    maxMediumSize?: number; ///< The size above which the large version of the image should be used
    currentIndex?: number; ///< The (optional) current index of a parent slideshow  
    onMediumLoaded?: () => void; ///< Callback function when the medium image is loaded
}


const LazyLoadImage = (
    {
        preview,
        medium,
        large,
        description,
        style,
        focus = [0.5, 0.5],
        maxMediumSize = 300,
        currentIndex = 0,
        onMediumLoaded = undefined
    }: LazyLoadImageProps
) => {

    const loadMargin = 100; ///< Images will be loaded when they are within this distance of the viewport (offscreen)

    const ref = useRef<HTMLDivElement | null>(null);

    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    const [inViewport, setInViewport] = useState<boolean>(false);

    const [previewImage, setPreviewImage] = useState<any>(null);
    const [mediumImage, setMediumImage] = useState<any>(null);
    const [largeImage, setLargeImage] = useState<any>(null);
    
    const [previewActive, setPreviewActive] = useState<boolean>(false);
    const [mediumActive, setMediumActive] = useState<boolean>(false);
    const [largeActive, setLargeActive] = useState<boolean>(false);


    const setMediumActiveWithCallback = () => {
        setMediumActive(true);

        if (onMediumLoaded) {
            onMediumLoaded();
        }
    };

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

    }, [ref, currentIndex]);

    // Set visibility state in the viewport
    useEffect(() => {

        const onViewportChanged = () => {

            // Once in the viewport the images should keep loading even if now out of the viewport
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
                boundingRect.top >= -2*dimensions.width - loadMargin &&
                boundingRect.left >= -2*dimensions.height - loadMargin &&
                boundingRect.bottom <= windowHeight + 2*dimensions.height + loadMargin &&
                boundingRect.right <= windowWidth + 2*dimensions.width + loadMargin
            );
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

    }, [dimensions, inViewport, ref, currentIndex]);

    useEffect(() => {

        const fetchImage = async (imageFile: string,
                                  callback: (image: any) => void) => {
            await import(`../content/${imageFile}`)
                .then((response) => {
                    callback(response.default);
                })
                .catch((err) => {
                    console.error(err);
                })
        }

        if (previewImage === null && inViewport) {
            fetchImage(preview, (image: any) => {
                setPreviewImage(image);
            });
            return;
        }

        if (mediumImage === null && inViewport) {
            fetchImage(medium, (image: any) => {
                setMediumImage(image);
            });
            return;
        }

        if (largeImage === null && inViewport && dimensions.width > maxMediumSize) {
            fetchImage(large, (image: any) => {
                setLargeImage(image);
            });
            return;
        }

    }, [
        dimensions,
        inViewport,
        maxMediumSize,
        preview, previewImage, setPreviewImage,
        medium, mediumImage, setMediumImage,
        large, largeImage, setLargeImage,
    ]);

    const makeImage = (
        src: string,
        zIndex: number,
        active: boolean,
        setActive: any,
        className: string = ''
    ) => {
        return (
            <img
                src={src}
                alt={description}
                onLoad={setActive}
                onContextMenu={(e) => {e.preventDefault()}}
                className={className}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: zIndex,
                    opacity: active ? 1 : 0,
                    transition: 'opacity 1s',
                    objectFit: 'cover',
                    userSelect: 'none',
                    objectPosition: `${100 * focus[0]}% ${100 * focus[1]}%`
                }}
            />
        )
    };

    return (
        <div
            ref={ref}
            style={(() => {
                let theStyle: any = {
                    ...style,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'opacity 0.5s'
                };
                
                if (!previewImage) {
                    theStyle = {
                        ...theStyle,
                        backgroundColor: '#EEEEEE',
                    }
                }
                
                return theStyle;
            })()}
        >
            {previewImage && makeImage(previewImage, 0, previewActive, setPreviewActive, 'loading')}
            {mediumImage && makeImage(mediumImage, 1, mediumActive, setMediumActiveWithCallback)}
            {largeImage && makeImage(largeImage, 2, largeActive, setLargeActive)}
        </div>
    )
};

export default LazyLoadImage;