package com.gstbilling.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Long totalInvoices;
    private Long paidInvoices;
    private Long pendingInvoices;
    private Long overdueInvoices;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalTaxCollected;
    private Long totalCustomers;
    private Long totalProducts;
}
