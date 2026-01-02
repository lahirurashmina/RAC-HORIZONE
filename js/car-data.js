/**
 * Central Car Data Repository
 * Contains detailed information for all rental vehicles
 */

const CarData = {
    cars: [
        {
            id: 'toyota-camry',
            name: 'Toyota Camry',
            type: 'Economy',
            transmission: 'Automatic',
            seats: 5,
            price: 45,
            rating: 4.8,
            image: 'images/car6.jpg',
            description: 'The Toyota Camry is a reliable and fuel-efficient sedan, perfect for city driving and long road trips alike. It offers a comfortable interior and smooth handling.',
            features: ['Bluetooth', 'Air Conditioning', 'Backup Camera', 'USB Port'],
            specs: {
                engine: '2.5L 4-Cylinder',
                fuel: 'Petrol',
                mileage: '32 MPG',
                luggage: '2 Large Bags'
            }
        },
        {
            id: 'honda-crv',
            name: 'Honda CR-V',
            type: 'SUV',
            transmission: 'Automatic',
            seats: 5,
            price: 68,
            rating: 4.7,
            image: 'images/car7.jpg',
            description: 'The Honda CR-V is a versatile SUV with plenty of cargo space and advanced safety features. Ideal for families and outdoor adventures.',
            features: ['Apple CarPlay', 'Heated Seats', 'Lane Departure Warning', 'Dual-Zone AC'],
            specs: {
                engine: '1.5L Turbo',
                fuel: 'Petrol',
                mileage: '28 MPG',
                luggage: '3 Large Bags'
            }
        },
        {
            id: 'bmw-5-series',
            name: 'BMW 5 Series',
            type: 'Luxury',
            transmission: 'Automatic',
            seats: 5,
            price: 115,
            rating: 4.9,
            image: 'images/car1.jpg',
            description: 'Experience pure luxury and performance with the BMW 5 Series. This executive sedan combines state-of-the-art technology with dynamic driving capabilities.',
            features: ['Leather Seats', 'Premium Sound System', 'Sunroof', 'Navigation'],
            specs: {
                engine: '3.0L Inline-6',
                fuel: 'Petrol',
                mileage: '25 MPG',
                luggage: '2 Large Bags'
            }
        },
        {
            id: 'nissan-versa',
            name: 'Nissan Versa',
            type: 'Compact',
            transmission: 'Manual',
            seats: 5,
            price: 35,
            rating: 4.5,
            image: 'images/car7.jpg',
            description: 'The Nissan Versa is an affordable and practical compact car. Its small size makes it perfect for navigating tight city streets and easy parking.',
            features: ['Bluetooth', 'Power Windows', 'Keyless Entry', 'Air Conditioning'],
            specs: {
                engine: '1.6L 4-Cylinder',
                fuel: 'Petrol',
                mileage: '35 MPG',
                luggage: '1 Large Bag'
            }
        },
        {
            id: 'honda-odyssey',
            name: 'Honda Odyssey',
            type: 'Van',
            transmission: 'Automatic',
            seats: 8,
            price: 85,
            rating: 4.6,
            image: 'images/car3.jpg',
            description: 'The ultimate family vehicle, the Honda Odyssey provides spacious seating for up to 8 passengers and a host of entertainment options.',
            features: ['Rear Entertainment System', 'Blind Spot Monitor', 'Power Sliding Doors', 'Tri-Zone AC'],
            specs: {
                engine: '3.5L V6',
                fuel: 'Petrol',
                mileage: '22 MPG',
                luggage: '4 Large Bags'
            }
        },
        {
            id: 'ford-explorer',
            name: 'Ford Explorer',
            type: 'SUV',
            transmission: 'Automatic',
            seats: 7,
            price: 95,
            rating: 4.7,
            image: 'images/stock.jpg',
            description: 'The Ford Explorer is a powerful and capable full-size SUV. With three rows of seating, it\'s built for big adventures and big families.',
            features: ['4WD/AWD', 'Tow Package', 'Roof Rails', 'WIFI Hotspot'],
            specs: {
                engine: '2.3L EcoBoost',
                fuel: 'Petrol',
                mileage: '24 MPG',
                luggage: '3 Large Bags'
            }
        },
        {
            id: 'tesla-model-s',
            name: 'Tesla Model S',
            type: 'Electric',
            transmission: 'Automatic',
            seats: 5,
            price: 145,
            rating: 4.9,
            image: 'images/car2.jpg',
            description: 'Redefine your driving experience with the all-electric Tesla Model S. Unmatched acceleration, long range, and futuristic autopilot technology.',
            features: ['Autopilot', 'Full Self-Driving Capability', 'Panoramic Glass Roof', 'Massive Touchscreen'],
            specs: {
                engine: 'Dual Motor Electric',
                fuel: 'Electric',
                mileage: '400+ Mile Range',
                luggage: '2 Large Bags'
            }
        },
        {
            id: 'audi-a4',
            name: 'Audi A4',
            type: 'Luxury',
            transmission: 'Automatic',
            seats: 5,
            price: 95,
            rating: 4.7,
            image: 'images/car4.jpg',
            description: 'The Audi A4 offers a sophisticated interior and precise handling. It\'s a perfect blend of style, comfort, and German engineering.',
            features: ['Virtual Cockpit', 'Quattro AWD', 'Interior Ambient Lighting', 'Smartphone Interface'],
            specs: {
                engine: '2.0L Turbo',
                fuel: 'Petrol',
                mileage: '27 MPG',
                luggage: '2 Large Bags'
            }
        },
        {
            id: 'porsche-911',
            name: 'Porsche 911',
            type: 'Sports',
            transmission: 'Automatic',
            seats: 2,
            price: 250,
            rating: 5.0,
            image: 'images/car5.jpg',
            description: 'The legendary Porsche 911 is the gold standard for sports cars. Experience heart-pounding acceleration and iconic design.',
            features: ['Sport Chrono Package', 'Active Suspension', 'Bose Surround Sound', 'Launch Control'],
            specs: {
                engine: '3.0L Flat-6 Twin Turbo',
                fuel: 'Petrol',
                mileage: '20 MPG',
                luggage: '1 Small Bag'
            }
        }
    ],

    getCarById(id) {
        return this.cars.find(car => car.id === id);
    },

    getCarByName(name) {
        return this.cars.find(car => car.name.toLowerCase() === name.toLowerCase());
    }
};
