package com.gstbilling.controller;

import com.gstbilling.entity.Customer;
import com.gstbilling.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public List<Customer> getAll(@RequestParam(required = false) String search) {
        if (search != null && !search.isEmpty()) return customerRepository.searchCustomers(search);
        return customerRepository.findByIsActiveTrue();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Customer> create(@RequestBody Customer customer) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> update(@PathVariable Long id, @RequestBody Customer updated) {
        return customerRepository.findById(id).map(c -> {
            c.setName(updated.getName());
            c.setEmail(updated.getEmail());
            c.setPhone(updated.getPhone());
            c.setAddress(updated.getAddress());
            c.setCity(updated.getCity());
            c.setState(updated.getState());
            c.setStateCode(updated.getStateCode());
            c.setPincode(updated.getPincode());
            c.setGstin(updated.getGstin());
            c.setPanNumber(updated.getPanNumber());
            return ResponseEntity.ok(customerRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        customerRepository.findById(id).ifPresent(c -> {
            c.setActive(false);
            customerRepository.save(c);
        });
        return ResponseEntity.noContent().build();
    }
}
