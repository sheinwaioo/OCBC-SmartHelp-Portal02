# Self-Service Tutorial Flow Implementation

## Overview
The self-service tutorial system enables users to learn how to complete banking tasks independently through interactive step-by-step mobile phone simulations. Users can view tutorials directly within the chatbot without needing agent assistance.

## Architecture

### Technology Stack
- **Frontend:** Vanilla JavaScript, HTML5, Custom CSS
- **Backend:** Node.js/Express
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (for screen assets)

### System Components

```
┌─────────────────────────────────────────────────┐
│         User (Chatbot Interface)                │
│  - Select Category                              │
│  - Select Subcategory                           │
│  - Choose "View Tutorial"                       │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│       Frontend (chatbot.js)                      │
│  - handleTutorialStep()                         │
│  - startTutorial()                              │
│  - renderTutorialSimulator()                    │
│  - renderCurrentStep()                          │
│  - handlePhoneTap()                             │
│  - advanceTutorialStep()                        │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  REST API     │
         │  (Backend)    │
         └───────┬───────┘
                 │
          ┌──────┴──────┐
          ▼             ▼
    ┌──────────┐   ┌──────────────┐
    │ Database │   │ Supabase     │
    │(Supabase)│   │ Storage      │
    └──────────┘   └──────────────┘
```

## Database Schema

### Tables Involved

#### 1. `tutorial` Table
Main tutorial metadata
```
- tutorial_id (UUID, PK)
- name (text) - Tutorial title
- estimated_time_sec (integer) - Duration in seconds
- enquiry_category_id (UUID, FK) - Link to category
- created_at (timestamp)
```

#### 2. `tutorial_version` Table
Version control for tutorials (supports draft/published)
```
- tutorial_version_id (UUID, PK)
- tutorial_id (UUID, FK) - Points to tutorial
- version_number (integer) - Version tracking
- status (enum: draft | published) - Publication status
- created_at (timestamp)
```

#### 3. `tutorial_step` Table
Individual step instructions
```
- tutorial_step_id (UUID, PK)
- tutorial_version_id (UUID, FK) - Points to version
- step_index (integer) - Step order (1, 2, 3, 4...)
- screen_asset_id (UUID, FK) - Screen image reference
- scroll_progress (decimal 0-1) - Auto-scroll animation intensity
- target_x (decimal 0-1) - Hotspot X coordinate (percentage)
- target_y (decimal 0-1) - Hotspot Y coordinate (percentage)
- target_w (decimal 0-1) - Hotspot width (percentage)
- target_h (decimal 0-1) - Hotspot height (percentage)
- nav_key (text) - Navigation bar reference
- is_nav_target (boolean) - Is hotspot on navbar
- instruction (text) - User instruction text
- tip (text) - Optional helpful tip (flippable)
- created_at (timestamp)
```

#### 4. `screen_asset` Table
Mobile screen images
```
- screen_asset_id (UUID, PK)
- bucket (text) - Supabase Storage bucket name
- object_path (text) - Path in storage bucket
- created_at (timestamp)
```

#### 5. `nav_bar_asset` Table
Navigation bar images with metadata
```
- nav_bar_asset_id (UUID, PK)
- nav_key (text) - Unique identifier for navbar
- bucket (text) - Storage bucket
- object_path (text) - Storage path
- content_width (integer) - Intrinsic width in pixels
- content_height (integer) - Intrinsic height in pixels
- pixel_ratio (decimal) - Device pixel ratio
- created_at (timestamp)
```

#### 6. `enquiry_category` Table
Tutorial categories (hierarchical)
```
- enquiry_category_id (UUID, PK)
- name (text) - Category/Subcategory name
- parent_category_id (UUID, FK) - For hierarchy (nullable)
- created_at (timestamp)
```

## Backend Implementation

### Files
- **`back-end/services/tutorialService.js`** - Data fetching logic
- **`back-end/controllers/tutorialController.js`** - API endpoint handlers
- **`back-end/app.js`** - Route registration

### API Endpoints

#### 1. Get All Tutorials
```
GET /api/tutorials

Response:
{
  success: true,
  tutorials: [
    {
      tutorial_version_id: "...",
      tutorial_id: "...",
      version_number: 1,
      status: "published",
      tutorial_name: "Lock/unlock card",
      enquiry_category_name: "Lock/unlock card"
    }
  ]
}
```

#### 2. Get Tutorials by Category
```
GET /api/tutorials/category/:categoryName

Example: /api/tutorials/category/Lock%2Funlock%20card

Response:
{
  success: true,
  tutorials: [
    { tutorial details... }
  ]
}
```

#### 3. Get Tutorial Steps
```
GET /api/tutorials/:tutorialVersionId/steps

Response:
{
  success: true,
  steps: [
    {
      tutorial_step_id: "...",
      step_index: 1,
      screen_public_url: "https://...",
      scroll_progress: 0.68,
      target_x: 0.1155,
      target_y: 0.3671,
      target_w: 0.1200,
      target_h: 0.0600,
      nav_public_url: "https://...",
      nav_content_width: 360,
      nav_content_height: 100,
      nav_pixel_ratio: 1,
      instruction: "Tap on Lock/Unlock card",
      tip: null,
      is_nav_target: false
    }
  ]
}
```

### Service Functions

#### `buildPublicUrl(bucket, objectPath)`
Generates public URLs for Supabase Storage assets
```javascript
const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
return data?.publicUrl || null;
```

#### `getAllTutorials()`
Fetches all published tutorials with category info
- Joins: `tutorial_version` → `tutorial` → `enquiry_category`
- Filter: `status = "published"`
- Returns: Flattened array with tutorial names and categories

#### `getTutorialsByCategory(categoryName)`
Filters tutorials by enquiry category name
- Calls `getAllTutorials()`
- Filters by `enquiry_category_name`

#### `getTutorialStepsByVersion(tutorialVersionId)`
Fetches complete step data with all assets
- Joins: `tutorial_step` → `screen_asset`
- Looks up: `nav_bar_asset` by nav_key
- Builds public URLs using `buildPublicUrl()`
- Orders by `step_index`
- Returns: Complete step objects with all asset URLs

## Frontend Implementation

### File: `front-end/chatbot.js`

#### Key Variables
```javascript
const tutorialState = {
  currentStepIndex: 0,      // Current step (0-based)
  steps: [],                // Array of all steps
  tutorialVersionId: null,  // Active tutorial ID
  isScrolling: false,       // Auto-scroll flag
  scrollAnimInterval: null, // Animation timer
  isFlipped: false          // 3D flip state
};
```

#### Core Functions

##### `handleTutorialStep(categoryName)`
**Entry point from chatbot**
- Fetches tutorials for selected subcategory
- If 1 tutorial: starts directly
- If multiple: shows selection menu
- If none: error message

##### `startTutorial(tutorialVersionId, tutorialName)`
**Loads tutorial data**
- Fetches steps from `/api/tutorials/:id/steps`
- Initializes `tutorialState`
- Calls `renderTutorialSimulator()`

##### `renderTutorialSimulator()`
**Creates modal overlay**
- Creates fixed-position modal (dark background)
- Adds close button (×)
- Adds phone frame container
- Calls `renderCurrentStep()`

##### `renderCurrentStep()`
**Renders active step**
1. Gets current step from `tutorialState.steps[currentStepIndex]`
2. Calculates phone dimensions (aspect ratio 9:18)
3. Renders screen viewport
4. Renders screen image from database
5. Renders navbar overlay if present
6. Adds tap target (red hotspot) if coordinates exist
7. Adds coachmark (instruction overlay)
8. Attaches click handler to viewport

##### `addTapTarget(viewport, step, phoneWidth, screenHeight, navbarHeight)`
**Creates red pulsing hotspot circle**
- Converts decimal coordinates (0-1) to pixels
- Positions: `X = target_x × phoneWidth`, `Y = target_y × screenHeight`
- Creates pulsing animation
- Appends to viewport

##### `addCoachmark(viewport, step, phoneWidth, screenHeight, navbarHeight)`
**Creates instruction overlay**
- Positions at bottom of screen (avoids covering hotspot)
- Shows step number and instruction
- Creates 3D flip container for tip
- Adds flip handler for interactive tips

##### `handlePhoneTap(event, step, phoneWidth, screenHeight, navbarHeight)`
**Hit detection logic**
```
1. Calculate tap position in pixels
2. Convert to percentages (0-100%)
3. Convert target coordinates (decimals 0-1 → percentages 0-100%)
4. Check if tap within target bounds (with 5% tolerance)
5. If hit: advance to next step
6. If miss: shake phone animation
```

##### `advanceTutorialStep()`
**Progress to next step**
- Increment `currentStepIndex`
- If more steps: call `renderCurrentStep()`
- If done: call `completeTutorial()`

##### `completeTutorial()`
**Show completion message**
- Close modal
- Display completion message
- Show follow-up quick replies

## Frontend UI Components

### File: `front-end/index.css`

#### Key CSS Classes

**Modal Overlay**
```css
.tutorial-modal-overlay {
  position: fixed;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  z-index: 10000;
}
```

**Phone Frame**
```css
.phone-frame {
  border-radius: 32px;
  background: #1e293b;
  padding: 10px;
  max-width: 280px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.7);
}
```

**Phone Viewport**
```css
.phone-viewport {
  aspect-ratio: 9 / 18;
  overflow: hidden;
  position: relative;
}
```

**Tap Target (Red Circle)**
```css
.tap-target-cue {
  position: absolute;
  pointer-events: auto;
  border-radius: 50%;
  border: 4px solid rgba(239, 43, 45, 0.8);
  background: rgba(239, 43, 45, 0.1);
}

.tap-target-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.5); }
}
```

**Coachmark (Instruction Box)**
```css
.coachmark-container {
  position: absolute;
  bottom: 5%;
  max-width: 260px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 12px;
}
```

**Shake Animation (Wrong Click)**
```css
.phone-frame.shake {
  animation: shake 0.35s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  50% { transform: translateX(10px); }
  75% { transform: translateX(-10px); }
}
```

**3D Flip (Tip Card)**
```css
.coachmark-inner {
  transition: transform 450ms;
  transform-style: preserve-3d;
}

.coachmark-inner.flipped {
  transform: rotateY(180deg);
}
```

## User Flow

### Step-by-Step Journey

```
1. USER SELECTS CATEGORY
   └─> Chatbot asks: "What specifically do you need?"

2. USER SELECTS SUBCATEGORY
   └─> Chatbot asks: "How would you like to proceed?"

3. USER CLICKS "VIEW TUTORIAL"
   └─> Frontend calls handleTutorialStep(subcategoryName)
   └─> API fetches tutorials for that subcategory
   └─> Modal opens with mobile phone simulation

4. STEP 1 OF TUTORIAL DISPLAYS
   ├─> Screen image loads from Supabase Storage
   ├─> Navbar image overlays at bottom
   ├─> Red pulsing circle marks target area
   ├─> Instruction text appears at bottom
   └─> User sees: "Tap on Lock/Unlock card"

5. USER CLICKS ON RED HOTSPOT
   └─> Hit detection validates coordinates
   └─> Advances to Step 2

6. STEPS 2, 3, 4 PROGRESS SAME WAY
   └─> Each step shows new screen image
   └─> New hotspot position
   └─> New instruction

7. FINAL STEP COMPLETES
   └─> Modal closes
   └─> Completion message shown
   └─> Follow-up options presented
```

## Key Features

### 1. **Database-Driven Content**
- All tutorial data stored in Supabase
- Easy to add/modify tutorials without code changes
- Published/draft status control

### 2. **Mobile Phone Simulation**
- Realistic 9:18 aspect ratio phone frame
- Black bezel borders
- Screen viewport with viewport clipping

### 3. **Interactive Hotspots**
- Red pulsing circles mark clickable areas
- Percentage-based coordinates (0-1 scale)
- Hit detection with 5% tolerance
- Wrong clicks trigger shake animation

### 4. **Instruction Overlays (Coachmarks)**
- Step counter and text
- Optional tips (3D flippable cards)
- Dynamic positioning to avoid hotspots
- Semi-transparent backdrop

### 5. **Asset Management**
- Screen images from Supabase Storage
- Navigation bar overlays
- Automatic public URL generation
- Support for multiple assets per step

### 6. **Step Progression**
- Sequential step-by-step flow
- Auto-advance on correct tap
- Completion detection
- Tutorial state tracking

### 7. **Error Handling**
- Try-catch on API calls
- Fallback messages for failed requests
- Console logging for debugging

## Coordinate System

### Understanding Decimal Coordinates

**Format:** 0 to 1 (decimal representation of percentage)

**Conversion:**
```
Decimal → Percentage: 0.3671 × 100 = 36.71%
Percentage → Pixel: 36.71% × 516px = 189.4px
Direct: 0.3671 × 516px = 189.4px
```

### Screen Layout Example (516px height)
```
Y = 0.0  ┌─────────────────────┐ Top
Y = 0.15 │ More Logout Header   │
Y = 0.28 │ Apply (Accounts)     │
Y = 0.37 │ Insurance/Loans      │
Y = 0.55 │ Lock/Unlock Card     │ ← Step 1 Target
Y = 0.70 │ Account & Banking    │
Y = 0.93 │ Navbar Buttons       │ ← Step 3 Target
Y = 1.0  └─────────────────────┘ Bottom
```

## Integration with Chatbot

### Entry Points
1. **Category Selection** → User selects "Card Services"
2. **Subcategory Selection** → User selects "Lock/unlock card"
3. **Assistance Options** → User clicks "View Tutorial"
4. **Tutorial Starts** → Modal opens with simulator

### State Management
- Uses existing `chatFlowState` to track category/subcategory
- Creates new `tutorialState` for tutorial-specific data
- Maintains separation of concerns

## Deployment Checklist

- [x] Backend API endpoints created and tested
- [x] Frontend functions implemented
- [x] CSS styling added
- [x] Hit detection logic working
- [x] Modal overlay functional
- [x] Database schema documented
- [ ] Database coordinates calibrated (Step 1 needs update: 0.3671 → 0.55)
- [ ] User testing completed
- [ ] Error cases handled

## Known Issues & Fixes

### Issue 1: Step 1 Hotspot Misaligned
- **Status:** Needs Fix
- **Cause:** Incorrect `target_y: 0.3671` in database
- **Fix:** Update to `target_y: 0.55`
- **Details:** See [TUTORIAL_HOTSPOT_CALIBRATION.md](TUTORIAL_HOTSPOT_CALIBRATION.md)

## Future Enhancements

1. **Analytics Tracking**
   - Track which tutorials are most viewed
   - Track completion rates
   - Track user feedback

2. **A/B Testing**
   - Test different instruction text
   - Test different hotspot sizes
   - Measure effectiveness

3. **Multi-Language Support**
   - Translate instructions and tips
   - RTL language support

4. **Mobile Responsiveness**
   - Smaller screens: reduce phone frame size
   - Larger screens: increase phone frame size
   - Portrait/landscape support

5. **Advanced Features**
   - Video tutorials instead of static screens
   - Animation between steps
   - Progress bar
   - Tutorial search/filtering
   - User ratings for tutorials

## Testing Guide

### Manual Testing Checklist
- [ ] Tutorial loads without errors
- [ ] All steps display correctly
- [ ] Red hotspots appear in correct positions
- [ ] Clicking hotspot advances to next step
- [ ] Wrong clicks trigger shake animation
- [ ] Instructions and tips display properly
- [ ] 3D flip animation works for tips
- [ ] Completion message shows on final step
- [ ] Modal closes when clicking X button
- [ ] Works on different screen sizes

### API Testing
```bash
# Get all tutorials
curl http://localhost:3000/api/tutorials

# Get tutorials by category
curl "http://localhost:3000/api/tutorials/category/Lock%2Funlock%20card"

# Get tutorial steps
curl "http://localhost:3000/api/tutorials/138b6588-8ea2-4154-957d-8dfc82ea6194/steps"
```

## Summary

The self-service tutorial system provides an interactive way for users to learn banking tasks independently. By combining database-driven content, realistic mobile simulation, intelligent hit detection, and engaging instruction overlays, users can complete tutorials at their own pace without needing agent support.

The architecture is flexible, allowing new tutorials to be added through database entries alone, and the coordinate system provides precise control over interactive elements.
