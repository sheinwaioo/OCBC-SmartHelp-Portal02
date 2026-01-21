import {
  getAllTutorials,
  getTutorialsByCategory,
  getTutorialStepsByVersion,
} from "../services/tutorialService.js";

/**
 * Tutorial Controller
 * API endpoints for tutorial system
 */

/**
 * GET /tutorials
 * Get all published tutorials
 */
export async function getTutorials(req, res) {
  try {
    const tutorials = await getAllTutorials();
    res.json({
      success: true,
      tutorials,
    });
  } catch (error) {
    console.error("Get tutorials error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tutorials",
    });
  }
}

/**
 * GET /tutorials/category/:categoryName
 * Get tutorials by category name
 */
export async function getTutorialsByCategoryName(req, res) {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        error: "Category name is required",
      });
    }

    const tutorials = await getTutorialsByCategory(categoryName);
    res.json({
      success: true,
      tutorials,
    });
  } catch (error) {
    console.error("Get tutorials by category error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tutorials for category",
    });
  }
}

/**
 * GET /tutorials/:tutorialVersionId/steps
 * Get tutorial steps by version ID
 */
export async function getTutorialSteps(req, res) {
  try {
    const { tutorialVersionId } = req.params;

    if (!tutorialVersionId) {
      return res.status(400).json({
        success: false,
        error: "Tutorial version ID is required",
      });
    }

    const steps = await getTutorialStepsByVersion(tutorialVersionId);
    res.json({
      success: true,
      steps,
    });
  } catch (error) {
    console.error("Get tutorial steps error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch tutorial steps",
    });
  }
}
