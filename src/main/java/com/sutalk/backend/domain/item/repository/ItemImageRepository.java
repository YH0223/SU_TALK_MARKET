package com.sutalk.backend.domain.item.repository;

import com.sutalk.backend.domain.item.entity.ItemImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemImageRepository extends JpaRepository<ItemImage, String> {
}
