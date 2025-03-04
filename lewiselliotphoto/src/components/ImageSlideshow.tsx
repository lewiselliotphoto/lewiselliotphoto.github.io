import { useCallback, useEffect, useRef, useState } from "react";

import LazyLoadImage from "./LazyLoadImage";
import ImageData from "./imageData";

import './imageSlideshow.css'

interface ImageGalleryProps {
    images: ImageData[];
    hasControls: boolean; ///< Whether to allow the user to control the slideshow
    autoScroll: boolean; ///< Whether to automatically scroll through the pictures
    style: object; ///< Custom styling parameters
}

const ImageSlideshow = (
    {
        images,
        hasControls,
        autoScroll,
        style
    }: ImageGalleryProps
) => {
   
    const pollIntervalMs = 1000;
    const pauseTimeMs = 5000;

    const ref = useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });


    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loadStates, setLoadStates] = useState<Map<number, boolean>>(new Map());
    const [lastChangeTime, setLastChangeTime] = useState<number>((new Date()).getTime())

    const [manualChanged, setManualChanged] = useState<boolean>(false);

    const getNextIndex = useCallback(() => {
        return (currentIndex + 1) % images.length;
    }, [currentIndex, images.length]);

    const getPreviousIndex = useCallback(() => {
        return (currentIndex + images.length - 1) % images.length;
    }, [currentIndex, images.length]);

    const setCurrentIndexManual = (newIndex: number) => {
        setManualChanged(true); 
        setCurrentIndex(newIndex);

        const timeNow = (new Date()).getTime();
        setLastChangeTime(timeNow);
    }
    
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


    useEffect(() => {
        
        if (!autoScroll) {
            return;
        }

        const updateIndex = () => {

            const timeNow = (new Date()).getTime();

            if ((timeNow - lastChangeTime) <= pauseTimeMs) {
                return;
            }
 
            const nextIndex = getNextIndex();

            // Only move on if loaded the current and next image
            if (loadStates.has(currentIndex) &&
                loadStates.get(currentIndex) &&
                loadStates.has(nextIndex) &&
                loadStates.get(nextIndex)
            ) {
                setManualChanged(false);
                setCurrentIndex(nextIndex);
                setLastChangeTime(timeNow);
            }
        };

        const interval = setInterval(updateIndex, pollIntervalMs);
        return () => {
            clearInterval(interval);
        };
    }, [autoScroll, currentIndex, images.length, loadStates, lastChangeTime, getNextIndex]);

    return (
        <div
            style={style}
            className="imageSlideshowContainer"
        >
            <div
                className="imageSlideshow"
                ref={ref}
            >
                <div
                    className="imageSlideshowSpacer"
                    style={{
                        marginLeft: `-${currentIndex * 100}%`,
                        transition: `margin-left ${manualChanged ? 0.2 : 1}s`
                    }}
                >
                </div>
                {
                    images.map((photoData, index) => (
                        <div
                            className="imageSlideshowPhoto"
                            key={`photo${index}`}
                        >
                            <LazyLoadImage
                                preview={`${photoData.file_id}.preview.${photoData.extension}`}
                                medium={`${photoData.file_id}.medium.${photoData.extension}`}
                                large={`${photoData.file_id}.large.${photoData.extension}`}
                                description={photoData.description}
                                focus={photoData?.focus?.length === 2 ? [photoData.focus[0], photoData.focus[1]] : undefined}
                                currentIndex={currentIndex}
                                onMediumLoaded={() => {
                                    setLoadStates(loadStates.set(index, true));
                                }}
                                style={{
                                    width: dimensions.width,
                                    height: dimensions.height
                                }}
                            />
                        </div>
                    ))
                }
            </div>
            { hasControls &&
                <div
                    className="imageSlideshowControls"
                >
                    <button
                        className="imageSlideshowControlButton"
                        onClick={() => {setCurrentIndexManual(getPreviousIndex())}}
                    >
                    </button>
                    <div
                        className="imageSlideshowLabelContainer"
                    >
                        {
                            images.at(currentIndex)?.description && (
                                <div>
                                    {images.at(currentIndex)?.description}
                                </div>
                            )
                        }
                        <div
                            className="imageSlideshowNumberLabel"
                        >
                            {`${currentIndex + 1} / ${images.length}`}
                        </div>
                    </div>
                    <button
                        className="imageSlideshowControlButton"
                        onClick={() => {setCurrentIndexManual(getNextIndex())}}
                        style={{
                            transform: 'scaleX(-1)'
                        }}
                    >
                    </button>
                </div>
            }
        </div>
    )
}

export default ImageSlideshow;