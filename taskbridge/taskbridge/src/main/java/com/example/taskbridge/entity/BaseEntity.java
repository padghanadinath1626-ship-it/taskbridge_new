package com.example.taskbridge.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter @Setter
public class BaseEntity {
	 @CreationTimestamp
	 private LocalDateTime createdAt;

	 @UpdateTimestamp
	 private LocalDateTime updatedAt;

	 private boolean deleted = false;

	 public LocalDateTime getCreatedAt() {
		 return createdAt;
	 }

	 public void setCreatedAt(LocalDateTime createdAt) {
		 this.createdAt = createdAt;
	 }

	 public LocalDateTime getUpdatedAt() {
		 return updatedAt;
	 }

	 public void setUpdatedAt(LocalDateTime updatedAt) {
		 this.updatedAt = updatedAt;
	 }

	 public boolean isDeleted() {
		 return deleted;
	 }

	 public void setDeleted(boolean deleted) {
		 this.deleted = deleted;
	 }

	 public BaseEntity(LocalDateTime createdAt, LocalDateTime updatedAt, boolean deleted) {
		super();
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.deleted = deleted;
	 }
	 
	 public BaseEntity() {
		 
	 }
	 
	 
}
