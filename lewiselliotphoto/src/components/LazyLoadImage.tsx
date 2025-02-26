import { useEffect, useRef, useState } from "react";

import './lazyLoadImage.css'

interface LazyLoadImageProps {
    preview: string; ///< A small but fast to load image (blurred)
    medium: string; ///< A medium sized image, suitable for use in a gallery view
    large: string; ///< A large version of the image, for full-screen view
    description: string; ///< A description to use as alt text
    style: object; ///< The styling parameters
    maxMediumSize?: number; ///< The size above which the large version of the image should be used  
}


const LazyLoadImage = (
    {
        preview,
        medium,
        large,
        description,
        style,
        maxMediumSize = 640,
    }: LazyLoadImageProps
) => {

    const ref = useRef<HTMLDivElement | null>(null);

    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });

    const [previewImage, setPreviewImage] = useState<any>(null);
    const [mediumImage, setMediumImage] = useState<any>(null);
    const [largeImage, setLargeImage] = useState<any>(null);
    
    const [previewActive, setPreviewActive] = useState<boolean>(false);
    const [mediumActive, setMediumActive] = useState<boolean>(false);
    const [largeActive, setLargeActive] = useState<boolean>(false);


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
        
        return () => observer.disconnect();

    }, [ref]);

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

        if (previewImage === null) {
            fetchImage(preview, (image: any) => {
                setPreviewImage(image);
            });
            return;
        }

        if (mediumImage === null) {
            fetchImage(medium, (image: any) => {
                setMediumImage(image);
            });
            return;
        }

        if (largeImage === null && dimensions.width > maxMediumSize) {
            fetchImage(large, (image: any) => {
                setLargeImage(image);
            });
            return;
        }

    }, [
        dimensions,
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
                    transition: 'opacity 1s'
                };

                if (!previewImage) {
                    theStyle = {
                        ...theStyle,
                        opacity: 0
                    }
                }

                return theStyle;
            })()}
        >
            {previewImage && makeImage(previewImage, 0, previewActive, setPreviewActive, 'loading')}
            {mediumImage && makeImage(mediumImage, 1, mediumActive, setMediumActive)}
            {largeImage && makeImage(largeImage, 2, largeActive, setLargeActive)}
        </div>
    )
};

export default LazyLoadImage;