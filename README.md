# Vision Training

## Tech Stack

TypeScript + Vue
## Purpose

Train your eyes using Gabor patches to improve vision, specifically for amblyopia treatment.

## How to Use

1. Download the code.
2. Run `npm run dev` to start the server.
3. Visit `http://localhost:13142` in your browser.
4. Click the "Start Training" button.
5. Follow the prompts to complete the training.

## Training Modes

### 1. Single Image Training
- **Objective**: The screen flashes twice, once with a Gabor patch and once without.
- **Controls**:
  - If the Gabor patch appears in the first flash, click the left mouse button or press the left arrow key.
  - If it appears in the second flash, click the right mouse button or press the right arrow key.

### 2. Three-Image Training
- **Objective**: The screen flashes twice, once showing 3 Gabor patches and once showing 2 (the patches may appear close enough to blend).
- **Controls**:
  - If the first flash shows 3 patches, click the left mouse button or press the left arrow key.
  - If the second flash shows 2 patches, click the right mouse button or press the right arrow key.

### 3. Clear Image Training
- **Objective**: The screen flashes twice, each time showing a Gabor patch. One patch is clearer than the other (the difference might be minimal for amblyopic eyes).
- **Controls**:
  - If the clearer patch appears first, click the left mouse button or press the left arrow key.
  - If it appears second, click the right mouse button or press the right arrow key.

### 4. Image Shift Training
- **Objective**: The screen flashes once with 3 Gabor patches, with the middle patch potentially shifting in any direction (up, down, left, or right; the difference might be minimal for amblyopic eyes).
- **Controls**:
  - If the patch shifts left, click the left mouse button or press the left arrow key.
  - If it shifts right, click the right mouse button or press the right arrow key.
  - If it shifts up, rotate the mouse counterclockwise and click the right mouse button, or press the right arrow key.
  - If it shifts down, rotate the mouse counterclockwise and click the left mouse button, or press the left arrow key.

### 5. Crowding Training
- **Objective**:
  - The screen flashes twice.
  - The first flash shows an array of E-shaped patches, with one E at the center.
  - The second flash shows a similar array, but the center is blank.
- **Controls**:
  - If the first flash contains the E at the center, click the left mouse button or press the left arrow key.
  - If the second flash contains it, click the right mouse button or press the right arrow key.
- **Notes**:
  - Similar to single-image training but focuses on an array with the central position varying.

### Training Details
- **Units**:
  - Each session consists of 11 units.
  - Each unit includes 50 shift judgments.
  - Start each unit by clicking the middle mouse button or pressing the up arrow key.
- **Key Substitutions**:
  - Left mouse button ↔ Left arrow key
  - Right mouse button ↔ Right arrow key
  - Middle mouse button ↔ Up arrow key
  - Move to the next unit with the down arrow key.
  - Game controllers can map to keyboard or mouse inputs.
- **Additional Information**:
  - The mouse pointer is enlarged and red for easier visibility.
  - Training intervals must be at least 8 hours apart.
  - Errors trigger an alert sound and display the correct image, which gradually shrinks for clarity.
  - Training quality integrates accuracy, reaction time, and stability (consistent accuracy and response time). Variations reduce scores.
  - Difficulty adjusts by patch size, clarity, and flash intervals, gradually increasing within each unit and over sessions.

### Environment Requirements
- Train in a dark room with no light sources other than the computer screen.
- Maintain a distance of 1.5 meters from the screen.

### Precautions
- **Fatigue**: Take short breaks if eye fatigue occurs and resume after recovery.
- **Controls**: Game controllers can map to keyboard or mouse operations.
- **Setup**: Calibrate screen color and size before starting.

## Training Schedule

The first two sessions are adaptive, with multiple types of training across five units. These can be skipped.

During formal training:
- Crowding training is separate.
- Early stage (first 20 sessions): Emphasis on single-image and three-image training.
- Mid-stage (sessions 20–30): Focus on clear-image and shift training.
- Late stage (post-30 sessions): Mixed training types.

Training difficulty progresses based on performance, with adjustments to increase challenge.

## References

- https://doctors.revitalvision.com/about/vision-improvement-technology/ 
- https://training.revitalvision.com/training-instructions
- https://training.revitalvision.com/tutorials
- https://training.revitalvision.com/patient-main