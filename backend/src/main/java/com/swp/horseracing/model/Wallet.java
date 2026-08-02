package com.swp.horseracing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
    // [Chức năng rõ ràng]: Entity Ví tiền ảo
    // [Tác dụng]: Ánh xạ bảng `wallets`. Lưu giữ số dư khả dụng (Balance) hiện tại của User.
    // [Hướng dẫn sửa đổi]:
    // - Data: Nên lưu Balance dưới dạng `BigDecimal` (đã làm) để tránh sai số thập phân.
public class Wallet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // FIX LỖI ĐỆ QUY JACKSON VÀ CHỐNG SPAM TERMINAL MỖI 3 GIÂY
    @JsonIgnore
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private BigDecimal balance;

    @Version
    private Integer version;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}