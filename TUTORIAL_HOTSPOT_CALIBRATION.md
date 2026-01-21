# Tutorial Hotspot Calibration Guide

## Issue Summary
**Step 1 of the Lock/Unlock Card Tutorial** has an incorrectly positioned hotspot. The red pulsing circle appears on the **Insurance** icon instead of the **Lock/Unlock card** icon.

## Root Cause
The `target_y` coordinate in the Supabase `tutorial_step` table for Step 1 is set to `0.3671`, which places the hotspot too high on the screen (at the Insurance icon position ~37% down).

**Affected Record:**
- **Table:** `tutorial_step`
- **Step ID:** `8bdbf40c-857c-43fb-a56a-6c6d21f32ad3`
- **Tutorial Version:** `138b6588-8ea2-4154-957d-8dfc82ea6194` (Lock/Unlock card tutorial)
- **Step Index:** `1`

## Current Coordinates
```
target_x: 0.1155 (11.55%)
target_y: 0.3671 (36.71%) ← INCORRECT
target_w: 0.1200 (12%)
target_h: 0.0600 (6%)
```

**Calculated Position (in pixels):**
- Viewport: 258px × 516px
- X: 0.1155 × 258 = 29.8px
- Y: 0.3671 × 516 = 189.4px ← Points to Insurance icon

## Solution
Update the `target_y` value in Supabase to point to the Lock/Unlock card icon instead.

### Steps to Fix:
1. **Open Supabase Console**
   - Go to your Supabase project
   - Navigate to SQL Editor or Table Editor

2. **Locate the Record**
   - Table: `tutorial_step`
   - Filter: `tutorial_step_id = '8bdbf40c-857c-43fb-a56a-6c6d21f32ad3'`

3. **Update target_y**
   - Change from: `0.3671`
   - Change to: `0.55` (approximately 55% down the screen)
   
   **Recommended value range: 0.52 - 0.58** (test to find exact center of Lock/Unlock icon)

4. **SQL Query (Alternative)**
   ```sql
   UPDATE tutorial_step
   SET target_y = 0.55
   WHERE tutorial_step_id = '8bdbf40c-857c-43fb-a56a-6c6d21f32ad3';
   ```

5. **Verify**
   - Refresh the browser
   - Open the tutorial again
   - Step 1 should now show the red hotspot on the Lock/Unlock card icon

## Coordinate System Explanation

### How Coordinates Work
- **Format:** Decimal coordinates (0.0 to 1.0)
- **Base:** Full phone screen height (516px) and width (258px)
- **Calculation:**
  ```
  Pixel Position = Coordinate × Viewport Dimension
  Example: 0.55 × 516 = 283.8px (55% down the screen)
  ```

### Screen Layout Reference
- **Y Position Ranges:**
  - `~0.20`: Top of "Apply" section (Apply heading)
  - `~0.28`: Accounts/Cards/Investments row
  - `~0.37`: Insurance/Loans row (current incorrect position)
  - `~0.55`: Lock/Unlock card / Report lost card row (target)
  - `~0.70`: Account & Banking section header
  - `~0.93`: Navigation bar buttons (More button location)

## Testing & Validation

### Before Fix
- Red circle: Insurance icon (wrong position)
- Instruction: "Tap on Lock/Unlock card"
- User must click elsewhere to proceed

### After Fix
- Red circle: Lock/Unlock card icon (correct position)
- Instruction: "Tap on Lock/Unlock card"
- User clicks on highlighted icon to proceed to Step 2

## Related Steps
- **Step 2:** target_y = 0.2207 ✓ (correct)
- **Step 3:** target_y = 0.9304 ✓ (correct - More button)
- **Step 4:** No target (tutorial complete) ✓

## Notes
- Once updated, the frontend will automatically fetch the corrected coordinates from the API
- No code changes needed - database fix is sufficient
- The coordinate system uses the FULL screen height (including navbar) as reference
- Hotspot circles are centered on the target coordinates
