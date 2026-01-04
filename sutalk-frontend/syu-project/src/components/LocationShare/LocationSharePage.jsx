import React, { useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { loadKakaoOnce } from "@/utils/loadKakaoOnce";
import { useAuthStore } from "@/stores/useAuthStore";
import { useModalStore } from "@/stores/useModalStore";
import UserListModal from "./UserListModal";
import "./LocationSharePage.css";

export default function LocationSharePage() {
    const mapContainerRef = useRef(null); // HTML div ref
    const mapRef = useRef(null);          // 실제 kakao.maps.Map 객체 ref
    const markersRef = useRef({});
    const clustersRef = useRef({});
    const clientRef = useRef(null);
    const appKey = import.meta.env.VITE_KAKAO_MAP_APPKEY;
    const { openProfile } = useModalStore();
    const { userId, name } = useAuthStore();
    const [isUserListOpen, setIsUserListOpen] = useState(false);
    const [userList, setUserList] = useState([]);

    // ✅ 1. 지도 로드
    useEffect(() => {
        loadKakaoOnce(appKey).then(() => {
            const { kakao } = window;
            const center = new kakao.maps.LatLng(37.5665, 126.9780);
            const map = new kakao.maps.Map(mapContainerRef.current, {
                center,
                level: 4,
            });

            // ✅ 반드시 완성된 map 객체를 ref에 저장
            mapRef.current = map;

            // ✅ 지도 projection 초기화 이후 overlay가 정상적으로 갱신되도록 보정
            kakao.maps.event.addListener(map, "tilesloaded", () => {
                Object.values(markersRef.current).forEach((overlay) => {
                    if (overlay?.setPosition && overlay.getPosition)
                        overlay.setPosition(overlay.getPosition());
                });
            });
        });
    }, [appKey]);

    // ✅ 2. WebSocket 연결
    useEffect(() => {
        if (!userId || !name) return;
        const client = new Client({
            brokerURL: "wss://sutalkmarket.shop/ws",
            reconnectDelay: 500,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("✅ WebSocket 연결됨");

            client.subscribe("/topic/location", (msg) => {
                const data = JSON.parse(msg.body);
                updateMarker(data);
            });

            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    sendLocation(latitude, longitude);
                    mapRef.current?.setCenter(new window.kakao.maps.LatLng(latitude, longitude));
                },
                (err) => console.error("❌ 초기 위치 실패:", err),
                { enableHighAccuracy: true }
            );
        };

        const sendLocation = (lat, lng) => {
            const payload = { userId, name, lat, lng };
            if (client.connected) {
                client.publish({
                    destination: "/app/location.update",
                    body: JSON.stringify(payload),
                });
                updateMarker(payload);
            }
        };

        client.activate();
        clientRef.current = client;
        return () => client.deactivate();
    }, [userId, name]);

    // ✅ 3. 마커 표시
    const updateMarker = (user) => {
        const { kakao } = window;
        const map = mapRef.current;
        if (!map || !kakao?.maps) return;

        const lat = Number(user.lat);
        const lng = Number(user.lng);
        if (isNaN(lat) || isNaN(lng)) return; // 좌표 유효성 확인

        const pos = new kakao.maps.LatLng(lat, lng);
        const clusterKey = `${Math.round(lat * 100)}_${Math.round(lng * 100)}`;
        const safeImage = user.profileImage || "/default-image.png";

        // ✅ overlay 재활용
        let overlay = markersRef.current[clusterKey];
        if (overlay) {
            overlay.setPosition(pos);
            return;
        }

        // ✅ DOM 생성
        const content = document.createElement("div");
        content.className = "profile-marker";
        content.innerHTML = `
      <div class="marker-image"
           style="background:url('${safeImage}') center/cover;
                  width:48px;height:48px;border-radius:50%;
                  box-shadow:0 0 3px rgba(0,0,0,0.3);"></div>
      <div class="marker-name">${user.name || "사용자"}</div>
    `;

        // ✅ 클릭 이벤트
        content.addEventListener("click", () => openProfile(user.userId));

        // ✅ CustomOverlay 생성
        overlay = new kakao.maps.CustomOverlay({
            position: pos,
            content,
            xAnchor: 0.5,  // 중앙
            yAnchor: 1,    // 하단
            zIndex: 5,
        });

        overlay.setMap(map);
        markersRef.current[clusterKey] = overlay;
    };

    return (
        <div className="location-share-page">
            <h2 className="page-title">📍 실시간 위치공유</h2>
            <div className="map-container" ref={mapContainerRef}></div>

            {isUserListOpen && (
                <UserListModal
                    users={userList}
                    onSelect={(uid) => {
                        openProfile(uid);
                        setIsUserListOpen(false);
                    }}
                    closeModal={() => setIsUserListOpen(false)}
                />
            )}
        </div>
    );
}
