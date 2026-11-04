package com.shumaim.wallet.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    /**
     * Signing key is built once from the `jwt.secret` property in
     * application.properties. Some secrets are Base64 encoded, some are plain
     * text - we support both so it is impossible to lose the key by accident.
     */
    private final SecretKey signingKey;
    private final long expirationMillis;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-ms:3600000}") long expirationMillis) {
        this.signingKey = buildKey(secret);
        this.expirationMillis = expirationMillis;
    }

    private static SecretKey buildKey(String secret) {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("jwt.secret must be configured in application.properties");
        }
        byte[] keyBytes;
        try {
            // If it happens to be valid Base64 with enough entropy, use the decoded bytes.
            byte[] decoded = Decoders.BASE64.decode(secret);
            keyBytes = decoded.length >= 32 ? decoded : secret.getBytes(StandardCharsets.UTF_8);
        } catch (Exception notBase64) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        // HS256 requires at least 256 bits (32 bytes).
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret must be at least 32 characters long");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaim(token);
        return claimsResolver.apply(claims);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    public String createToken(Map<String, Object> claims, String username) {
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(signingKey)
                .compact();

    }

    public String generateToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, username);
    }

    private Claims extractAllClaim(String token) {
        return Jwts
                .parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Key getSignKey() {
        return signingKey;
    }
}
