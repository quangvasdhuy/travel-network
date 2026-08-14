/**
 * LARGE DATA SEEDING SCRIPT (Quick Test Version)
 * 
 * Generates large but manageable realistic data:
 * - 100 users
 * - 100 posts per user (10,000 total)
 * - 50 trips per user (5,000 total)
 * - 100-150 connections per user
 * - 80-120 likes per post
 * - 80-120 comments per post
 * 
 * ⚠️ Time: ~30-60 minutes
 */

import 'dotenv/config';
import couchbase from 'couchbase';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Configuration for QUICK TEST
const BATCH_SIZE = 500;
const NUM_USERS = 100;
const POSTS_PER_USER = 100;
const TRIPS_PER_USER = 50;
const MIN_CONNECTIONS_PER_USER = 100;
const MAX_CONNECTIONS_PER_USER = 150;
const MIN_LIKES_PER_POST = 80;
const MAX_LIKES_PER_POST = 120;
const MIN_COMMENTS_PER_POST = 80;
const MAX_COMMENTS_PER_POST = 120;

const COUCHBASE_CONNECTION_STRING = process.env.COUCHBASE_CONNECTION_STRING || 'couchbase://localhost';
const COUCHBASE_USERNAME = process.env.COUCHBASE_USERNAME || 'Administrator';
const COUCHBASE_PASSWORD = process.env.COUCHBASE_PASSWORD || 'password';

console.log(`
════════════════════════════════════════════════════
  🚀 LARGE DATA SEEDING - QUICK TEST VERSION
════════════════════════════════════════════════════

Target Data:
  • ${NUM_USERS.toLocaleString()} users
  • ${(NUM_USERS * POSTS_PER_USER).toLocaleString()} posts (${POSTS_PER_USER} per user)
  • ${(NUM_USERS * TRIPS_PER_USER).toLocaleString()} trips (${TRIPS_PER_USER} per user)
  • ~${(NUM_USERS * 125).toLocaleString()} connections (100-150 per user)
  • ~${((NUM_USERS * POSTS_PER_USER) * 100 / 1000).toFixed(0)}K likes (~100 per post)
  • ~${((NUM_USERS * POSTS_PER_USER) * 100 / 1000).toFixed(0)}K comments (~100 per post)

⏱️  Estimated time: 30-60 minutes
💾 Storage needed: 1-2GB

════════════════════════════════════════════════════
`);

// Copy all data templates and functions from seedMassiveData.js
// (This would include FIRST_NAMES, LAST_NAMES, POST_TEMPLATES, etc.)
