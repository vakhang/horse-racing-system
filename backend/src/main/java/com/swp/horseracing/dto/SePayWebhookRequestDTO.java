package com.swp.horseracing.dto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SePayWebhookRequestDTO {

    @JsonProperty("gateway")
    private String gateway;

    @JsonProperty("transactionDate")
    private String transactionDate;

    @JsonProperty("accountNumber")
    private String accountNumber;

    @JsonProperty("subAccount")
    private String subAccount;

    @JsonProperty("transferType")
    private String transferType; // Sẽ trả về "in" (tiền vào) hoặc "out" (tiền ra)

    @JsonProperty("transferAmount")
    private Long transferAmount; // Số tiền nạp

    @JsonProperty("accumulated")
    private Long accumulated;

    @JsonProperty("code")
    private String code;

    @JsonProperty("content")
    private String content; // ĐÂY CHÍNH LÀ NƠI HỨNG CHỮ "NAP1"

    @JsonProperty("referenceCode")
    private String referenceCode;

    @JsonProperty("description")
    private String description;
}