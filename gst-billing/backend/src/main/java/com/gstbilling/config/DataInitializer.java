package com.gstbilling.config;

import com.gstbilling.entity.*;
import com.gstbilling.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Auto-seeds the database on startup if empty.
 * No need to run seed.sql manually.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CompanyProfileRepository companyRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        // ── Admin user ──────────────────────────────────────────
        if (!userRepository.existsByUsername("admin")) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))   // encoded at runtime ✅
                    .email("admin@gstbilling.com")
                    .fullName("Admin User")
                    .role(User.Role.ADMIN)
                    .build());
            System.out.println("✅ Admin user created  →  admin / admin123");
        }

        // ── Company profile ─────────────────────────────────────
        if (companyRepository.findFirstBy().isEmpty()) {
            companyRepository.save(CompanyProfile.builder()
                    .name("My Business Pvt Ltd")
                    .address("123 MG Road, Anna Nagar")
                    .city("Chennai")
                    .state("Tamil Nadu")
                    .stateCode("33")
                    .pincode("600040")
                    .phone("+91 98765 43210")
                    .email("billing@mybusiness.com")
                    .website("https://mybusiness.com")
                    .gstin("33AABCM1234A1ZP")
                    .panNumber("AABCM1234A")
                    .bankName("State Bank of India")
                    .accountNumber("12345678901234")
                    .ifscCode("SBIN0001234")
                    .bankBranch("Anna Nagar Branch")
                    .invoicePrefix("INV")
                    .invoiceCounter(1)
                    .build());
            System.out.println("✅ Company profile created");
        }

        // ── Sample customers ────────────────────────────────────
        if (customerRepository.count() == 0) {
            customerRepository.save(Customer.builder()
                    .name("Rajan Enterprises").email("rajan@rajanent.com")
                    .phone("9876543210").address("45 T Nagar, Main Road")
                    .city("Chennai").state("Tamil Nadu").stateCode("33")
                    .pincode("600017").gstin("33AABCR9876B1Z1")
                    .panNumber("AABCR9876B").isActive(true).build());

            customerRepository.save(Customer.builder()
                    .name("Vijay Traders").email("vijay@vijaytraders.in")
                    .phone("9845612378").address("12 Anna Salai")
                    .city("Chennai").state("Tamil Nadu").stateCode("33")
                    .pincode("600002").gstin("33AABCV5432C1Z2")
                    .panNumber("AABCV5432C").isActive(true).build());

            customerRepository.save(Customer.builder()
                    .name("Mumbai Tech Pvt Ltd").email("info@mumbaitech.com")
                    .phone("9123456789").address("501 Bandra Kurla Complex")
                    .city("Mumbai").state("Maharashtra").stateCode("27")
                    .pincode("400051").gstin("27AABCM7654D1Z3")
                    .panNumber("AABCM7654D").isActive(true).build());

            customerRepository.save(Customer.builder()
                    .name("Delhi Solutions").email("ops@delhisol.com")
                    .phone("9988776655").address("88 Connaught Place")
                    .city("New Delhi").state("Delhi").stateCode("07")
                    .pincode("110001").gstin("07AABCD1122E1Z4")
                    .panNumber("AABCD1122E").isActive(true).build());

            System.out.println("✅ Sample customers created (4)");
        }

        // ── Sample products ─────────────────────────────────────
        if (productRepository.count() == 0) {
            productRepository.save(Product.builder()
                    .name("Web Development Services").description("Custom website development")
                    .hsnCode("998313").price(new BigDecimal("50000"))
                    .unit("Hr").gstRate(new BigDecimal("18")).stockQuantity(100).isActive(true).build());

            productRepository.save(Product.builder()
                    .name("Cloud Hosting (Annual)").description("Managed cloud server")
                    .hsnCode("997314").price(new BigDecimal("12000"))
                    .unit("Nos").gstRate(new BigDecimal("18")).stockQuantity(50).isActive(true).build());

            productRepository.save(Product.builder()
                    .name("Laptop – 15 inch").description("Business laptop with SSD")
                    .hsnCode("847130").price(new BigDecimal("65000"))
                    .unit("Nos").gstRate(new BigDecimal("18")).stockQuantity(20).isActive(true).build());

            productRepository.save(Product.builder()
                    .name("Software License (Annual)").description("Enterprise software subscription")
                    .hsnCode("997331").price(new BigDecimal("25000"))
                    .unit("Nos").gstRate(new BigDecimal("18")).stockQuantity(999).isActive(true).build());

            productRepository.save(Product.builder()
                    .name("Consulting (per hour)").description("IT consulting and advisory")
                    .hsnCode("998314").price(new BigDecimal("3000"))
                    .unit("Hr").gstRate(new BigDecimal("18")).stockQuantity(999).isActive(true).build());

            productRepository.save(Product.builder()
                    .name("Office Chair").description("Ergonomic office chair")
                    .hsnCode("940130").price(new BigDecimal("8500"))
                    .unit("Nos").gstRate(new BigDecimal("18")).stockQuantity(30).isActive(true).build());

            System.out.println("✅ Sample products created (6)");
        }
    }
}
