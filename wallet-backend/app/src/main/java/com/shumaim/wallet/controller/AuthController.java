package com.shumaim.wallet.controller;

import com.shumaim.wallet.request.SignupRequestDTO;
import com.shumaim.wallet.request.JwtTokenRequestDTO;
import com.shumaim.wallet.request.LoginRequestDTO;
import com.shumaim.wallet.response.LoginResponseDTO;
import com.shumaim.wallet.response.SignupResponseDTO;
import com.shumaim.wallet.service.AuthService;
import com.shumaim.wallet.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthService authService;



    @PostMapping("v1/auth/signup")
    public ResponseEntity<SignupResponseDTO> signup(@RequestBody SignupRequestDTO signupDto) {
        try {
            if (authService.userExists(signupDto.getUsername())
                    || authService.emailExists(signupDto.getEmail())
                    || authService.phoneExists(signupDto.getPhone())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new SignupResponseDTO("Username, email or phone already exists"));
            }

            String userId = authService.registerUser(signupDto);
            return ResponseEntity.ok(new SignupResponseDTO("User registered successfully"));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new SignupResponseDTO("Registration failed: " + ex.getMessage()));
        }
    }

    @PostMapping("v1/auth/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        try {
            //Sending username and password to service
            boolean loginUser = authService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());
            if (!loginUser) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new LoginResponseDTO(null, "Invalid credentials"));
            }
            //Generating a jwt token and sending it to the client
            String jwtToken = jwtService.generateToken(loginRequest.getUsername());
            return ResponseEntity.ok(new LoginResponseDTO(jwtToken,"Login successful"));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new LoginResponseDTO(null, "An unexpected error occurred. Please try again."));
        }
    }

    @PostMapping("v1/auth/validateToken")
    public ResponseEntity<?> validateToken(@RequestBody JwtTokenRequestDTO jwtTokenRequest) {
        try {
            String username = jwtService.extractUsername(jwtTokenRequest.getToken());
            boolean isValid = !jwtService.isTokenExpired(jwtTokenRequest.getToken());
            if (isValid) {
                return ResponseEntity.ok("Token is valid");
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token is expired or invalid");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token validation failed: " + e.getMessage());
        }
    }
}
