import LazyLoadImage from "./LazyLoadImage";

import './imageGallery.css'

interface ImageData {
    file_id: string;
    extension: string;
    description: string;
    width: number;
    height: number;
}

interface ImageGalleryProps {
    images: ImageData[];
}

const ImageGallery = (
    {
        images
    }: ImageGalleryProps
) => {

    return (
        <div
            className="imageGallery"
        >
            {
                images.map((photoData, index) => (
                    <div
                        key={`photo${index}`}
                        className="imageGalleryPhoto"
                    >
                        <LazyLoadImage
                            preview={`${photoData.file_id}.preview.${photoData.extension}`}
                            medium={`${photoData.file_id}.medium.${photoData.extension}`}
                            large={`${photoData.file_id}.large.${photoData.extension}`}
                            description={photoData.description}
                            style={{
                                width: '100%',
                                aspectRatio: photoData.width / photoData.height,
                            }}
                        />
                    {photoData.description && (
                        <div
                            className="imageGalleryDescription"
                        >
                            {photoData.description}
                        </div>
                    )}
                    </div>
                ))
            }
        </div>
    );
};

export default ImageGallery;