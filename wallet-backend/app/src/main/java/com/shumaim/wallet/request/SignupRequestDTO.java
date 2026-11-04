package com.shumaim.wallet.request;

import lombok.Data;

@Data
public class SignupRequestDTO {
    private String username;
    private String password;
    private String email;
    private String phone;
    private String role;
}
