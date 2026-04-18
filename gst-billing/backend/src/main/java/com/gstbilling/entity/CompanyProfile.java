package com.gstbilling.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_profile")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String address;
    private String city;
    private String state;

    @Column(name = "state_code")
    private String stateCode;

    private String pincode;
    private String phone;
    private String email;
    private String website;

    @Column(nullable = false, unique = true)
    private String gstin;

    @Column(name = "pan_number")
    private String panNumber;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifsc_code")
    private String ifscCode;

    @Column(name = "bank_branch")
    private String bankBranch;

    @Column(name = "invoice_prefix")
    private String invoicePrefix = "INV";

    @Column(name = "invoice_counter")
    private Integer invoiceCounter = 1;

    @Column(name = "signature_text")
    private String signatureText;

    private String logo;
}
