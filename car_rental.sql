-- =============================================
-- Car Rental System Database Schema
-- Based on the provided ER Diagram (Figure 3)
-- Compatible with MySQL / MariaDB / PostgreSQL (minor adjustments may be needed)
-- =============================================

DROP DATABASE IF EXISTS car_rental;
CREATE DATABASE car_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_rental;

-- -----------------------------------------------------
-- Table: Admin
-- -----------------------------------------------------
CREATE TABLE Admin (
    AdminId     INT PRIMARY KEY AUTO_INCREMENT,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(150) UNIQUE NOT NULL,
    Password    VARCHAR(255) NOT NULL   -- Store hashed password
);

-- -----------------------------------------------------
-- Table: Customer
-- -----------------------------------------------------
CREATE TABLE Customer (
    Cusid       INT PRIMARY KEY AUTO_INCREMENT,
    Name        VARCHAR(100) NOT NULL,
    Email       VARCHAR(150) UNIQUE NOT NULL,
    Password    VARCHAR(255) NOT NULL,  -- Store hashed password
    Ctel        VARCHAR(20),
    Caddress    TEXT,
    Cdob        DATE,
    Gender      ENUM('Male','Female','Other'),
    Image       VARCHAR(255),           -- Path to profile image
    Created_date DATE DEFAULT (CURRENT_DATE)
);

-- -----------------------------------------------------
-- Table: Vehicle
-- -----------------------------------------------------
CREATE TABLE Vehicle (
    VehicleId       INT PRIMARY KEY AUTO_INCREMENT,
    Model           VARCHAR(100) NOT NULL,
    Type            VARCHAR(50) NOT NULL,
    Price_per_day   DECIMAL(10,2) NOT NULL,
    Capacity        INT NOT NULL,
    Available       BOOLEAN DEFAULT TRUE,
    Vimage          VARCHAR(255),           -- Path to vehicle image
    AdminId         INT NOT NULL,
    
    CONSTRAINT fk_vehicle_admin
        FOREIGN KEY (AdminId) REFERENCES Admin(AdminId)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- -----------------------------------------------------
-- Table: Booking
-- -----------------------------------------------------
CREATE TABLE Booking (
    Bookid          INT PRIMARY KEY AUTO_INCREMENT,
    Start_date      DATE NOT NULL,
    End_date        DATE NOT NULL,
    Total_price     DECIMAL(10,2) NOT NULL,
    Status          ENUM('Pending','Approved','Rejected','Completed','Cancelled') DEFAULT 'Pending',
    Booking_date    DATETIME DEFAULT CURRENT_TIMESTAMP,
    Cusid           INT NOT NULL,
    VehicleId       INT NOT NULL,
    
    CONSTRAINT fk_booking_customer
        FOREIGN KEY (Cusid) REFERENCES Customer(Cusid)
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (VehicleId) REFERENCES Vehicle(VehicleId)
        ON DELETE RESTRICT ON UPDATE CASCADE,
        
    CONSTRAINT chk_date_order
        CHECK (End_date >= Start_date)
);

-- -----------------------------------------------------
-- Relationship: Admin approves Booking (Optional explicit table)
-- -----------------------------------------------------
CREATE TABLE Admin_Approves_Booking (
    AdminId     INT NOT NULL,
    Bookid      INT NOT NULL,
    Approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (AdminId, Bookid),
    
    CONSTRAINT fk_approve_admin
        FOREIGN KEY (AdminId) REFERENCES Admin(AdminId)
        ON DELETE CASCADE ON UPDATE CASCADE,
        
    CONSTRAINT fk_approve_booking
        FOREIGN KEY (Bookid) REFERENCES Booking(Bookid)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- =============================================
-- Indexes for better performance
-- =============================================
CREATE INDEX idx_booking_dates ON Booking(Start_date, End_date);
CREATE INDEX idx_booking_status ON Booking(Status);
CREATE INDEX idx_vehicle_available ON Vehicle(Available);
CREATE INDEX idx_customer_email ON Customer(Email);

-- =============================================
-- Default Data - Required for System to Work
-- =============================================

-- Insert Default Admin (Required for Vehicle foreign key)
INSERT INTO Admin (AdminId, Name, Email, Password) VALUES
(1, 'System Admin', 'admin@horizone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
-- Default password: 'password' (hashed)

-- Insert Default Vehicles (Required for Booking foreign key)
INSERT INTO Vehicle (VehicleId, Model, Type, Price_per_day, Capacity, Available, Vimage, AdminId) VALUES
(1, 'BMW 5 Series', 'Luxury Sedan', 89.00, 5, TRUE, 'images/car8.jpg', 1),
(2, 'Tesla Model S', 'Electric Sedan', 120.00, 5, TRUE, 'images/car2.jpg', 1),
(3, 'Mercedes GLE', 'Luxury SUV', 150.00, 7, TRUE, 'images/car3.jpg', 1),
(4, 'Audi A4', 'Premium Sedan', 95.00, 5, TRUE, 'images/car4.jpg', 1),
(5, 'Porsche 911', 'Sports Car', 250.00, 2, TRUE, 'images/car5.jpg', 1),
(6, 'Honda Civic', 'Economy Sedan', 45.00, 5, TRUE, 'images/car6.jpg', 1);

-- =============================================
-- Optional: Sample Customer Data (Uncomment if needed for testing)
-- =============================================
/*
INSERT INTO Customer (Name, Email, Password, Ctel, Gender) VALUES
('John Doe', 'john@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '1234567890', 'Male');
-- Password: 'password'
*/

-- =============================================
-- End of SQL file
-- =============================================