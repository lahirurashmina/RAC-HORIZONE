-- =============================================
-- Fix: Insert Default Admin and Vehicle
-- This resolves the foreign key constraint error
-- =============================================

USE car_rental;

-- First, check if Admin exists, if not create one
INSERT IGNORE INTO Admin (AdminId, Name, Email, Password) 
VALUES (1, 'System Admin', 'admin@horizone.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Now insert the BMW 5 Series vehicle (VehicleId = 1)
INSERT IGNORE INTO Vehicle (VehicleId, Model, Type, Price_per_day, Capacity, Available, Vimage, AdminId) 
VALUES (1, 'BMW 5 Series', 'Luxury Sedan', 89.00, 5, TRUE, 'images/car8.jpg', 1);

-- Insert additional vehicles for the catalog
INSERT IGNORE INTO Vehicle (VehicleId, Model, Type, Price_per_day, Capacity, Available, Vimage, AdminId) 
VALUES 
(2, 'Tesla Model S', 'Electric Sedan', 120.00, 5, TRUE, 'images/car2.jpg', 1),
(3, 'Mercedes GLE', 'Luxury SUV', 150.00, 7, TRUE, 'images/car3.jpg', 1),
(4, 'Audi A4', 'Premium Sedan', 95.00, 5, TRUE, 'images/car4.jpg', 1),
(5, 'Porsche 911', 'Sports Car', 250.00, 2, TRUE, 'images/car5.jpg', 1),
(6, 'Honda Civic', 'Economy Sedan', 45.00, 5, TRUE, 'images/car6.jpg', 1);

-- Verify the data was inserted
SELECT * FROM Vehicle;

-- =============================================
-- End of Fix
-- =============================================
