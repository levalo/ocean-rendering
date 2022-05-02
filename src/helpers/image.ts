export const loadImage = (src: string) => new Promise((resolve: (img: HTMLImageElement) => void, reject: () => void) => {
    const img = new Image();

    img.onload = () => {
        resolve(img);
    };

    img.onerror = () => {
        reject();
    }

    img.src = src;
});