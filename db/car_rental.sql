-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 21, 2025 at 09:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `car_rental`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `AdminId` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`AdminId`, `Name`, `Email`, `Password`) VALUES
(1, 'System Admin', 'admin@horizone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- --------------------------------------------------------

--
-- Table structure for table `admin_approves_booking`
--

CREATE TABLE `admin_approves_booking` (
  `AdminId` int(11) NOT NULL,
  `Bookid` int(11) NOT NULL,
  `Approved_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `booking`
--

CREATE TABLE `booking` (
  `Bookid` int(11) NOT NULL,
  `Start_date` date NOT NULL,
  `End_date` date NOT NULL,
  `Total_price` decimal(10,2) NOT NULL,
  `Status` enum('Pending','Approved','Rejected','Completed','Cancelled') DEFAULT 'Pending',
  `Booking_date` datetime DEFAULT current_timestamp(),
  `Cusid` int(11) NOT NULL,
  `VehicleId` int(11) NOT NULL
) ;

--
-- Dumping data for table `booking`
--

INSERT INTO `booking` (`Bookid`, `Start_date`, `End_date`, `Total_price`, `Status`, `Booking_date`, `Cusid`, `VehicleId`) VALUES
(1, '2025-12-21', '2025-12-26', 445.00, 'Pending', '2025-12-20 21:38:08', 1, 1),
(2, '2025-12-23', '2025-12-27', 140.00, 'Pending', '2025-12-21 00:26:12', 1, 4),
(3, '2025-12-23', '2025-12-29', 210.00, 'Pending', '2025-12-21 17:58:13', 1, 4),
(4, '2025-12-31', '2026-01-03', 105.00, 'Pending', '2025-12-21 18:54:59', 1, 4),
(5, '2025-12-24', '2025-12-27', 285.00, 'Pending', '2025-12-21 18:55:23', 1, 6);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `Cusid` int(11) NOT NULL,
  `Name` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Ctel` varchar(20) DEFAULT NULL,
  `Caddress` text DEFAULT NULL,
  `Cdob` date DEFAULT NULL,
  `Gender` enum('Male','Female','Other') DEFAULT NULL,
  `Image` varchar(255) DEFAULT NULL,
  `Created_date` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer`
--

INSERT INTO `customer` (`Cusid`, `Name`, `Email`, `Password`, `Ctel`, `Caddress`, `Cdob`, `Gender`, `Image`, `Created_date`) VALUES
(1, 'Demon LR', 'demon@gmail.com', '$2y$10$Kt6mHoNfYmTIUk/72XQHB.pJoC4mkD5UPCKkLZTBcK2qAqCoNt8DW', '0912345678', 'New York', '2000-02-04', 'Male', 'uploads/profiles/profile_1_1766324349.jpg', '2025-12-20'),
(2, 'Latte Coffee', 'coffee@gmail.com', '$2y$10$LVKqRj7UiWCpsNBQ1RXtbe6m8rOkvR1DhX.rkCTjtFl39ukJGNNZG', '0912345678', 'New York', '2001-02-02', 'Female', 'uploads/profiles/profile_6946dc7b89015_1766251643.png', '2025-12-20'),
(3, 'Milo Thush', 'milo@horizone.com', '$2y$10$awSFi7ZSZJ2Ifob7CoBolOpneGs55I3ZtykXwcyRUQB3i.D4zFeLW', '0912345678', 'Not provided', '1995-01-01', 'Male', 'uploads/profiles/profile_3_1766343792.jpg', '2025-12-22');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle`
--

CREATE TABLE `vehicle` (
  `VehicleId` int(11) NOT NULL,
  `Model` varchar(100) NOT NULL,
  `Type` varchar(50) NOT NULL,
  `Price_per_day` decimal(10,2) NOT NULL,
  `Capacity` int(11) NOT NULL,
  `Available` tinyint(1) DEFAULT 1,
  `Vimage` varchar(255) DEFAULT NULL,
  `AdminId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicle`
--

INSERT INTO `vehicle` (`VehicleId`, `Model`, `Type`, `Price_per_day`, `Capacity`, `Available`, `Vimage`, `AdminId`) VALUES
(1, 'BMW 5 Series', 'Luxury Sedan', 89.00, 5, 1, 'images/car8.jpg', 1),
(2, 'Tesla Model S', 'Electric Sedan', 120.00, 5, 1, 'images/car2.jpg', 1),
(3, 'Mercedes GLE', 'Luxury SUV', 150.00, 7, 1, 'images/car3.jpg', 1),
(4, 'Audi A4', 'Premium Sedan', 95.00, 5, 1, 'images/car4.jpg', 1),
(5, 'Porsche 911', 'Sports Car', 250.00, 2, 1, 'images/car5.jpg', 1),
(6, 'Honda Civic', 'Economy Sedan', 45.00, 5, 1, 'images/car6.jpg', 1),
(7, 'BYD', 'Atto3', 20.00, 4, 1, 'images/1766342404_Atto 3-3.jpg', 1),
(8, 'BYD', 'Atto3', 15.00, 2, 1, 'images/1766345474_Atto 3-1.jpg', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`AdminId`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indexes for table `admin_approves_booking`
--
ALTER TABLE `admin_approves_booking`
  ADD PRIMARY KEY (`AdminId`,`Bookid`),
  ADD KEY `fk_approve_booking` (`Bookid`);

--
-- Indexes for table `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`Bookid`),
  ADD KEY `fk_booking_customer` (`Cusid`),
  ADD KEY `fk_booking_vehicle` (`VehicleId`),
  ADD KEY `idx_booking_dates` (`Start_date`,`End_date`),
  ADD KEY `idx_booking_status` (`Status`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`Cusid`),
  ADD UNIQUE KEY `Email` (`Email`),
  ADD KEY `idx_customer_email` (`Email`);

--
-- Indexes for table `vehicle`
--
ALTER TABLE `vehicle`
  ADD PRIMARY KEY (`VehicleId`),
  ADD KEY `fk_vehicle_admin` (`AdminId`),
  ADD KEY `idx_vehicle_available` (`Available`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `AdminId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `booking`
--
ALTER TABLE `booking`
  MODIFY `Bookid` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customer`
--
ALTER TABLE `customer`
  MODIFY `Cusid` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `vehicle`
--
ALTER TABLE `vehicle`
  MODIFY `VehicleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_approves_booking`
--
ALTER TABLE `admin_approves_booking`
  ADD CONSTRAINT `fk_approve_admin` FOREIGN KEY (`AdminId`) REFERENCES `admin` (`AdminId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_approve_booking` FOREIGN KEY (`Bookid`) REFERENCES `booking` (`Bookid`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `fk_booking_customer` FOREIGN KEY (`Cusid`) REFERENCES `customer` (`Cusid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_booking_vehicle` FOREIGN KEY (`VehicleId`) REFERENCES `vehicle` (`VehicleId`) ON UPDATE CASCADE;

--
-- Constraints for table `vehicle`
--
ALTER TABLE `vehicle`
  ADD CONSTRAINT `fk_vehicle_admin` FOREIGN KEY (`AdminId`) REFERENCES `admin` (`AdminId`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
