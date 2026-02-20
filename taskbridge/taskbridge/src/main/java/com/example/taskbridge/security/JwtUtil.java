package com.example.taskbridge.security;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

 @Value("${jwt.secret}")
 private String secret;

 @Value("${jwt.expiration:3600000}")
 private long expiration;

 public String generateToken(String email){
  return Jwts.builder()
   .setSubject(email)
   .setIssuedAt(new Date())
   .setExpiration(new Date(System.currentTimeMillis() + expiration))
   .signWith(Keys.hmacShaKeyFor(secret.getBytes()), SignatureAlgorithm.HS256)
   .compact();
 }

 public String extractEmail(String token){
  return Jwts.parserBuilder()
   .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
   .build()
   .parseClaimsJws(token)
   .getBody()
   .getSubject();
 }

 public boolean isTokenValid(String token){
  try {
    Jwts.parserBuilder()
     .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
     .build()
     .parseClaimsJws(token);
    return true;
  } catch (Exception e) {
    return false;
  }
 }

 public boolean isTokenExpired(String token){
  try {
    Date expiration = Jwts.parserBuilder()
     .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes()))
     .build()
     .parseClaimsJws(token)
     .getBody()
     .getExpiration();
    return expiration.before(new Date());
  } catch (Exception e) {
    return true;
  }
 }
}

