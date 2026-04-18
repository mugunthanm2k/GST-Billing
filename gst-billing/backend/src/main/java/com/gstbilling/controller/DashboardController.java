package com.gstbilling.controller;

import com.gstbilling.dto.DashboardStats;
import com.gstbilling.entity.Invoice;
import com.gstbilling.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.*;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;

    @GetMapping("/stats")
    public DashboardStats getStats() {
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.withDayOfMonth(1);

        Long total = invoiceRepository.count();
        Long paid = invoiceRepository.countByStatus(Invoice.InvoiceStatus.PAID);
        Long pending = invoiceRepository.countByStatus(Invoice.InvoiceStatus.SENT);
        Long overdue = invoiceRepository.countByStatus(Invoice.InvoiceStatus.OVERDUE);

        BigDecimal totalRevenue = invoiceRepository.sumPaidAmountByDateRange(
                LocalDate.of(2000, 1, 1), now);
        BigDecimal monthlyRevenue = invoiceRepository.sumPaidAmountByDateRange(monthStart, now);

        return DashboardStats.builder()
                .totalInvoices(total)
                .paidInvoices(paid)
                .pendingInvoices(pending)
                .overdueInvoices(overdue)
                .totalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO)
                .monthlyRevenue(monthlyRevenue != null ? monthlyRevenue : BigDecimal.ZERO)
                .totalCustomers(customerRepository.count())
                .totalProducts(productRepository.count())
                .build();
    }
}
