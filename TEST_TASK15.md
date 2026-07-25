# Task 15 Testing Guide - Social Feed UI

## Overview
Task 15 implements the social feed features including post creation with media upload, commenting system, and infinite scroll.

## Components Created

### 1. PostCreationModal (`client/src/components/PostCreationModal.jsx`)
**Features:**
- Modal dialog for creating posts
- Text content (up to 5000 characters)
- Media upload (up to 5 images, max 50MB total)
- Image preview with removal
- Destination/location search
- Visibility settings (public/connections/private)
- Form validation

**Test:**
```bash
# Test post creation
1. Go to Dashboard
2. Click "Create Post" button
3. Type post content (test character counter)
4. Click image upload area
5. Select 1-5 images (JPG, PNG, GIF, WebP)
6. Verify image previews show
7. Hover over image and click X to remove
8. Search for destination (type 2+ characters)
9. Select destination from dropdown
10. Click X to remove location
11. Select visibility option
12. Click "Post" button
13. Verify post appears at top of feed
14. Check success toast shows

# Test validation
1. Try submitting empty post → should show error
2. Try uploading 6 images → should show error "Maximum 5 images"
3. Try uploading non-image file → should show error
4. Try uploading files > 50MB total → should show error
5. Type 5001 characters → should prevent/show error
6. Click Cancel with content → should ask for confirmation
7. Click X with content → should ask for confirmation

# Test media upload
1. Upload JPG image → should work
2. Upload PNG image → should work
3. Upload GIF image → should work
4. Upload WebP image → should work
5. Upload PDF file → should show error
6. Upload video file → should show error
```

### 2. PostCard with Comments (`client/src/components/PostCard.jsx`)
**Features:**
- Post display (author, content, media, location, timestamp)
- Like/unlike functionality
- Comment count display
- Expandable comment section
- Add comment form
- Comment list with author info
- Delete comment (own comments only)
- Delete post (owner only)
- Media gallery (1-4 images with +N overlay)

**Test:**
```bash
# Test post interactions
1. View post in feed
2. Click heart icon to like
3. Verify like count increases and icon fills
4. Click heart again to unlike
5. Verify like count decreases

# Test comments
1. Click comment icon to expand comments
2. Type comment text in textarea
3. Click send button
4. Verify comment appears in list
5. Check comment shows your name and "just now"
6. Add multiple comments
7. Try delete on your own comment → should work
8. Try delete on others' comment → button shouldn't show
9. Click comment icon again to collapse

# Test post menu
1. View your own post
2. Click three-dot menu
3. Click "Delete Post"
4. Confirm deletion
5. Verify post removed from feed
6. View someone else's post → menu shouldn't show

# Test media display
1. View post with 1 image → full width display
2. View post with 2 images → 2 column grid
3. View post with 3 images → 3 column grid (first spans 2)
4. View post with 4 images → 2x2 grid
5. View post with 5+ images → 2x2 grid with "+N" overlay on 4th image
```

### 3. Infinite Scroll (`client/src/pages/DashboardPage.jsx`)
**Features:**
- Loads 10 posts initially
- Automatically loads more when scrolling to bottom
- Loading indicator while fetching
- "End of feed" message when no more posts
- IntersectionObserver for performance

**Test:**
```bash
# Test infinite scroll
1. Go to Dashboard
2. Scroll down feed slowly
3. When near bottom, verify loading spinner appears
4. Verify 10 more posts load automatically
5. Continue scrolling
6. Verify multiple page loads work
7. Scroll to actual end
8. Verify "You've reached the end!" message shows

# Test performance
1. Open DevTools → Performance tab
2. Record while scrolling
3. Check no memory leaks
4. Verify smooth 60fps scrolling
5. Check only 1 API call per page load
```

## API Integration

### Endpoints Used:
- `POST /api/posts` - Create post (with FormData for file upload)
- `POST /api/posts/:id/like` - Like post
- `DELETE /api/posts/:id/like` - Unlike post
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/posts/:id/comments/:commentId` - Delete comment
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/feed?limit=10&page=N` - Get feed with pagination
- `GET /api/destinations/search?q=query` - Search destinations

### Test API Integration:
```bash
# Check network tab
1. Open DevTools → Network tab
2. Create post with images
3. Verify FormData sent correctly
4. Check images uploaded (look for File objects)
5. Verify 201 Created response
6. Test like/unlike → should toggle
7. Test comments → POST then see in response
8. Test pagination → page param increments
```

## Comment System Testing

### Basic Functionality:
```bash
1. Expand comments on a post
2. Type short comment → send
3. Type long comment (500+ chars) → send
4. Type comment with emojis → send
5. Type comment with links → send
6. Add multiple comments quickly
7. Delete your own comment
8. Verify comment count updates
```

### Edge Cases:
```bash
1. Empty comment → send button disabled
2. Only whitespace → send button disabled
3. Very long comment (2000+ chars) → should work
4. Special characters → should escape properly
5. Comment while offline → should show error
6. Delete while offline → should show error
```

## Media Upload Testing

### File Types:
```bash
✅ JPEG/JPG
✅ PNG
✅ GIF
✅ WebP
❌ PDF
❌ Video (MP4, MOV)
❌ Documents (DOC, TXT)
```

### File Sizes:
```bash
1. Upload 5 small images (1MB each) → should work
2. Upload 2 large images (30MB each) → should show error
3. Upload 1 image (60MB) → should show error
4. Upload 4 images totaling 49MB → should work
5. Upload 5 images totaling 51MB → should show error
```

### Image Preview:
```bash
1. Select image → preview shows immediately
2. Select multiple → all previews show
3. Click X on preview → image removed
4. Remove then re-add → should work
5. Clear all then upload different → should work
```

## Responsive Design Testing

### Mobile (375px)
```bash
1. Test create post modal → fits screen
2. Test image upload → accessible
3. Test comment section → readable
4. Test media grid → stacks nicely
5. Test infinite scroll → works smoothly
```

### Tablet (768px)
```bash
1. Test modal width → appropriate
2. Test 2 column media grid
3. Test comment layout
```

### Desktop (1920px)
```bash
1. Test modal max-width
2. Test media grid spacing
3. Test feed layout (2 columns for dashboard)
```

## Accessibility Testing

### Keyboard Navigation:
```bash
1. Tab to "Create Post" button → Enter to open
2. Tab through modal fields
3. Tab to image upload → Enter/Space to trigger
4. Tab to send comment button → Enter to submit
5. Escape to close modal
6. Tab to like button → Enter to toggle
7. Tab to comment icon → Enter to expand
```

### ARIA Labels:
```bash
1. Like button: aria-label="Like" or "Unlike"
2. Comment button: aria-label="Comments"
3. Delete button: aria-label="Delete post"
4. Send comment: aria-label="Send comment"
5. Close modal: aria-label="Close"
6. Remove image: aria-label="Remove image"
7. Remove location: aria-label="Remove location"
```

### Screen Reader:
```bash
1. Announce post author
2. Announce post content
3. Announce like count
4. Announce comment count
5. Announce form labels
6. Announce buttons properly
```

## Performance Testing

### Metrics:
```bash
# Post creation
- Modal opens: < 100ms
- Image preview: < 200ms
- Upload & create: < 2s

# Feed loading
- Initial 10 posts: < 500ms
- Additional 10 posts: < 500ms
- Comment section expand: instant

# Interactions
- Like/unlike: < 200ms
- Add comment: < 300ms
- Delete comment: < 200ms
```

### Optimization:
```bash
1. Images lazy load in feed
2. Comments only load when expanded
3. Infinite scroll uses IntersectionObserver (no scroll event listener)
4. No re-renders on like toggle (local state update)
5. Debounce destination search
```

## Edge Cases

### Empty States:
- No posts in feed → Shows empty state with CTA
- No comments on post → Shows empty comment section
- No media → Text-only post displays fine

### Error Handling:
- Upload fails → Show error toast
- Comment fails → Show error toast, keep text
- Like fails → Revert state, show error
- Network offline → All actions fail gracefully

### Concurrency:
- Like while unliking → Queue properly
- Comment while deleting → Handle race condition
- Multiple users commenting → All appear

## Sample Test Data

### Test Posts:
```javascript
// Text only
"Just arrived in Bali! The beaches here are absolutely stunning 🏖️"

// With location
"Amazing sunset at Tanah Lot Temple" + location: Bali, Indonesia

// With media
"Road trip through the Scottish Highlands" + 3 landscape photos

// Long text
"This trip has been incredible. Here's what I've learned..." + 2000 chars

// Multiple media
"Best moments from my Europe trip" + 5 photos
```

### Test Comments:
```javascript
"Beautiful photos! 📸"
"I was there last year, such an amazing place!"
"How long are you staying?"
"Great shot! What camera did you use?"
```

## Known Issues
- None currently

## Browser Compatibility
- ✅ Chrome 90+ (full support)
- ✅ Firefox 88+ (full support)
- ✅ Safari 14+ (full support)
- ✅ Edge 90+ (full support)
- ⚠️ IE 11 (not supported)

## Success Criteria
- [x] Can create posts with text
- [x] Can upload 1-5 images
- [x] Image preview and removal works
- [x] Can add location to posts
- [x] Like/unlike posts
- [x] Add comments to posts
- [x] Delete own comments
- [x] Delete own posts
- [x] Infinite scroll loads more posts
- [x] Media gallery displays properly
- [x] All validations work
- [x] Responsive on all devices
- [x] Accessible with keyboard
- [x] Error handling works
- [x] Performance optimized
