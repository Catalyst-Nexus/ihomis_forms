import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "./supabaseClient";

export function useTagAccess(currentUserId) {
  const [accessMap, setAccessMap] = useState({});
  const [loading, setLoading] = useState(false);
  const channelsRef = useRef([]);

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
        // Full access to all steps
        map[trackingId] = { tagOrder, seqIds: "all" };
      } else if (tagOrder === 2) {
        // Only steps explicitly assigned to this user
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
          // No tag-order-2 user assigned yet → show all steps
          map[trackingId] = { tagOrder, seqIds: "all" };
        }
      }
    }

    setAccessMap(map);
    setLoading(false);
  }, [currentUserId]);

  // Initial fetch + realtime subscription
  useEffect(() => {
    rebuild();

    if (!currentUserId) return;

    // Remove old channels before creating new ones
    channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    channelsRef.current = [];

    // Watch tracking_user_assignment (tagging changes)
    const ch1 = supabase
      .channel(`tag-access-assignment-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_user_assignment",
        },
        () => rebuild(),
      )
      .subscribe();

    // Watch user_seq_assignment (step assignment changes)
    const ch2 = supabase
      .channel(`tag-access-seqassign-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_seq_assignment",
        },
        () => rebuild(),
      )
      .subscribe();

    channelsRef.current = [ch1, ch2];

    return () => {
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
      channelsRef.current = [];
    };
  }, [currentUserId, rebuild]);

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
