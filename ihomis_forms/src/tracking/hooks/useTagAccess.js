/**
 * useTagAccess.js
 *
 * Resolves per-record step access for the current user.
 *
 * DB schema (actual):
 *   tracking_user_assignment: id | tracking_id | user_id | tag_order
 *   user_seq_assignment:      id | user_id     | seq_id   ← NO tracking_id
 *
 * Rules:
 *   tag_order 1  → seqIds: "all"
 *   tag_order 2  → seqIds: [their user_seq_assignment seq_ids]
 *   tag_order 3+ → seqIds: "remaining" (all NOT in user2's assignments)
 */

import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

export function useTagAccess(currentUserId) {
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(false);

  const rebuild = useCallback(async () => {
    if (!currentUserId) {
      setAccessMap({});
      return;
    }
    setLoading(true);

    // 1. All records this user is tagged on
    const { data: mine } = await supabase
      .from("tracking_user_assignment")
      .select("tracking_id, tag_order")
      .eq("user_id", currentUserId);

    if (!mine?.length) {
      setAccessMap({});
      setLoading(false);
      return;
    }

    const map = {};

    for (const row of mine) {
      const trackingId = String(row.tracking_id);
      const tagOrder = row.tag_order;

      if (tagOrder === 1) {
        // Full access
        map[trackingId] = { tagOrder, seqIds: "all" };
      } else if (tagOrder === 2) {
        // Only my assigned steps (user_seq_assignment by user_id — no tracking_id)
        const { data: mySeqs } = await supabase
          .from("user_seq_assignment")
          .select("seq_id")
          .eq("user_id", currentUserId);

        map[trackingId] = {
          tagOrder,
          seqIds: (mySeqs ?? []).map((r) => r.seq_id),
        };
      } else {
        // tag_order 3+ → everything NOT assigned to tag-order-2 user on this record
        const { data: user2row } = await supabase
          .from("tracking_user_assignment")
          .select("user_id")
          .eq("tracking_id", trackingId)
          .eq("tag_order", 2)
          .maybeSingle();

        if (user2row?.user_id) {
          const { data: u2Seqs } = await supabase
            .from("user_seq_assignment")
            .select("seq_id")
            .eq("user_id", user2row.user_id);

          map[trackingId] = {
            tagOrder,
            seqIds: "remaining",
            excludeSeqIds: (u2Seqs ?? []).map((r) => r.seq_id),
          };
        } else {
          // No user2 assigned yet → show all
          map[trackingId] = { tagOrder, seqIds: "all" };
        }
      }
    }

    setAccessMap(map);
    setLoading(false);
  }, [currentUserId]);

  useEffect(() => {
    rebuild();
  }, [rebuild]);

  /** Returns true if the current user can see a given step on a given record */
  function canSeeStep(row, seqId) {
    const a = accessMap[String(row?.id)];
    if (!a) return false;
    if (a.seqIds === "all") return true;
    if (a.seqIds === "remaining")
      return !(a.excludeSeqIds ?? []).includes(seqId);
    return a.seqIds.includes(seqId);
  }

  /** Returns true if the current user has any access to this record */
  function hasAccess(recordId) {
    return !!accessMap[String(recordId)];
  }

  return { accessMap, canSeeStep, hasAccess, loading, refresh: rebuild };
}
