package com.shumaim.wallet.service;

import com.shumaim.wallet.entities.UserInfo;
import com.shumaim.wallet.repository.UserRepository;
import com.shumaim.wallet.response.UserDetailsResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class BankUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserInfo user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                Collections.emptyList()
        );
    }

    public UserInfo getUserDetailsByUsername(String username) {
        UserInfo user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        return user;
    }

    public List<UserInfo> searchUsersByQuery(String query) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query);
    }

    public boolean emailInUse(String email, String username) {
        return userRepository.existsByEmailAndUsernameNot(email, username);
    }

    public UserInfo saveUser(UserInfo user) {
        return userRepository.save(user);
    }

}
