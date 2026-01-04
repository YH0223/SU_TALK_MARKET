let loaderPromise;

export function loadKakaoOnce(appKey) {
    if (window.kakao?.maps) return Promise.resolve();
    if (loaderPromise) return loaderPromise;
    if (!appKey) return Promise.reject("Kakao AppKey 없음");

    loaderPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
        s.onload = () => window.kakao.maps.load(resolve);
        s.onerror = (e) => reject(e);
        document.head.appendChild(s);
    });

    return loaderPromise;
}