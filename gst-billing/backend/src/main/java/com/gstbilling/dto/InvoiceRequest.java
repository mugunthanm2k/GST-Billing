package com.gstbilling.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class InvoiceRequest {
    private Long customerId;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private String supplyType; // INTRA_STATE or INTER_STATE
    private BigDecimal discountPercent;
    private String paymentMode;
    private String notes;
    private List<InvoiceItemRequest> items;

    @Data
    public static class InvoiceItemRequest {
        private Long productId;
        private String description;
        private String hsnCode;
        private String unit;
        private BigDecimal quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercent;
        private BigDecimal gstRate;
    }
}
