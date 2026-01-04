package com.sutalk.backend.domain.report.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ReportReason {
    SPAM("스팸 / 홍보 / 도배", "관련 없는 상업적 광고, 악성 링크, 동일한 내용의 반복적인 게시 등"),
    ILLEGAL_INFO("불법 정보", "법적으로 금지된 정보를 포함하는 경우 (음란물, 불법 도박, 마약 등)"),
    INSULT("욕설 / 비하 / 차별적 표현", "심한 욕설, 타인에 대한 근거 없는 비방, 인종·성별·종교·지역 등에 대한 차별적 발언"),
    PERSONAL_INFO("개인정보 노출", "타인의 동의 없이 이름, 연락처, 주소 등 개인정보를 게시한 경우"),
    COPYRIGHT("저작권 침해", "뉴스 기사, 이미지, 영상, 창작물 등을 원작자의 허락 없이 무단으로 사용한 경우"),
    OTHER("기타", "위 항목에 해당하지 않는 문제 (직접 입력)");

    private final String title;
    private final String description;
}