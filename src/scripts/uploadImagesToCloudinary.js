/**
 * Upload Images to Cloudinary
 * Downloads sample images and uploads to your Cloudinary account
 */

import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// === CURATED TRAVEL IMAGES ===
// Using Lorem Picsum (free, no API key needed, high quality)
const travelImages = {
  // Profile Photos (portraits)
  profiles: [
    'https://picsum.photos/id/64/400/400',  // Person 1
    'https://picsum.photos/id/65/400/400',  // Person 2
    'https://picsum.photos/id/91/400/400',  // Person 3
    'https://picsum.photos/id/177/400/400', // Person 4
    'https://picsum.photos/id/203/400/400', // Person 5
    'https://picsum.photos/id/213/400/400', // Person 6
    'https://picsum.photos/id/227/400/400', // Person 7
    'https://picsum.photos/id/235/400/400', // Person 8
    'https://picsum.photos/id/237/400/400', // Person 9
    'https://picsum.photos/id/453/400/400', // Person 10
  ],

  // Travel & Nature Posts
  landscapes: [
    'https://picsum.photos/id/10/800/600',  // Mountain landscape
    'https://picsum.photos/id/15/800/600',  // Beach scene
    'https://picsum.photos/id/18/800/600',  // Forest path
    'https://picsum.photos/id/20/800/600',  // Ocean view
    'https://picsum.photos/id/28/800/600',  // City architecture
    'https://picsum.photos/id/29/800/600',  // Desert landscape
    'https://picsum.photos/id/33/800/600',  // Lake reflection
    'https://picsum.photos/id/40/800/600',  // Vintage architecture
    'https://picsum.photos/id/48/800/600',  // Waterfall
    'https://picsum.photos/id/58/800/600',  // Coastal cliffs
    'https://picsum.photos/id/78/800/600',  // City skyline
    'https://picsum.photos/id/82/800/600',  // Historical building
    'https://picsum.photos/id/87/800/600',  // Mountain peak
    'https://picsum.photos/id/96/800/600',  // Bridge
    'https://picsum.photos/id/100/800/600', // Beach sunset
    'https://picsum.photos/id/104/800/600', // Urban scene
    'https://picsum.photos/id/110/800/600', // Tropical beach
    'https://picsum.photos/id/119/800/600', // Night city
    'https://picsum.photos/id/129/800/600', // Garden
    'https://picsum.photos/id/137/800/600', // Temple
    'https://picsum.photos/id/152/800/600', // Countryside
    'https://picsum.photos/id/158/800/600', // River valley
    'https://picsum.photos/id/164/800/600', // Castle
    'https://picsum.photos/id/175/800/600', // Lighthouse
    'https://picsum.photos/id/180/800/600', // Village
    'https://picsum.photos/id/188/800/600', // Plateau
    'https://picsum.photos/id/201/800/600', // Forest lake
    'https://picsum.photos/id/206/800/600', // Autumn scene
    'https://picsum.photos/id/217/800/600', // Winter mountain
    'https://picsum.photos/id/225/800/600', // Spring meadow
  ],

  // Food & Culture
  food: [
    'https://picsum.photos/id/292/800/600', // Food 1
    'https://picsum.photos/id/326/800/600', // Food 2
    'https://picsum.photos/id/365/800/600', // Food 3
    'https://picsum.photos/id/431/800/600', // Food 4
    'https://picsum.photos/id/488/800/600', // Food 5
  ],

  // Adventure & Activities
  activities: [
    'https://picsum.photos/id/13/800/600',  // Hiking trail
    'https://picsum.photos/id/22/800/600',  // Outdoor activity
    'https://picsum.photos/id/42/800/600',  // Adventure sport
    'https://picsum.photos/id/50/800/600',  // Cycling
    'https://picsum.photos/id/103/800/600', // Kayaking
  ],
};

// === HELPER FUNCTIONS ===
async function downloadImage(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            // Handle redirect
            return downloadImage(response.headers.location, retries - i).then(resolve).catch(reject);
          }
          
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download: ${response.statusCode}`));
            return;
          }

          const chunks = [];
          response.on('data', (chunk) => chunks.push(chunk));
          response.on('end', () => resolve(Buffer.concat(chunks)));
          response.on('error', reject);
        }).on('error', reject);
      });
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`  ⚠️  Retry ${i + 1}/${retries} for ${url}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function uploadToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `travelnetwork/${folder}`,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
}

// === UPLOAD FUNCTIONS ===
async function uploadProfilePhotos() {
  console.log('📸 Uploading profile photos...');
  const urls = [];

  for (let i = 0; i < travelImages.profiles.length; i++) {
    const imageUrl = travelImages.profiles[i];
    try {
      const buffer = await downloadImage(imageUrl);
      const result = await uploadToCloudinary(buffer, 'profiles', `profile_${i + 1}`);
      urls.push(result.secure_url);
      console.log(`  ✓ Uploaded profile ${i + 1}/10: ${result.secure_url}`);
    } catch (error) {
      console.error(`  ❌ Failed to upload profile ${i + 1}:`, error.message);
      urls.push(null);
    }
  }

  return urls;
}

async function uploadLandscapePhotos() {
  console.log('\n🏞️  Uploading landscape photos...');
  const urls = [];

  for (let i = 0; i < travelImages.landscapes.length; i++) {
    const imageUrl = travelImages.landscapes[i];
    try {
      const buffer = await downloadImage(imageUrl);
      const result = await uploadToCloudinary(buffer, 'posts', `landscape_${i + 1}`);
      urls.push(result.secure_url);
      
      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ Uploaded ${i + 1}/${travelImages.landscapes.length} landscapes...`);
      }
    } catch (error) {
      console.error(`  ❌ Failed to upload landscape ${i + 1}:`, error.message);
      urls.push(null);
    }
  }

  console.log(`  ✓ Uploaded ${urls.filter(u => u).length}/${travelImages.landscapes.length} landscapes`);
  return urls;
}

async function uploadFoodPhotos() {
  console.log('\n🍜 Uploading food photos...');
  const urls = [];

  for (let i = 0; i < travelImages.food.length; i++) {
    const imageUrl = travelImages.food[i];
    try {
      const buffer = await downloadImage(imageUrl);
      const result = await uploadToCloudinary(buffer, 'posts', `food_${i + 1}`);
      urls.push(result.secure_url);
      console.log(`  ✓ Uploaded food ${i + 1}/5: ${result.secure_url}`);
    } catch (error) {
      console.error(`  ❌ Failed to upload food ${i + 1}:`, error.message);
      urls.push(null);
    }
  }

  return urls;
}

async function uploadActivityPhotos() {
  console.log('\n🏃 Uploading activity photos...');
  const urls = [];

  for (let i = 0; i < travelImages.activities.length; i++) {
    const imageUrl = travelImages.activities[i];
    try {
      const buffer = await downloadImage(imageUrl);
      const result = await uploadToCloudinary(buffer, 'posts', `activity_${i + 1}`);
      urls.push(result.secure_url);
      console.log(`  ✓ Uploaded activity ${i + 1}/5: ${result.secure_url}`);
    } catch (error) {
      console.error(`  ❌ Failed to upload activity ${i + 1}:`, error.message);
      urls.push(null);
    }
  }

  return urls;
}

// === SAVE URLs TO FILE ===
function saveUrlsToFile(data) {
  const outputPath = path.join(__dirname, 'cloudinaryUrls.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  console.log(`\n💾 URLs saved to: ${outputPath}`);
}

// === MAIN EXECUTION ===
async function main() {
  try {
    console.log('════════════════════════════════════════════════════');
    console.log('  Upload Images to Cloudinary');
    console.log('════════════════════════════════════════════════════\n');

    console.log('📋 Configuration:');
    console.log(`  • Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
    console.log(`  • API Key: ${process.env.CLOUDINARY_API_KEY}`);
    console.log(`  • Folder: travelnetwork/\n`);

    const startTime = Date.now();

    // Upload all image types
    const profileUrls = await uploadProfilePhotos();
    const landscapeUrls = await uploadLandscapePhotos();
    const foodUrls = await uploadFoodPhotos();
    const activityUrls = await uploadActivityPhotos();

    const allUrls = {
      profiles: profileUrls.filter(u => u),
      landscapes: landscapeUrls.filter(u => u),
      food: foodUrls.filter(u => u),
      activities: activityUrls.filter(u => u),
      uploadedAt: new Date().toISOString(),
    };

    // Save URLs to file
    saveUrlsToFile(allUrls);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n════════════════════════════════════════════════════');
    console.log('✅ UPLOAD COMPLETED!');
    console.log('════════════════════════════════════════════════════\n');

    console.log('📊 Summary:');
    console.log(`  • Profile Photos: ${allUrls.profiles.length}/10`);
    console.log(`  • Landscape Photos: ${allUrls.landscapes.length}/30`);
    console.log(`  • Food Photos: ${allUrls.food.length}/5`);
    console.log(`  • Activity Photos: ${allUrls.activities.length}/5`);
    console.log(`  • Total: ${allUrls.profiles.length + allUrls.landscapes.length + allUrls.food.length + allUrls.activities.length} images`);
    console.log(`  • Duration: ${duration}s\n`);

    console.log('🎯 Next Steps:');
    console.log('  1. Run seed script: node src/scripts/seedRealisticData.js');
    console.log('  2. URLs will be loaded from cloudinaryUrls.json');
    console.log('  3. All images will display correctly!\n');

  } catch (error) {
    console.error('\n❌ Error uploading images:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

main();
