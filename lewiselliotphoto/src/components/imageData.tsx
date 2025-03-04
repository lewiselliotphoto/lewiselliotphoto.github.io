interface ImageData {
    file_id: string;
    extension: string;
    description: string;
    width: number;
    height: number;
    focus?: number[];
}

export default ImageData;