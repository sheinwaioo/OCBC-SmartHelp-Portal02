import supabase from "../supabaseClient.js";

/**
 * Tutorial Service
 * Handles fetching tutorial data from Supabase
 * - Fetches published tutorials
 * - Fetches tutorial steps with screen assets
 * - Builds public URLs for Supabase storage assets
 */

/**
 * Build public URL for Supabase storage assets
 * @param {string} bucket - Storage bucket name
 * @param {string} objectPath - Path to object in bucket
 * @returns {string} Public URL
 */
function buildPublicUrl(bucket, objectPath) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data?.publicUrl || null;
}

/**
 * Get all published tutorials with category information
 * @returns {Promise<Array>} List of published tutorials
 */
export async function getAllTutorials() {
  try {
    const { data, error } = await supabase
      .from("tutorial_version")
      .select(`
        tutorial_version_id,
        tutorial_id,
        version_number,
        status,
        created_at,
        tutorial:tutorial_id (
          name,
          enquiry_category:enquiry_category_id (
            name
          )
        )
      `)
      .eq("status", "published");

    if (error) {
      console.error("Error fetching tutorials:", error);
      throw new Error(error.message);
    }

    // Flatten into the exact shape
    return (data || []).map((row) => ({
      tutorial_version_id: row.tutorial_version_id,
      tutorial_id: row.tutorial_id,
      version_number: row.version_number,
      status: row.status,
      created_at: row.created_at,
      tutorial_name: row.tutorial?.name || null,
      enquiry_category_name: row.tutorial?.enquiry_category?.name || null,
    }));
  } catch (error) {
    console.error("getAllTutorials error:", error);
    throw error;
  }
}

/**
 * Get tutorials by category name
 * @param {string} categoryName - Enquiry category name
 * @returns {Promise<Array>} List of published tutorials for the category
 */
export async function getTutorialsByCategory(categoryName) {
  try {
    const allTutorials = await getAllTutorials();
    return allTutorials.filter(
      (tutorial) => tutorial.enquiry_category_name === categoryName
    );
  } catch (error) {
    console.error("getTutorialsByCategory error:", error);
    throw error;
  }
}

/**
 * Get tutorial steps by version ID with screen and nav assets
 * @param {string} tutorialVersionId - Tutorial version UUID
 * @returns {Promise<Array>} List of tutorial steps with assets
 */
export async function getTutorialStepsByVersion(tutorialVersionId) {
  try {
    const { data, error } = await supabase
      .from("tutorial_step")
      .select(`
        tutorial_step_id,
        tutorial_version_id,
        step_index,
        screen_asset_id,
        scroll_progress,
        target_x,
        target_y,
        target_w,
        target_h,
        nav_key,
        instruction,
        tip,
        is_nav_target,
        created_at,
        screen_asset:screen_asset_id (
          screen_asset_id,
          name,
          bucket,
          object_path
        )
      `)
      .eq("tutorial_version_id", tutorialVersionId)
      .order("step_index", { ascending: true });

    if (error) {
      console.error("Error fetching tutorial steps:", error);
      throw new Error(error.message);
    }

    const steps = data || [];

    // Collect unique nav_keys
    const navKeys = Array.from(
      new Set(
        steps
          .map((s) => s.nav_key)
          .filter((k) => typeof k === "string" && k.length > 0)
      )
    );

    // Fetch nav bar assets
    const navMap = new Map();

    if (navKeys.length > 0) {
      const { data: navData, error: navError } = await supabase
        .from("nav_bar_asset")
        .select(`
          nav_bar_asset_id,
          name,
          nav_key,
          bucket,
          object_path,
          content_width,
          content_height,
          pixel_ratio,
          created_at
        `)
        .in("nav_key", navKeys);

      if (navError) {
        console.error("Error fetching nav assets:", navError);
        throw new Error(navError.message);
      }

      for (const nav of navData || []) {
        navMap.set(nav.nav_key, nav);
      }
    }

    // Merge derived URLs
    const rows = steps.map((r) => {
      const sa = r.screen_asset;
      const nav = r.nav_key ? navMap.get(r.nav_key) : null;

      return {
        ...r,

        screen_name: sa?.name || null,
        screen_public_url:
          sa?.bucket && sa?.object_path
            ? buildPublicUrl(sa.bucket, sa.object_path)
            : null,

        nav_name: nav?.name || null,
        nav_public_url:
          nav?.bucket && nav?.object_path
            ? buildPublicUrl(nav.bucket, nav.object_path)
            : null,

        nav_content_width: nav?.content_width || null,
        nav_content_height: nav?.content_height || null,
        nav_pixel_ratio: nav?.pixel_ratio || null,
      };
    });

    return rows;
  } catch (error) {
    console.error("getTutorialStepsByVersion error:", error);
    throw error;
  }
}
