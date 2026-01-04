package com.sutalk.backend.domain.item.repository;

import com.sutalk.backend.domain.item.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("SELECT DISTINCT i FROM Item i " +
            "LEFT JOIN FETCH i.seller " +
            "LEFT JOIN FETCH i.itemImages")
    List<Item> findAllWithSellerAndImages();

    @Query("SELECT i FROM Item i " +
            "LEFT JOIN FETCH i.seller " +
            "LEFT JOIN FETCH i.itemImages " +
            "WHERE i.itemid = :id")
    Optional<Item> findItemWithSellerAndImagesById(@Param("id") Long id);

    @Query("SELECT DISTINCT i FROM Item i " +
            "LEFT JOIN FETCH i.seller s " +
            "LEFT JOIN FETCH i.itemImages " +
            "WHERE s.userid = :userId")
    List<Item> findBySellerUserIdWithImages(@Param("userId") String userId);

    @Query("SELECT DISTINCT i FROM Item i " +
            "LEFT JOIN FETCH i.seller " +
            "LEFT JOIN FETCH i.itemImages " +
            "WHERE i.buyer.userid = :buyerId AND i.status = '거래완료'")
    List<Item> findCompletedByBuyerUserId(@Param("buyerId") String buyerId);

    // ✅ 수정된 핵심 쿼리
    @Query("""
    SELECT DISTINCT i FROM Item i
    LEFT JOIN FETCH i.seller s
    LEFT JOIN FETCH i.itemImages imgs
    WHERE LOWER(i.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
       OR LOWER(i.description) LIKE LOWER(CONCAT('%', :keyword, '%'))
    ORDER BY i.regdate DESC
    """)
    List<Item> findTop10ByKeyword(@Param("keyword") String keyword);

    // ✅ FK 업데이트용: 판매자 ID 변경
    @Modifying
    @Query("UPDATE Item i SET i.seller.userid = :newId WHERE i.seller.userid = :oldId")
    void updateSellerUserId(@Param("oldId") String oldId, @Param("newId") String newId);

    // ✅ FK 업데이트용: 구매자 ID 변경
    @Modifying
    @Query("UPDATE Item i SET i.buyer.userid = :newId WHERE i.buyer.userid = :oldId")
    void updateBuyerUserId(@Param("oldId") String oldId, @Param("newId") String newId);
}
