// src/components/KakaoMap/KakaoMapPicker.jsx
import React, { useEffect, useRef } from "react";
console.log("VITE_KAKAO_MAP_APPKEY =", import.meta.env.VITE_KAKAO_MAP_APPKEY);

const loadKakaoOnce = (() => {
  let p;
  return (rawKey) => {
    const appKey = (rawKey || "").trim();
    if (!appKey) return Promise.reject(new Error("Empty Kakao app key"));
    if (window.kakao?.maps) return Promise.resolve();
    if (p) return p;
    p = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      const qs = new URLSearchParams({
        appkey: appKey,
        autoload: "false",
        libraries: "services",
      }).toString();
      s.src = `https://dapi.kakao.com/v2/maps/sdk.js?${qs}`;
      s.async = true;
      console.log("[KakaoSDK] src =", s.src);
      s.onload = () => window.kakao.maps.load(resolve);
      s.onerror = (e) => {
        console.error("[KakaoSDK] script load error", e);
        reject(e);
      };
      document.head.appendChild(s);
    });
    return p;
  };
})();

export default function KakaoMapPicker({ onSelect }) {
  const ref = useRef(null);
  const appKey = import.meta.env.VITE_KAKAO_MAP_APPKEY;

  // ★ onSelect 재생성으로 인한 재마운트/중복 리스너 방지
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    console.log("[KakaoMapPicker] container size:", rect.width, rect.height);

    if (!appKey) {
      console.error("VITE_KAKAO_MAP_APPKEY 누락");
      return;
    }

    let map, marker, geocoder, clickHandler, ro;

    loadKakaoOnce(appKey)
      .then(() => {
        const { kakao } = window;

        const center = new kakao.maps.LatLng(37.5665, 126.9780);
        map = new kakao.maps.Map(el, { center, level: 3 });

        const tm = new kakao.maps.MapTypeControl();
        map.addControl(tm, kakao.maps.ControlPosition.TOPRIGHT);
        const zm = new kakao.maps.ZoomControl();
        map.addControl(zm, kakao.maps.ControlPosition.RIGHT);

        marker = new kakao.maps.Marker({ map, position: center });
        geocoder = new kakao.maps.services.Geocoder();

        // 초기화 직후 강제 리레이아웃
        setTimeout(() => {
          kakao.maps.event.trigger(map, "resize");
          map.setCenter(center);
        }, 0);

        // ★ 클릭 핸들러를 변수로 보관 → cleanup에서 제거 가능
        clickHandler = (e) => {
          const latlng = e.latLng;
          console.log("[KakaoMapPicker] click:", latlng.getLat(), latlng.getLng());
          marker.setPosition(latlng);
          geocoder.coord2Address(
            latlng.getLng(),
            latlng.getLat(),
            (result, status) => {
              if (status === kakao.maps.services.Status.OK) {
                const addr =
                  result[0].road_address?.address_name ||
                  result[0].address?.address_name ||
                  "";
                console.log("[KakaoMapPicker] picked:", addr);
                // ★ 최신 콜백으로 호출
                onSelectRef.current?.({
                  address: addr,
                  lat: latlng.getLat(),
                  lng: latlng.getLng(),
                });
              }
            }
          );
        };

        kakao.maps.event.addListener(map, "click", clickHandler);

        // ★ 숨김→표시 전환 대응 (선택) ResizeObserver
        if ("ResizeObserver" in window) {
          ro = new ResizeObserver(() => {
            kakao.maps.event.trigger(map, "resize");
          });
          ro.observe(el);
        }
      })
      .catch((e) => console.error("Kakao SDK 로드 실패:", e));

    return () => {
      try {
        const { kakao } = window;
        if (map && clickHandler) {
          kakao.maps.event.removeListener(map, "click", clickHandler);
        }
        if (marker) marker.setMap(null);
        if (ro) ro.disconnect();
      } catch {}
    };
    // ★ onSelect 제거 (ref로 대체) → 중복 초기화 방지
  }, [appKey]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: 300,            // ★ 반드시 고정 높이
        minHeight: 300,
        borderRadius: 8,
        border: "1px solid #ddd",
        background: "#f8f9fb",
      }}
    />
  );
}
