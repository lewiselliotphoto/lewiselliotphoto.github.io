import { useEffect, useState } from "react";

interface DelayedLoadImageProps {
    imageId: string;
    extension: string;
    fullWidth: number;
    fullHeight: number;
    width: number;
    description: string;
}

enum State {
    Preview = 0,
    Medium = 1,
    Large = 2
}


const STATE_TO_TAG = new Map<State, string>();
STATE_TO_TAG.set(State.Preview, 'preview');
STATE_TO_TAG.set(State.Medium, 'medium');
STATE_TO_TAG.set(State.Large, 'large');


// The threshold size below which the medium sized image is sufficient
// If the element has a size larger than this, then the large image will be loaded.
const MAX_MEDIUM_IMAGE_SIZE = 640;

const DelayedLoadImage = (
    {
        imageId,
        extension,
        fullWidth,
        fullHeight,
        width,
        description
    }: DelayedLoadImageProps
) => {

    const [loadState, setLoadState] = useState<State>(State.Preview);
    const [showState, setShowState] = useState<State | null>(null);
    const [images, setImages] = useState<Map<State, any>>(new Map());
    const height = Math.round(width * (fullHeight / fullWidth));
    const maxSize = Math.max(width, height);

    useEffect(() => {
   
        // Check if load is required
        if (loadState === State.Large && maxSize < MAX_MEDIUM_IMAGE_SIZE) {
            return;
        }
        
        const fetchImage = async () => {
            const tag = STATE_TO_TAG.get(loadState);
            await import(`./content/${imageId}.${tag}.${extension}`)
                .then((response) => {
                    setImages(new Map(images.set(loadState, response.default)));

                    if (showState === null) {
                        setShowState(loadState);
                    }

                    if (loadState < State.Large) {
                        setLoadState(loadState + 1);
                    }
                })
                .catch((err) => {
                    console.error(err);
                })
        }

        fetchImage();
    }, [imageId, extension, loadState, showState, images, maxSize])

    const imageLoaded = (loadedState: State) => {
        if (!showState || loadedState > showState) {
            setShowState(loadedState);
        }
    };

    return (
        <div
            style={{
                position: 'relative',
                width: width,
                height: height,
                textWrap: 'wrap',
                overflowWrap: 'break-word',
                overflow: 'hidden',
            }}
        >
            {
                [State.Preview, State.Medium, State.Large].map((imageState, index) => (
                    images.has(imageState) && (
                        <img
                            key={`image${index}`}
                            src={images.get(imageState)}
                            onLoad={() => imageLoaded(imageState)}
                            alt={description}
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: index,
                                opacity: (showState !== null && showState >= State.Preview) ? 1 : 0,
                                transition: 'opacity 1s',
                                objectFit: 'contain'
                            }}
                        />
                    )
                ))
            }
        </div>
    );
};

export default DelayedLoadImage;
