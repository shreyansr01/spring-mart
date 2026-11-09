package com.backend.springmart.controller;

import com.backend.springmart.dto.ProductRequest;
import com.backend.springmart.model.Product;
import com.backend.springmart.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api")
public class ProductController
{
    private final ProductService service;

    public ProductController(ProductService service)
    {
        this.service = service;
    }

    @GetMapping("/")
    public ResponseEntity<String> hello()
    {
        return ResponseEntity.ok("Hello from Spring Boot!");
    }

    @GetMapping("/products")
    public ResponseEntity<Page<Product>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size)
    {
        return ResponseEntity.ok(service.getAllProducts(PageRequest.of(page, size)));
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable int id)
    {
        Product product = service.getProductById(id);
        if (product == null)
        {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/image/{id}")
    public ResponseEntity<byte[]> getProductImage(@PathVariable int id)
    {
        Product product = service.getProductById(id);
        if (product == null || product.getImageData() == null)
        {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header("Content-Type", product.getImageType())
                .body(product.getImageData());
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam String keyword)
    {
        return ResponseEntity.ok(service.searchProducts(keyword));
    }

    @PostMapping("/products")
    public ResponseEntity<Product> addProduct(
            @Valid @RequestPart ProductRequest product,
            @RequestPart(required = false) MultipartFile imageFile)
    {
        try
        {
            Product createdProduct = service.addOrUpdateProduct(toProduct(product), imageFile);
            return ResponseEntity.created(URI.create("/api/products/" + createdProduct.getId()))
                    .body(createdProduct);
        }
        catch (RuntimeException e)
        {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<Object> updateProduct(
            @PathVariable int id,
            @RequestPart ProductRequest product,
            @RequestPart(required = false) MultipartFile imageFile)
    {
        try
        {
            Product productToUpdate = toProduct(product);
            productToUpdate.setId(id);
            Product updatedProduct = service.addOrUpdateProduct(productToUpdate, imageFile);
            return ResponseEntity.ok(updatedProduct);
        }
        catch (RuntimeException e)
        {
            if ("Product not found".equals(e.getMessage()))
            {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found");
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
        catch (Exception e)
        {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred");
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable int id)
    {
        Product product = service.getProductById(id);
        if (product == null)
        {
            return ResponseEntity.notFound().build();
        }
        service.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    private Product toProduct(ProductRequest request)
    {
        Product product = new Product();
        product.setName(request.getName());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setCategory(request.getCategory());
        product.setQuantity(request.getQuantity());
        product.setBrand(request.getBrand());
        product.setInStock(request.getInStock());
        product.setReleaseDate(request.getReleaseDate());
        return product;
    }
}
