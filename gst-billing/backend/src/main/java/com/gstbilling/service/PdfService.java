package com.gstbilling.service;

import com.gstbilling.entity.*;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, new BaseColor(15, 23, 42));
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.WHITE);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 9, Font.NORMAL, new BaseColor(30, 41, 59));
    private static final Font BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, new BaseColor(15, 23, 42));
    private static final Font SMALL_FONT = new Font(Font.FontFamily.HELVETICA, 8, Font.NORMAL, new BaseColor(100, 116, 139));
    private static final Font TOTAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, new BaseColor(15, 23, 42));
    private static final BaseColor HEADER_BG = new BaseColor(15, 23, 42);
    private static final BaseColor ALT_ROW = new BaseColor(248, 250, 252);
    private static final BaseColor ACCENT = new BaseColor(14, 165, 233);

    public byte[] generateInvoicePdf(Invoice invoice) throws Exception {
        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter writer = PdfWriter.getInstance(document, out);
        document.open();

        // ─── Header ───────────────────────────────────────────────
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1.5f, 1f});
        headerTable.setSpacingAfter(16);

        // Company info
        PdfPCell companyCell = new PdfPCell();
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.setPadding(0);
        Paragraph companyName = new Paragraph(invoice.getSellerName(), TITLE_FONT);
        companyCell.addElement(companyName);
        companyCell.addElement(new Paragraph(invoice.getSellerAddress(), SMALL_FONT));
        companyCell.addElement(new Paragraph("GSTIN: " + invoice.getSellerGstin(), SMALL_FONT));
        headerTable.addCell(companyCell);

        // Invoice title block
        PdfPCell titleCell = new PdfPCell();
        titleCell.setBorder(Rectangle.NO_BORDER);
        titleCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        titleCell.setPadding(0);
        Paragraph invoiceTitle = new Paragraph("TAX INVOICE", new Font(Font.FontFamily.HELVETICA, 16, Font.BOLD, ACCENT));
        invoiceTitle.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(invoiceTitle);

        Paragraph invNum = new Paragraph(invoice.getInvoiceNumber(),
                new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, new BaseColor(15, 23, 42)));
        invNum.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(invNum);

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy");
        Paragraph invDate = new Paragraph("Date: " + invoice.getInvoiceDate().format(fmt), SMALL_FONT);
        invDate.setAlignment(Element.ALIGN_RIGHT);
        titleCell.addElement(invDate);

        if (invoice.getDueDate() != null) {
            Paragraph dueDate = new Paragraph("Due: " + invoice.getDueDate().format(fmt), SMALL_FONT);
            dueDate.setAlignment(Element.ALIGN_RIGHT);
            titleCell.addElement(dueDate);
        }
        headerTable.addCell(titleCell);
        document.add(headerTable);

        // Divider
        PdfPTable divider = new PdfPTable(1);
        divider.setWidthPercentage(100);
        divider.setSpacingAfter(12);
        PdfPCell divCell = new PdfPCell();
        divCell.setBackgroundColor(ACCENT);
        divCell.setFixedHeight(2);
        divCell.setBorder(Rectangle.NO_BORDER);
        divider.addCell(divCell);
        document.add(divider);

        // ─── Bill To ──────────────────────────────────────────────
        PdfPTable billToTable = new PdfPTable(2);
        billToTable.setWidthPercentage(100);
        billToTable.setSpacingAfter(16);

        PdfPCell billToCell = new PdfPCell();
        billToCell.setBorder(Rectangle.BOX);
        billToCell.setBorderColor(new BaseColor(226, 232, 240));
        billToCell.setPadding(8);
        billToCell.setBackgroundColor(ALT_ROW);

        billToCell.addElement(new Paragraph("BILL TO", new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, new BaseColor(100, 116, 139))));
        billToCell.addElement(new Paragraph(invoice.getCustomer().getName(), BOLD_FONT));
        if (invoice.getCustomer().getAddress() != null)
            billToCell.addElement(new Paragraph(invoice.getCustomer().getAddress(), NORMAL_FONT));
        if (invoice.getCustomer().getCity() != null)
            billToCell.addElement(new Paragraph(invoice.getCustomer().getCity() + " - " + invoice.getCustomer().getPincode(), NORMAL_FONT));
        if (invoice.getCustomer().getGstin() != null)
            billToCell.addElement(new Paragraph("GSTIN: " + invoice.getCustomer().getGstin(), SMALL_FONT));
        if (invoice.getCustomer().getPhone() != null)
            billToCell.addElement(new Paragraph("Phone: " + invoice.getCustomer().getPhone(), SMALL_FONT));

        billToTable.addCell(billToCell);

        PdfPCell supplyCell = new PdfPCell();
        supplyCell.setBorder(Rectangle.BOX);
        supplyCell.setBorderColor(new BaseColor(226, 232, 240));
        supplyCell.setPadding(8);
        supplyCell.setBackgroundColor(ALT_ROW);

        supplyCell.addElement(new Paragraph("SUPPLY TYPE", new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, new BaseColor(100, 116, 139))));
        String supplyTypeLabel = invoice.getSupplyType() == Invoice.SupplyType.INTER_STATE
                ? "Inter-State Supply (IGST)" : "Intra-State Supply (CGST + SGST)";
        supplyCell.addElement(new Paragraph(supplyTypeLabel, BOLD_FONT));
        supplyCell.addElement(Chunk.NEWLINE);
        supplyCell.addElement(new Paragraph("STATUS", new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, new BaseColor(100, 116, 139))));
        supplyCell.addElement(new Paragraph(invoice.getStatus().name(), BOLD_FONT));
        if (invoice.getPaymentMode() != null) {
            supplyCell.addElement(Chunk.NEWLINE);
            supplyCell.addElement(new Paragraph("PAYMENT MODE", new Font(Font.FontFamily.HELVETICA, 8, Font.BOLD, new BaseColor(100, 116, 139))));
            supplyCell.addElement(new Paragraph(invoice.getPaymentMode(), BOLD_FONT));
        }
        billToTable.addCell(supplyCell);
        document.add(billToTable);

        // ─── Items Table ──────────────────────────────────────────
        boolean isInterState = invoice.getSupplyType() == Invoice.SupplyType.INTER_STATE;
        int colCount = isInterState ? 9 : 10;

        PdfPTable itemsTable = new PdfPTable(colCount);
        itemsTable.setWidthPercentage(100);
        itemsTable.setSpacingAfter(12);

        float[] widths = isInterState
                ? new float[]{0.4f, 2.2f, 0.7f, 0.6f, 0.8f, 0.7f, 0.8f, 0.8f, 1f}
                : new float[]{0.4f, 2f, 0.7f, 0.6f, 0.8f, 0.7f, 0.7f, 0.7f, 0.7f, 1f};
        itemsTable.setWidths(widths);

        // Header row
        String[] headers = isInterState
                ? new String[]{"#", "Description", "HSN", "Qty", "Rate", "Disc%", "Taxable", "IGST", "Total"}
                : new String[]{"#", "Description", "HSN", "Qty", "Rate", "Disc%", "Taxable", "CGST", "SGST", "Total"};

        for (String h : headers) {
            PdfPCell hc = new PdfPCell(new Phrase(h, HEADER_FONT));
            hc.setBackgroundColor(HEADER_BG);
            hc.setPadding(6);
            hc.setHorizontalAlignment(Element.ALIGN_CENTER);
            hc.setBorder(Rectangle.NO_BORDER);
            itemsTable.addCell(hc);
        }

        // Data rows
        int rowNum = 1;
        for (InvoiceItem item : invoice.getItems()) {
            BaseColor rowBg = rowNum % 2 == 0 ? ALT_ROW : BaseColor.WHITE;
            addItemCell(itemsTable, String.valueOf(rowNum++), rowBg, Element.ALIGN_CENTER);
            addItemCell(itemsTable, item.getDescription(), rowBg, Element.ALIGN_LEFT);
            addItemCell(itemsTable, item.getHsnCode() != null ? item.getHsnCode() : "-", rowBg, Element.ALIGN_CENTER);
            addItemCell(itemsTable, item.getQuantity().toPlainString(), rowBg, Element.ALIGN_CENTER);
            addItemCell(itemsTable, "₹" + item.getUnitPrice().toPlainString(), rowBg, Element.ALIGN_RIGHT);
            addItemCell(itemsTable, item.getDiscountPercent().toPlainString() + "%", rowBg, Element.ALIGN_CENTER);
            addItemCell(itemsTable, "₹" + item.getTaxableAmount().toPlainString(), rowBg, Element.ALIGN_RIGHT);

            if (isInterState) {
                addItemCell(itemsTable, item.getIgstRate() + "%\n₹" + item.getIgstAmount(), rowBg, Element.ALIGN_RIGHT);
            } else {
                addItemCell(itemsTable, item.getCgstRate() + "%\n₹" + item.getCgstAmount(), rowBg, Element.ALIGN_RIGHT);
                addItemCell(itemsTable, item.getSgstRate() + "%\n₹" + item.getSgstAmount(), rowBg, Element.ALIGN_RIGHT);
            }
            addItemCell(itemsTable, "₹" + item.getTotalAmount().toPlainString(), rowBg, Element.ALIGN_RIGHT);
        }
        document.add(itemsTable);

        // ─── Summary ──────────────────────────────────────────────
        PdfPTable summaryWrapper = new PdfPTable(2);
        summaryWrapper.setWidthPercentage(100);
        summaryWrapper.setWidths(new float[]{1.2f, 1f});
        summaryWrapper.setSpacingAfter(16);

        // Notes cell
        PdfPCell notesCell = new PdfPCell();
        notesCell.setBorder(Rectangle.NO_BORDER);
        notesCell.setPaddingRight(16);
        if (invoice.getNotes() != null && !invoice.getNotes().isEmpty()) {
            notesCell.addElement(new Paragraph("Notes:", BOLD_FONT));
            notesCell.addElement(new Paragraph(invoice.getNotes(), NORMAL_FONT));
        }
        notesCell.addElement(Chunk.NEWLINE);
        notesCell.addElement(new Paragraph("Amount in words:", BOLD_FONT));
        notesCell.addElement(new Paragraph(invoice.getAmountInWords(), NORMAL_FONT));
        summaryWrapper.addCell(notesCell);

        // Totals
        PdfPTable totalsTable = new PdfPTable(2);
        totalsTable.setWidthPercentage(100);
        addTotalRow(totalsTable, "Subtotal", "₹" + formatAmt(invoice.getSubtotal()), false);
        if (invoice.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0)
            addTotalRow(totalsTable, "Discount", "-₹" + formatAmt(invoice.getDiscountAmount()), false);
        addTotalRow(totalsTable, "Taxable Amount", "₹" + formatAmt(invoice.getTaxableAmount()), false);
        if (!isInterState) {
            addTotalRow(totalsTable, "CGST", "₹" + formatAmt(invoice.getCgstAmount()), false);
            addTotalRow(totalsTable, "SGST", "₹" + formatAmt(invoice.getSgstAmount()), false);
        } else {
            addTotalRow(totalsTable, "IGST", "₹" + formatAmt(invoice.getIgstAmount()), false);
        }
        addTotalRow(totalsTable, "Total Tax", "₹" + formatAmt(invoice.getTotalTax()), false);

        // Grand total row with accent
        PdfPCell gtLabelCell = new PdfPCell(new Phrase("GRAND TOTAL", new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE)));
        gtLabelCell.setBackgroundColor(HEADER_BG);
        gtLabelCell.setPadding(8);
        gtLabelCell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(gtLabelCell);

        PdfPCell gtValCell = new PdfPCell(new Phrase("₹" + formatAmt(invoice.getGrandTotal()), new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, BaseColor.WHITE)));
        gtValCell.setBackgroundColor(HEADER_BG);
        gtValCell.setPadding(8);
        gtValCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        gtValCell.setBorder(Rectangle.NO_BORDER);
        totalsTable.addCell(gtValCell);

        PdfPCell totalsCell = new PdfPCell(totalsTable);
        totalsCell.setBorder(Rectangle.NO_BORDER);
        totalsCell.setPadding(0);
        summaryWrapper.addCell(totalsCell);
        document.add(summaryWrapper);

        // ─── Footer ───────────────────────────────────────────────
        PdfPTable footer = new PdfPTable(1);
        footer.setWidthPercentage(100);
        PdfPCell footerCell = new PdfPCell();
        footerCell.setBorder(Rectangle.TOP);
        footerCell.setBorderColor(new BaseColor(226, 232, 240));
        footerCell.setPaddingTop(8);
        footerCell.addElement(new Paragraph("This is a computer-generated invoice and does not require a physical signature.",
                new Font(Font.FontFamily.HELVETICA, 7, Font.ITALIC, new BaseColor(148, 163, 184))));
        footer.addCell(footerCell);
        document.add(footer);

        document.close();
        return out.toByteArray();
    }

    private void addItemCell(PdfPTable table, String text, BaseColor bg, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        cell.setBorderColor(new BaseColor(226, 232, 240));
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label, String value, boolean bold) {
        Font f = bold ? TOTAL_FONT : NORMAL_FONT;
        PdfPCell lc = new PdfPCell(new Phrase(label, f));
        lc.setBorderColor(new BaseColor(226, 232, 240));
        lc.setPadding(5);
        table.addCell(lc);
        PdfPCell vc = new PdfPCell(new Phrase(value, f));
        vc.setBorderColor(new BaseColor(226, 232, 240));
        vc.setPadding(5);
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(vc);
    }

    private String formatAmt(BigDecimal val) {
        if (val == null) return "0.00";
        return String.format("%.2f", val);
    }
}
