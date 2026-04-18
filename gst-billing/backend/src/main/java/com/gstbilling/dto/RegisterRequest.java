package com.gstbilling.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;
    @NotBlank
    @Size(min = 6)
    private String password;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String fullName;
}
