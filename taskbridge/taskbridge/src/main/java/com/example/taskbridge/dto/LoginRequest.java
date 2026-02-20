package com.example.taskbridge.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class LoginRequest {

 public String email;
 public String password;
 public String getEmail() {
	return email;
 }
 public void setEmail(String email) {
	this.email = email;
 }
 public String getPassword() {
	return password;
 }
 public void setPassword(String password) {
	this.password = password;
 }
 public LoginRequest(String email, String password) {
	super();
	this.email = email;
	this.password = password;
 }
 
 public LoginRequest() {
	 
 }
}

