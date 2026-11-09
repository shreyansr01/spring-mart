package com.backend.springmart.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
public class Product
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Price is required")
    @Min(value = 0, message = "Price must be greater than or equal to 0")
    private Integer price;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @Min(value = 0, message = "Quantity must be greater than or equal to 0")
    private Integer quantity;

    @NotBlank(message = "Brand is required")
    private String brand;

    private Boolean inStock;
    private Date releaseDate;

    private String imageName;
    private String imageType;

    @Lob
    @JsonIgnore
    private byte[] imageData;
}
