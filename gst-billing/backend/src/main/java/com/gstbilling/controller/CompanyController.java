package com.gstbilling.controller;

import com.gstbilling.entity.CompanyProfile;
import com.gstbilling.repository.CompanyProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/company")
public class CompanyController {

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @GetMapping
    public ResponseEntity<CompanyProfile> get() {
        return companyProfileRepository.findFirstBy()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public CompanyProfile createOrUpdate(@RequestBody CompanyProfile profile) {
        return companyProfileRepository.findFirstBy().map(existing -> {
            existing.setName(profile.getName());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setState(profile.getState());
            existing.setStateCode(profile.getStateCode());
            existing.setPincode(profile.getPincode());
            existing.setPhone(profile.getPhone());
            existing.setEmail(profile.getEmail());
            existing.setWebsite(profile.getWebsite());
            existing.setGstin(profile.getGstin());
            existing.setPanNumber(profile.getPanNumber());
            existing.setBankName(profile.getBankName());
            existing.setAccountNumber(profile.getAccountNumber());
            existing.setIfscCode(profile.getIfscCode());
            existing.setBankBranch(profile.getBankBranch());
            existing.setInvoicePrefix(profile.getInvoicePrefix());
            return companyProfileRepository.save(existing);
        }).orElseGet(() -> companyProfileRepository.save(profile));
    }
}
