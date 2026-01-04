import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import { useNearbyStore } from "@/stores/useNearbyStore";

export function useLocationSocket(userId: string, nickname: string) {
    const clientRef = useRef<Client | null>(null);
    const addUser = useNearbyStore((s) => s.addUser);
    const updateUser = useNearbyStore((s) => s.updateUser);

    useEffect(() => {
        if (!userId) return;

        const client = new Client({
            brokerURL: "ws://localhost:8080/ws", // ✅ 서버 ws endpoint
            reconnectDelay: 5000,
        });

        client.onConnect = () => {
            console.log("✅ 위치공유 WebSocket 연결됨");
            // 다른 유저 위치 수신
            client.subscribe("/topic/location", (msg) => {
                const data = JSON.parse(msg.body);
                if (data.userId !== userId) updateUser(data);
            });

            // 내 위치 전송
            navigator.geolocation.watchPosition(
                (pos) => {
                    const payload = {
                        userId,
                        nickname,
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                    };
                    client.publish({
                        destination: "/app/location.update",
                        body: JSON.stringify(payload),
                    });
                },
                (err) => console.warn("위치 수집 실패", err),
                { enableHighAccuracy: true }
            );
        };

        client.activate();
        clientRef.current = client;
        return () => client.deactivate();
    }, [userId, nickname]);
}
