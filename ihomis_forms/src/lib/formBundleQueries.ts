/**
 * Form Bundle Query Utilities
 * 
 * Supabase queries for form bundling feature.
 * These queries fetch bundle definitions and their associated form IDs.
 */

import { supabase } from "./supabaseClient";

/**
 * Fetches all active form bundles from the database.
 * Used for dynamically rendering bundle buttons.
 * 
 * @returns {Promise<Array>} Array of bundle objects with id, name, description, etc.
 */
export async function fetchFormBundles() {
  if (!supabase) {
    console.warn("Supabase client not configured");
    return [];
  }

  const { data, error } = await supabase
    .from("form_bundles")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching form bundles:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches all form_ids for a given bundle_id.
 * Only returns IDs for forms that are currently active in hospital_forms.
 * Note: hospital_forms.id is INTEGER, so form_ids are returned as integers.
 * 
 * @param {string} bundleId - The ID of the form bundle
 * @returns {Promise<Array<number>>} Array of form IDs (integers) from the bundle
 */
export async function fetchBundleFormIds(bundleId) {
  if (!supabase) {
    console.warn("Supabase client not configured");
    return [];
  }

  if (!bundleId) {
    console.warn("fetchBundleFormIds called without bundleId");
    return [];
  }

  // Join bundle_items with hospital_forms to ensure we only get active forms
  // This respects the is_active status from the hospital_forms table
  // Note: hospital_forms.id is INTEGER, not UUID
  const { data, error } = await supabase
    .from("bundle_items")
    .select(`
      form_id,
      hospital_forms!inner (
        id,
        is_active
      )
    `)
    .eq("bundle_id", bundleId)
    .eq("hospital_forms.is_active", true);

  if (error) {
    console.error("Error fetching bundle form IDs:", error);
    return [];
  }

  // Extract form_ids from the joined result
  return (data || []).map((item) => item.form_id);
}

/**
 * Fetches a single bundle with its form IDs.
 * Useful when you need both the bundle info and its associated forms.
 * 
 * @param {string} bundleId - The ID of the form bundle
 * @returns {Promise<{bundle: Object|null, formIds: Array<string>}>}
 */
export async function fetchBundleWithFormIds(bundleId) {
  const [bundles, formIds] = await Promise.all([
    supabase
      .from("form_bundles")
      .select("*")
      .eq("id", bundleId)
      .single(),
    fetchBundleFormIds(bundleId),
  ]);

  if (bundles.error) {
    console.error("Error fetching bundle:", bundles.error);
    return { bundle: null, formIds: [] };
  }

  return {
    bundle: bundles.data,
    formIds,
  };
}

/**
 * Fetches all bundles with their associated active form IDs.
 * Useful for preloading all bundles at once.
 * 
 * @returns {Promise<Array<{bundle: Object, formIds: Array<string>}>>}
 */
export async function fetchAllBundlesWithFormIds() {
  const bundles = await fetchFormBundles();
  
  if (bundles.length === 0) {
    return [];
  }

  // Fetch form IDs for all bundles in parallel
  const bundlePromises = bundles.map(async (bundle) => {
    const formIds = await fetchBundleFormIds(bundle.id);
    return { bundle, formIds };
  });

  return Promise.all(bundlePromises);
}

/**
 * useFormBundles Hook
 * 
 * React hook for managing form bundle functionality.
 * Provides toggleBundle function that updates the existing selectedForms state.
 * 
 * Usage:
 *   const { bundles, toggleBundle, loading } = useFormBundles(selectedForms, setSelectedForms);
 * 
 * The hook works with the existing checkbox state system - it merges bundle form IDs
 * into the existing selection rather than creating a separate selection system.
 */

import { useState, useEffect, useCallback } from "react";

/**
 * Hook for managing form bundle state and operations
 * 
 * @param {Set|Array} selectedForms - Current selected form IDs (from existing state)
 * @param {Function} setSelectedForms - Setter function for selected forms
 * @returns {Object} Bundle state and operations
 */
export function useFormBundles(selectedForms, setSelectedForms) {
  const [bundles, setBundles] = useState([]);
  const [bundlesFormIds, setBundlesFormIds] = useState({}); // { bundleId: [formId, ...] }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all bundles with their form IDs on mount
  useEffect(() => {
    const loadBundles = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all bundles with their form IDs in one go
        const bundlesData = await fetchAllBundlesWithFormIds();
        
        const bundleList = [];
        const formIdsMap = {};

        for (const { bundle, formIds } of bundlesData) {
          bundleList.push(bundle);
          formIdsMap[bundle.id] = formIds;
        }

        setBundles(bundleList);
        setBundlesFormIds(formIdsMap);
      } catch (err) {
        console.error("Error loading form bundles:", err);
        setError(err.message || "Failed to load bundles");
      } finally {
        setLoading(false);
      }
    };

    loadBundles();
  }, []);

  /**
   * Smart State Update Function
   * 
   * Toggles bundle forms in the selection:
   * - If bundle is not fully selected: adds all bundle forms to selection
   * - If bundle is fully selected: removes all bundle forms from selection
   * 
   * @param {string} bundleId - The ID of the bundle to toggle
   * @returns {Promise<void>}
   */
  const toggleBundle = useCallback(
    async (bundleId) => {
      // Get cached form IDs for this bundle
      let formIds = bundlesFormIds[bundleId];

      // If not cached, fetch them
      if (!formIds) {
        formIds = await fetchBundleFormIds(bundleId);
        // Cache for future use
        setBundlesFormIds((prev) => ({
          ...prev,
          [bundleId]: formIds,
        }));
      }

      if (!formIds || formIds.length === 0) {
        console.warn(`No active forms found for bundle: ${bundleId}`);
        return;
      }

      // Convert selectedForms to Set if needed
      const currentSelection = selectedForms instanceof Set
        ? selectedForms
        : new Set(selectedForms);

      // Check if all forms in this bundle are currently selected
      const allSelected = formIds.every((id) => currentSelection.has(id));

      // Create new selection
      const newSelection = new Set(currentSelection);

      if (allSelected) {
        // Remove all bundle forms from selection (toggle OFF)
        formIds.forEach((id) => newSelection.delete(id));
      } else {
        // Add all bundle forms to selection (toggle ON)
        formIds.forEach((id) => newSelection.add(id));
      }

      // Update the state with the new selection
      setSelectedForms(newSelection);
    },
    [bundlesFormIds, selectedForms, setSelectedForms]
  );

  /**
   * Check if a specific bundle's forms are all selected
   * Useful for visual feedback (e.g., highlighting active bundle buttons)
   * 
   * @param {string} bundleId - The bundle ID to check
   * @returns {boolean} True if all forms in the bundle are selected
   */
  const isBundleSelected = useCallback(
    (bundleId) => {
      const formIds = bundlesFormIds[bundleId];
      if (!formIds || formIds.length === 0) return false;

      const currentSelection = selectedForms instanceof Set
        ? selectedForms
        : new Set(selectedForms);

      return formIds.every((id) => currentSelection.has(id));
    },
    [bundlesFormIds, selectedForms]
  );

  /**
   * Get the count of selected forms from a specific bundle
   * 
   * @param {string} bundleId - The bundle ID to check
   * @returns {number} Number of selected forms from this bundle
   */
  const getBundleSelectionCount = useCallback(
    (bundleId) => {
      const formIds = bundlesFormIds[bundleId];
      if (!formIds || formIds.length === 0) return 0;

      const currentSelection = selectedForms instanceof Set
        ? selectedForms
        : new Set(selectedForms);

      return formIds.filter((id) => currentSelection.has(id)).length;
    },
    [bundlesFormIds, selectedForms]
  );

  return {
    // Data
    bundles,
    bundlesFormIds,
    
    // State
    loading,
    error,
    
    // Operations
    toggleBundle,
    isBundleSelected,
    getBundleSelectionCount,
    
    // Refetch function for refreshing bundle data
    refetch: async () => {
      setLoading(true);
      try {
        const bundlesData = await fetchAllBundlesWithFormIds();
        const bundleList = [];
        const formIdsMap = {};

        for (const { bundle, formIds } of bundlesData) {
          bundleList.push(bundle);
          formIdsMap[bundle.id] = formIds;
        }

        setBundles(bundleList);
        setBundlesFormIds(formIdsMap);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to refresh bundles");
      } finally {
        setLoading(false);
      }
    },
  };
}
