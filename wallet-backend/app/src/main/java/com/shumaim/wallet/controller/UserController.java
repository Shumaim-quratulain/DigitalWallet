package com.shumaim.wallet.controller;

import com.shumaim.wallet.entities.UserInfo;
import com.shumaim.wallet.request.UserRequestDTO;
import com.shumaim.wallet.request.UpdateEmailRequestDTO;
import com.shumaim.wallet.response.UserDetailsResponseDTO;
import com.shumaim.wallet.service.BankUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin
public class UserController {

    @Autowired
    private BankUserDetailsService bankUserDetailsService;

    @PostMapping("v1/user/getUserDetails")
    public ResponseEntity<UserDetailsResponseDTO> getUserDetails(@RequestBody UserRequestDTO userRequestDTO) {
        try {
            String username = userRequestDTO.getUsername();
            UserInfo user = bankUserDetailsService.getUserDetailsByUsername(username);

            UserDetailsResponseDTO responseDTO = new UserDetailsResponseDTO();
            responseDTO.setId(user.getId());
            responseDTO.setUsername(user.getUsername());
            responseDTO.setEmail(user.getEmail());
            responseDTO.setBalance(user.getAccountBalance());

            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new UserDetailsResponseDTO());
        }
    }

    @PutMapping("v1/user/email")
    public ResponseEntity<?> updateEmail(
            @RequestBody UpdateEmailRequestDTO request,
            Authentication authentication
    ) {
        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            return ResponseEntity.badRequest().body("Enter a valid email address");
        }

        UserInfo user = bankUserDetailsService.getUserDetailsByUsername(authentication.getName());
        if (bankUserDetailsService.emailInUse(email, user.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already in use");
        }

        user.setEmail(email);
        bankUserDetailsService.saveUser(user);
        return ResponseEntity.ok("Email updated successfully");
    }

    @GetMapping("v1/user/search")
    public ResponseEntity<?> searchUser(@RequestParam("query") String query) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated() ||
                    authentication.getPrincipal().equals("anonymousUser")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("No JWT token provided or token is invalid.");
            }

            String currentUsername = authentication.getName();

            List<UserInfo> matchedUsers = bankUserDetailsService.searchUsersByQuery(query);

            List<UserDetailsResponseDTO> response = matchedUsers.stream()
                    .filter(user -> !user.getUsername().equals(currentUsername))
                    .map(user -> {
                        UserDetailsResponseDTO dto = new UserDetailsResponseDTO();
                        dto.setId(user.getId());
                        dto.setUsername(user.getUsername());
                        dto.setEmail(user.getEmail());
                        dto.setBalance(user.getAccountBalance());
                        return dto;
                    }).collect(Collectors.toList());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

}
