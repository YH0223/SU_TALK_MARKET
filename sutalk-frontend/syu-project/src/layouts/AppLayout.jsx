import React, { useEffect, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PrivateRoute from "@/utils/PrivateRoute";
import TopBar from "@/components/TopBar/TopBar";
import Nav from "@/components/Nav/Nav";
import SpeedDial from "@/components/SpeedDial/SpeedDial";
import {
    FiHome,
    FiEdit2,
    FiFilePlus,
    FiMapPin,
    FiUserPlus,
} from "react-icons/fi";

import HomePage from "@/components/Home/Home";
import ChatRoom from "@/components/Chat/ChatRoom";
import ChatListPage from "@/components/Chat/ChatList";
import SearchPage from "@/components/Serach/Search";
import ProfilePage from "@/components/Profile/Profile";
import ProfileEditPage from "@/components/Profile/ProfileEdit";
import FavoritesPage from "@/components/Favorites/Favorites";
import SalesHistoryPage from "@/components/SalesHistory/SalesHistory";
import PostPage from "@/components/Post/Post";
import PostDetailPage from "@/components/PostDetail/PostDetail";
import PostEditPage from "@/components/Post/PostEdit";
import Reviewpage from "@/components/Review/Review";
import ReportPage from "@/components/Report/Report";
import SellerProfile from "@/components/Profile/SellerProfile";
import Community from "@/components/Community/Community";
import CommunityNew from "@/components/Community/CommunityNew";
import CommunityDetail from "@/components/Community/CommunityDetail";
import CommunityLikesPage from "@/components/Community/CommunityLikesPage";
import FriendsPage from "@/components/Friends/FriendsPage";
import LocationSharePage from "@/components/LocationShare/LocationSharePage";

import { useAuthStore } from "@/stores/useAuthStore";
import "./AppLayout.css";

export default function AppLayout() {
    const location = useLocation();
    const { nickname, updateNickname } = useAuthStore();
    const path = location.pathname;

    const isChatRoom = /^\/chat\/[a-zA-Z0-9_-]+$/.test(path);
    const hideTopBarHere = isChatRoom || path === "/chatlist";
    const hideBottomUI =
        ["/", "/login", "/signup", "/enter", "/search"].includes(path) || isChatRoom;
    const isPostDetail = /^\/post\/[a-zA-Z0-9_-]+$/.test(path);

    useEffect(() => {
        document.body.classList.toggle("route-chat", hideTopBarHere);
        return () => document.body.classList.remove("route-chat");
    }, [hideTopBarHere]);

    const speedDialActions = useMemo(() => {
        const base = [
            { key: "home", label: "홈", to: "/home", icon: <FiHome /> },
            { key: "friends", label: "친구", to: "/friends", icon: <FiUserPlus /> },
            { key: "location", label: "위치공유", to: "/location-share", icon: <FiMapPin /> },
        ];
        const list = [...base];

        if (path.startsWith("/home") || path.startsWith("/post")) {
            list.unshift({
                key: "market-write",
                label: "중고거래 글쓰기",
                to: "/post",
                icon: <FiFilePlus />,
            });
        }
        if (path.startsWith("/community")) {
            list.unshift({
                key: "community-write",
                label: "커뮤니티 글쓰기",
                to: "/community/new",
                icon: <FiEdit2 />,
            });
        }
        if (path.startsWith("/location-share")) {
            list.unshift({
                key: "location-share",
                label: "위치 공유",
                to: "/location-share",
                icon: <FiMapPin />,
            });
        }
        return list;
    }, [path]);

    return (
        <div className="intro-shell">
            {/* ─── 좌측 프로모션 영역 ─── */}
            <aside className="promo-rail">
                <div className="promo-inner">
                    <div className="promo-logo">
                        <img src="/assets/수야.png" alt="SU_Talk 로고" />
                        <h2>SU_Talk</h2>
                    </div>
                    <div className="promo-card">
                        <h3>🌿 삼육대학교의 모든 소식을 한곳에!</h3>
                        <p>학교 공지, 행사, 중고거래, 친구 소식까지<br />SU_Talk에서 함께하세요.</p>
                    </div>
                </div>
            </aside>

            {/* ─── 우측 앱 실제 레이아웃 ─── */}
            <section className="app-stage">
                <div className="app-frame">
                    {/* ✅ 오른쪽 절반 내부에 TopBar 포함 */}
                    {!hideTopBarHere && <TopBar/>}

                    <div className="app-body">
                        <Routes>
                            <Route path="/home" element={<PrivateRoute><HomePage/></PrivateRoute>}/>
                            <Route path="/chatlist" element={<PrivateRoute><ChatListPage/></PrivateRoute>}/>
                            <Route path="/chat/:chatRoomId" element={<PrivateRoute><ChatRoom/></PrivateRoute>}/>
                            <Route path="/search" element={<PrivateRoute><SearchPage/></PrivateRoute>}/>
                            <Route path="/profile"
                                   element={<PrivateRoute><ProfilePage nickname={nickname}/></PrivateRoute>}/>
                            <Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage nickname={nickname}
                                                                                                setNickname={updateNickname}/></PrivateRoute>}/>
                            <Route path="/profile/favorites" element={<PrivateRoute><FavoritesPage/></PrivateRoute>}/>
                            <Route path="/profile/sales-history"
                                   element={<PrivateRoute><SalesHistoryPage/></PrivateRoute>}/>
                            <Route path="/profile/community-likes"
                                   element={<PrivateRoute><CommunityLikesPage/></PrivateRoute>}/>
                            <Route path="/profile/seller/:sellerId"
                                   element={<PrivateRoute><SellerProfile/></PrivateRoute>}/>
                            <Route path="/review" element={<PrivateRoute><Reviewpage/></PrivateRoute>}/>
                            <Route path="/report" element={<PrivateRoute><ReportPage/></PrivateRoute>}/>
                            <Route path="/post" element={<PrivateRoute><PostPage/></PrivateRoute>}/>
                            <Route path="/post/:postId" element={<PrivateRoute><PostDetailPage/></PrivateRoute>}/>
                            <Route path="/post/:postId/edit" element={<PrivateRoute><PostEditPage/></PrivateRoute>}/>
                            <Route path="/community" element={<PrivateRoute><Community/></PrivateRoute>}/>
                            <Route path="/community/new" element={<PrivateRoute><CommunityNew/></PrivateRoute>}/>
                            <Route path="/community/post/:postId"
                                   element={<PrivateRoute><CommunityDetail/></PrivateRoute>}/>
                            <Route path="/location-share" element={<PrivateRoute><LocationSharePage/></PrivateRoute>}/>
                            <Route path="/friends" element={<PrivateRoute><FriendsPage/></PrivateRoute>}/>
                            <Route path="*" element={<Navigate to="/home" replace/>}/>
                        </Routes>
                    </div>

                    {/* ✅ Nav / SpeedDial도 우측 절반 내부에 */}
                    {!hideBottomUI && !isPostDetail && (
                        <>
                            <Nav/>
                            <SpeedDial
                                position="center"
                                radius={80}
                                arc={150}
                                actions={speedDialActions}
                                style={{"--sd-bottom": "96px"}}
                                closeOnRouteChange
                            />
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
