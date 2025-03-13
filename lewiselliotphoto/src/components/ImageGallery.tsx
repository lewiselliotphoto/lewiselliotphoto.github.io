import { useEffect, useState } from "react";

import LazyLoadImage from "./LazyLoadImage";
import ImageData from "./imageData";
import AnimateOnScroll from "./AnimateOnScroll";
import ImageSlideshow from '../components/ImageSlideshow';

import './imageGallery.css'

interface ImageGalleryProps {
    images: ImageData[];
}

const ImageGallery = (
    {
        images
    }: ImageGalleryProps
) => {

    const [aspectRatio, setAspectRatio] = useState<number>(1.0);
    const [slideshowOpen, setSlideshowOpen] = useState<boolean>(false);
    const [currentIndex, setCurrentIndex] = useState<number>(0);

    useEffect(() => {
        let ratio = 0.0;
        for (const photoData of images) {
            ratio += photoData.width / photoData.height; 
        }

        ratio /= images.length;
        setAspectRatio(ratio);
    },
    [images]);

    useEffect(() => {

        if (slideshowOpen) {
            document.body.classList.add("menuOpen");
        }
        else {
            document.body.classList.remove("menuOpen");
        }

    }, [slideshowOpen]);

    return (
        <div
            className="imageGallery"
        >
            {
                images.map((photoData, index) => (
                    <div
                        key={`photo${index}`}
                        className={"imageGalleryPhoto"}
                        onClick={() => {
                            setCurrentIndex(index);
                            setSlideshowOpen(true);
                        }}
                    >
                        <AnimateOnScroll
                            style={{}}
                        >
                            <LazyLoadImage
                                preview={`${photoData.file_id}.preview.${photoData.extension}`}
                                medium={`${photoData.file_id}.medium.${photoData.extension}`}
                                large={`${photoData.file_id}.large.${photoData.extension}`}
                                description={photoData.description}
                                style={{
                                    width: '100%',
                                    aspectRatio: aspectRatio // photoData.width / photoData.height,
                                }}
                            />
                        </AnimateOnScroll>
                    </div>
                ))
            }
            {slideshowOpen &&
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 9999,
                        backgroundColor: 'white',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <ImageSlideshow
                        images={images}
                        hasControls={true}
                        autoScroll={false}
                        currentIndex={currentIndex}
                        setCurrentIndex={setCurrentIndex}
                        style={{
                            // top: `calc((100vh - min(100vh, (100vw / ${aspectRatio}))) / 2)`,
                            // left: 0,
                            width: '100vw',
                            height: `min(100vh, (100vw / ${aspectRatio}) + 70px)`,
                        }}
                    />
                    <div
                        className="imageGalleryCloseButton"
                        onClick={() => {setSlideshowOpen(false)}}
                    ></div>
                </div>
            }
        </div>
    );
};

export default ImageGallery;