package com.shumaim.wallet.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@Table(name = "roles")
public class UserRole {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "role_id")
    private long roleId;

    private String name;

    // Constructor to allow deserialization of a String into a UserRole object
    public UserRole(String name) {
        this.name = name;
    }

    public UserRole(long roleId, String name) {
        this.roleId = roleId;
        this.name = name;
    }
}
