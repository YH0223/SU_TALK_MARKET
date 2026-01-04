package com.sutalk.backend.domain.report.entity;

import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@DiscriminatorValue("ITEM")
public class ItemReport extends Report {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private Item item;

    @Builder
    // (String reason -> ReportReason reason, String details)
    public ItemReport(User reporter, User reported, ReportReason reason, String details, Long regdate, Status status, Item item) {
        super(reporter, reported, reason, details, regdate, status);
        this.item = item;
    }
}