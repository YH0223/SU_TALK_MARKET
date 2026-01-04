package com.sutalk.backend.domain.item.service;

import com.sutalk.backend.domain.chat.entity.ChatRoom;
import com.sutalk.backend.domain.chat.repository.ChatMessageRepository;
import com.sutalk.backend.domain.chat.repository.ChatRoomRepository;
import com.sutalk.backend.domain.item.dto.ItemRegisterRequestDTO;
import com.sutalk.backend.domain.item.dto.ItemResponseDTO;
import com.sutalk.backend.domain.search.dto.ItemSuggestionDTO;
import com.sutalk.backend.domain.item.entity.Item;
import com.sutalk.backend.domain.item.entity.ItemImage;
import com.sutalk.backend.domain.item.repository.ItemImageRepository;
import com.sutalk.backend.domain.item.repository.ItemLikeRepository;
import com.sutalk.backend.domain.item.repository.ItemRepository;
import com.sutalk.backend.domain.transaction.entity.ItemTransaction;
import com.sutalk.backend.domain.transaction.repository.ItemTransactionRepository;
import com.sutalk.backend.domain.user.entity.User;
import com.sutalk.backend.domain.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ItemService {

    private final ChatMessageRepository chatMessageRepository;
    private final ItemRepository itemRepository;
    private final ItemImageRepository itemImageRepository;
    private final UserRepository userRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final ItemTransactionRepository itemTransactionRepository;
    private final ItemLikeRepository itemLikeRepository;

    @PersistenceContext
    private EntityManager em;

    private final Path UPLOAD_ROOT = Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath();
    private final Path THUMBNAIL_ROOT = UPLOAD_ROOT.resolve("thumbnails");

    public Item getItemById(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
    }

    public ItemResponseDTO getItemResponseById(Long id) {
        Item item = itemRepository.findItemWithSellerAndImagesById(id)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        return toResponseDTO(item);
    }

    public List<ItemResponseDTO> getAllItems() {
        return itemRepository.findAllWithSellerAndImages().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsBySellerId(String userId) {
        return itemRepository.findBySellerUserIdWithImages(userId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<ItemResponseDTO> getItemsBySeller(String sellerId) {
        return getItemsBySellerId(sellerId);
    }

    public ItemResponseDTO toResponseDTO(Item item) {
        return ItemResponseDTO.builder()
                .itemid(item.getItemid())
                .title(item.getTitle())
                .description(item.getDescription())
                .price(item.getPrice())
                .category(item.getCategory())
                .meetLocation(item.getMeetLocation())
                .regdate(String.valueOf(item.getRegdate()))
                .sellerId(item.getSeller() != null ? item.getSeller().getUserid() : null)
                .sellerName(item.getSeller() != null ? item.getSeller().getName() : null)
                .sellerProfileImage(item.getSeller() != null ? item.getSeller().getProfileImage() : null)
                .status(item.getStatus().name())
                .itemImages(item.getItemImages() != null
                        ? item.getItemImages().stream().map(ItemImage::getPhotoPath).toList()
                        : new ArrayList<>())
                .build();
    }

    public Long saveItemWithImages(ItemRegisterRequestDTO requestDTO, List<MultipartFile> images) {
        User seller = userRepository.findById(requestDTO.getSellerId())
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));

        Item item = Item.builder()
                .seller(seller)
                .title(requestDTO.getTitle())
                .description(requestDTO.getDescription())
                .price(requestDTO.getPrice())
                .category(requestDTO.getCategory())
                .status(Item.Status.판매중)
                .meetLocation(requestDTO.getMeetLocation())
                .regdate(System.currentTimeMillis())
                .build();

        saveImages(images, item);
        return itemRepository.save(item).getItemid();
    }

    /** ✅ 기존 이미지 유지 + 신규 이미지 추가 */
    public void updateItem(Long itemId, ItemRegisterRequestDTO requestDTO,
                           List<String> existingImages, List<MultipartFile> newImages) {

        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));

        item.setTitle(requestDTO.getTitle());
        item.setDescription(requestDTO.getDescription());
        item.setPrice(requestDTO.getPrice());
        item.setCategory(requestDTO.getCategory());
        item.setMeetLocation(requestDTO.getMeetLocation());

        // ✅ 기존 이미지 유지
        Set<ItemImage> keep = new HashSet<>();
        if (existingImages != null && !existingImages.isEmpty()) {
            keep = item.getItemImages().stream()
                    .filter(img -> existingImages.contains(img.getPhotoPath()))
                    .collect(Collectors.toSet());
        }

        item.getItemImages().clear();
        item.getItemImages().addAll(keep);

        // ✅ 신규 이미지 추가
        saveImages(newImages, item);
    }

    private void ensureDirs() {
        try {
            Files.createDirectories(UPLOAD_ROOT);
            Files.createDirectories(THUMBNAIL_ROOT);
        } catch (IOException e) {
            throw new RuntimeException("디렉토리 생성 실패: " + e.getMessage(), e);
        }
    }

    private void saveImages(List<MultipartFile> images, Item item) {
        if (images == null || images.isEmpty()) return;
        ensureDirs();

        for (MultipartFile file : images) {
            try {
                String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
                String base = UUID.randomUUID().toString().replace("-", "");
                String filename = (ext == null || ext.isBlank()) ? base : base + "." + ext.toLowerCase();

                Path originPath = UPLOAD_ROOT.resolve(filename);
                Files.copy(file.getInputStream(), originPath, StandardCopyOption.REPLACE_EXISTING);

                ItemImage image = ItemImage.builder()
                        .photoPath("/uploads/" + filename)
                        .regdate(LocalDateTime.now())
                        .build();
                item.addItemImage(image);
            } catch (IOException e) {
                throw new RuntimeException("이미지 저장 실패: " + e.getMessage(), e);
            }
        }
    }

    @Transactional
    public void deleteItem(Long itemId) {
        // 1️⃣ 거래 내역 존재 여부 확인
        boolean hasTransaction = itemTransactionRepository.existsByItem_Itemid(itemId);
        if (hasTransaction) {
            throw new IllegalStateException("⚠️ 해당 상품은 거래 내역이 존재하여 삭제할 수 없습니다.");
        }

        // 2️⃣ 좋아요 삭제
        itemLikeRepository.deleteByItemId(itemId);

        // 3️⃣ 이미지 및 게시글 삭제
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        itemImageRepository.deleteAll(item.getItemImages());
        itemRepository.delete(item);
    }


    /** ✅ 프론트에서 보낸 한글 상태값을 안전하게 Enum으로 변환 */
    public void updateItemStatus(Long itemId, String status) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new NoSuchElementException("해당 ID의 게시글이 존재하지 않습니다."));
        item.setStatus(Item.Status.fromKorean(status)); // ✅ 수정된 부분
    }


    public List<ItemResponseDTO> getCompletedItemsByBuyer(String buyerId) {
        return itemRepository.findCompletedByBuyerUserId(buyerId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemSuggestionDTO> getItemSuggestionsWithImage(String keyword) {
        return itemRepository.findTop10ByKeyword(keyword).stream()
                .map(item -> new ItemSuggestionDTO(
                        item.getItemid(),
                        item.getTitle(),
                        item.getItemImages() != null && !item.getItemImages().isEmpty()
                                ? new ArrayList<>(item.getItemImages()).get(0).getPhotoPath()
                                : null
                )).toList();
    }

    @Transactional
    public void completeItemDeal(Long itemId, Long chatRoomId) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 없습니다."));
        ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new IllegalArgumentException("해당 채팅방이 없습니다."));
        item.setBuyer(chatRoom.getBuyer());
        item.setStatus(Item.Status.거래완료);
        item.setCompletedDate(LocalDateTime.now());
        itemRepository.save(item);
    }
}
