package com.gstbilling.service;

import com.gstbilling.dto.InvoiceRequest;
import com.gstbilling.entity.*;
import com.gstbilling.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InvoiceService {

    @Autowired private InvoiceRepository invoiceRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CompanyProfileRepository companyProfileRepository;

    public Invoice createInvoice(InvoiceRequest request, String createdBy) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        CompanyProfile company = companyProfileRepository.findFirstBy()
                .orElseThrow(() -> new RuntimeException("Company profile not configured"));

        String invoiceNumber = generateInvoiceNumber(company);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNumber)
                .customer(customer)
                .invoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now())
                .dueDate(request.getDueDate())
                .supplyType(Invoice.SupplyType.valueOf(request.getSupplyType()))
                .discountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO)
                .paymentMode(request.getPaymentMode())
                .notes(request.getNotes())
                .status(Invoice.InvoiceStatus.DRAFT)
                .createdBy(createdBy)
                .sellerGstin(company.getGstin())
                .sellerName(company.getName())
                .sellerAddress(company.getAddress() + ", " + company.getCity() + ", " + company.getState())
                .sellerState(company.getState())
                .build();

        // Build items
        List<InvoiceItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        boolean isInterState = "INTER_STATE".equals(request.getSupplyType());

        for (InvoiceRequest.InvoiceItemRequest itemReq : request.getItems()) {
            InvoiceItem item = new InvoiceItem();
            item.setInvoice(invoice);

            if (itemReq.getProductId() != null) {
                Product product = productRepository.findById(itemReq.getProductId()).orElse(null);
                if (product != null) {
                    item.setProduct(product);
                    item.setDescription(itemReq.getDescription() != null ? itemReq.getDescription() : product.getName());
                    item.setHsnCode(itemReq.getHsnCode() != null ? itemReq.getHsnCode() : product.getHsnCode());
                    item.setUnit(itemReq.getUnit() != null ? itemReq.getUnit() : product.getUnit());
                    item.setUnitPrice(itemReq.getUnitPrice() != null ? itemReq.getUnitPrice() : product.getPrice());
                    item.setGstRate(itemReq.getGstRate() != null ? itemReq.getGstRate() : product.getGstRate());
                } else {
                    setItemBasicFields(item, itemReq);
                }
            } else {
                setItemBasicFields(item, itemReq);
            }

            BigDecimal qty = itemReq.getQuantity();
            BigDecimal unitPrice = item.getUnitPrice();
            BigDecimal discPct = itemReq.getDiscountPercent() != null ? itemReq.getDiscountPercent() : BigDecimal.ZERO;

            BigDecimal lineTotal = qty.multiply(unitPrice);
            BigDecimal discAmt = lineTotal.multiply(discPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            BigDecimal taxableAmt = lineTotal.subtract(discAmt);

            BigDecimal gstRate = item.getGstRate() != null ? item.getGstRate() : BigDecimal.ZERO;

            BigDecimal cgst = BigDecimal.ZERO, sgst = BigDecimal.ZERO, igst = BigDecimal.ZERO;

            if (isInterState) {
                igst = taxableAmt.multiply(gstRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                item.setIgstRate(gstRate);
                item.setIgstAmount(igst);
                item.setCgstRate(BigDecimal.ZERO);
                item.setSgstRate(BigDecimal.ZERO);
                item.setCgstAmount(BigDecimal.ZERO);
                item.setSgstAmount(BigDecimal.ZERO);
            } else {
                BigDecimal halfRate = gstRate.divide(BigDecimal.valueOf(2), 2, RoundingMode.HALF_UP);
                cgst = taxableAmt.multiply(halfRate).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                sgst = cgst;
                item.setCgstRate(halfRate);
                item.setSgstRate(halfRate);
                item.setCgstAmount(cgst);
                item.setSgstAmount(sgst);
                item.setIgstRate(BigDecimal.ZERO);
                item.setIgstAmount(BigDecimal.ZERO);
            }

            item.setQuantity(qty);
            item.setDiscountPercent(discPct);
            item.setDiscountAmount(discAmt);
            item.setTaxableAmount(taxableAmt);
            item.setTotalAmount(taxableAmt.add(cgst).add(sgst).add(igst));

            items.add(item);
            subtotal = subtotal.add(lineTotal);
        }

        invoice.setItems(items);

        // Invoice-level totals
        BigDecimal totalDiscount = items.stream()
                .map(InvoiceItem::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal taxableTotal = items.stream()
                .map(InvoiceItem::getTaxableAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalCgst = items.stream().map(InvoiceItem::getCgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalSgst = items.stream().map(InvoiceItem::getSgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalIgst = items.stream().map(InvoiceItem::getIgstAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalTax = totalCgst.add(totalSgst).add(totalIgst);
        BigDecimal grandTotal = taxableTotal.add(totalTax);

        invoice.setSubtotal(subtotal);
        invoice.setDiscountAmount(totalDiscount);
        invoice.setTaxableAmount(taxableTotal);
        invoice.setCgstAmount(totalCgst);
        invoice.setSgstAmount(totalSgst);
        invoice.setIgstAmount(totalIgst);
        invoice.setTotalTax(totalTax);
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountInWords(NumberToWords.convert(grandTotal.longValue()) + " Rupees Only");

        // Increment counter
        company.setInvoiceCounter(company.getInvoiceCounter() + 1);
        companyProfileRepository.save(company);

        return invoiceRepository.save(invoice);
    }

    private void setItemBasicFields(InvoiceItem item, InvoiceRequest.InvoiceItemRequest req) {
        item.setDescription(req.getDescription());
        item.setHsnCode(req.getHsnCode());
        item.setUnit(req.getUnit());
        item.setUnitPrice(req.getUnitPrice());
        item.setGstRate(req.getGstRate() != null ? req.getGstRate() : BigDecimal.ZERO);
    }

    private String generateInvoiceNumber(CompanyProfile company) {
        return company.getInvoicePrefix() + "-" +
               LocalDate.now().getYear() + "-" +
               String.format("%04d", company.getInvoiceCounter());
    }

    public Invoice updateStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        invoice.setStatus(Invoice.InvoiceStatus.valueOf(status));
        return invoiceRepository.save(invoice);
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAllOrderByCreatedAtDesc();
    }

    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }

    public List<Invoice> searchInvoices(String query) {
        return invoiceRepository.searchInvoices(query);
    }

    public List<Invoice> filterByDateRange(LocalDate from, LocalDate to) {
        return invoiceRepository.findByDateRange(from, to);
    }

    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }
}
