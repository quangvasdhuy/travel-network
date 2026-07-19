/**
 * Database Initialization Script
 * Creates buckets, indexes, and sample data
 */

import dotenv from 'dotenv';
import dbConnection from '../config/database.js';
import { createAllIndexes } from '../utils/indexManager.js';
import { Destination } from '../models/Destination.js';

dotenv.config();

/**
 * Initialize the database
 */
async function initDatabase() {
  try {
    console.log('=================================');
    console.log('Database Initialization');
    console.log('=================================\n');

    // Connect to Couchbase
    console.log('Step 1: Connecting to Couchbase...');
    await dbConnection.connect();
    console.log('✓ Connected\n');

    // Create indexes
    console.log('Step 2: Creating indexes...');
    await createAllIndexes();
    console.log('✓ Indexes created\n');

    // Create sample destinations
    console.log('Step 3: Creating sample destinations...');
    await createSampleDestinations();
    console.log('✓ Sample destinations created\n');

    console.log('=================================');
    console.log('Database initialization complete!');
    console.log('=================================');

    // Disconnect
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

/**
 * Create sample destination data
 */
async function createSampleDestinations() {
  const destinations = [
    {
      name: 'Paris',
      country: 'France',
      countryCode: 'FR',
      coordinates: { lat: 48.8566, lon: 2.3522 },
      description: 'The City of Light, known for its art, fashion, gastronomy and culture.',
      summary: 'Iconic city famous for the Eiffel Tower, Louvre Museum, and romantic atmosphere.',
      categories: ['city', 'cultural', 'romantic'],
      tags: ['romantic', 'cultural', 'food', 'art', 'museums'],
      climate: { type: 'temperate', bestMonths: [4, 5, 6, 9, 10] },
      travelInfo: { currency: 'EUR', languages: ['French'], timezone: 'CET' },
    },
    {
      name: 'Tokyo',
      country: 'Japan',
      countryCode: 'JP',
      coordinates: { lat: 35.6762, lon: 139.6503 },
      description: 'A vibrant metropolis blending traditional culture with cutting-edge technology.',
      summary: 'Modern city with ancient temples, incredible food, and unique culture.',
      categories: ['city', 'cultural', 'modern'],
      tags: ['technology', 'food', 'cultural', 'shopping', 'temples'],
      climate: { type: 'temperate', bestMonths: [3, 4, 10, 11] },
      travelInfo: { currency: 'JPY', languages: ['Japanese'], timezone: 'JST' },
    },
    {
      name: 'New York',
      country: 'United States',
      countryCode: 'US',
      coordinates: { lat: 40.7128, lon: -74.0060 },
      description: 'The city that never sleeps, a global hub of culture, finance, and entertainment.',
      summary: 'Iconic metropolis with Times Square, Central Park, and diverse culture.',
      categories: ['city', 'modern', 'entertainment'],
      tags: ['urban', 'entertainment', 'food', 'museums', 'shopping'],
      climate: { type: 'temperate', bestMonths: [4, 5, 6, 9, 10] },
      travelInfo: { currency: 'USD', languages: ['English'], timezone: 'EST' },
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      countryCode: 'ID',
      coordinates: { lat: -8.3405, lon: 115.0920 },
      description: 'Tropical paradise known for beautiful beaches, terraced rice paddies, and spiritual culture.',
      summary: 'Island paradise with beaches, temples, yoga retreats, and stunning nature.',
      categories: ['beach', 'island', 'spiritual'],
      tags: ['beach', 'tropical', 'spiritual', 'adventure', 'relaxation'],
      climate: { type: 'tropical', bestMonths: [4, 5, 6, 7, 8, 9] },
      travelInfo: { currency: 'IDR', languages: ['Indonesian', 'Balinese'], timezone: 'WITA' },
    },
    {
      name: 'Barcelona',
      country: 'Spain',
      countryCode: 'ES',
      coordinates: { lat: 41.3851, lon: 2.1734 },
      description: 'Vibrant coastal city famous for Gaudí architecture, beaches, and tapas.',
      summary: 'Mediterranean city with stunning architecture, beaches, and vibrant nightlife.',
      categories: ['city', 'beach', 'cultural'],
      tags: ['beach', 'architecture', 'food', 'nightlife', 'art'],
      climate: { type: 'mediterranean', bestMonths: [4, 5, 6, 9, 10] },
      travelInfo: { currency: 'EUR', languages: ['Spanish', 'Catalan'], timezone: 'CET' },
    },
    {
      name: 'Dubai',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      coordinates: { lat: 25.2048, lon: 55.2708 },
      description: 'Luxurious city in the desert with modern architecture and world-class shopping.',
      summary: 'Modern metropolis with skyscrapers, luxury shopping, and desert adventures.',
      categories: ['city', 'luxury', 'modern'],
      tags: ['luxury', 'shopping', 'modern', 'desert', 'beaches'],
      climate: { type: 'desert', bestMonths: [11, 12, 1, 2, 3] },
      travelInfo: { currency: 'AED', languages: ['Arabic', 'English'], timezone: 'GST' },
    },
    {
      name: 'Santorini',
      country: 'Greece',
      countryCode: 'GR',
      coordinates: { lat: 36.3932, lon: 25.4615 },
      description: 'Stunning island with white-washed buildings, blue-domed churches, and breathtaking sunsets.',
      summary: 'Picturesque Greek island famous for sunsets, white buildings, and volcanic beaches.',
      categories: ['island', 'beach', 'romantic'],
      tags: ['romantic', 'beach', 'photography', 'luxury', 'wine'],
      climate: { type: 'mediterranean', bestMonths: [4, 5, 6, 9, 10] },
      travelInfo: { currency: 'EUR', languages: ['Greek'], timezone: 'EET' },
    },
    {
      name: 'Machu Picchu',
      country: 'Peru',
      countryCode: 'PE',
      coordinates: { lat: -13.1631, lon: -72.5450 },
      description: 'Ancient Incan citadel set high in the Andes Mountains.',
      summary: 'Iconic archaeological site and one of the New Seven Wonders of the World.',
      categories: ['historical', 'mountains', 'adventure'],
      tags: ['historical', 'adventure', 'hiking', 'cultural', 'unesco'],
      climate: { type: 'temperate', bestMonths: [4, 5, 6, 7, 8, 9] },
      travelInfo: { currency: 'PEN', languages: ['Spanish', 'Quechua'], timezone: 'PET' },
    },
    {
      name: 'Iceland',
      country: 'Iceland',
      countryCode: 'IS',
      coordinates: { lat: 64.9631, lon: -19.0208 },
      description: 'Land of fire and ice with glaciers, geysers, waterfalls, and northern lights.',
      summary: 'Nordic island nation with stunning natural wonders and unique landscapes.',
      categories: ['nature', 'adventure', 'unique'],
      tags: ['nature', 'adventure', 'photography', 'northern-lights', 'hiking'],
      climate: { type: 'subarctic', bestMonths: [6, 7, 8] },
      travelInfo: { currency: 'ISK', languages: ['Icelandic'], timezone: 'GMT' },
    },
    {
      name: 'Cape Town',
      country: 'South Africa',
      countryCode: 'ZA',
      coordinates: { lat: -33.9249, lon: 18.4241 },
      description: 'Coastal city with Table Mountain, beautiful beaches, and diverse culture.',
      summary: 'Stunning city with mountains, beaches, wildlife, and vibrant culture.',
      categories: ['city', 'beach', 'nature'],
      tags: ['beach', 'nature', 'adventure', 'wildlife', 'wine'],
      climate: { type: 'mediterranean', bestMonths: [11, 12, 1, 2, 3] },
      travelInfo: { currency: 'ZAR', languages: ['English', 'Afrikaans', 'Xhosa'], timezone: 'SAST' },
    },
  ];

  const tripsBucket = dbConnection.getBucket('trips');
  const collection = tripsBucket.defaultCollection;

  for (const destData of destinations) {
    const destination = Destination.create(destData);
    const key = Destination.getKey(destination.countryCode, destination.slug);

    try {
      await collection.upsert(key, destination);
      console.log(`  ✓ Created destination: ${destination.name}, ${destination.country}`);
    } catch (error) {
      console.error(`  ✗ Failed to create ${destination.name}:`, error.message);
    }
  }
}

// Run the initialization
initDatabase();
