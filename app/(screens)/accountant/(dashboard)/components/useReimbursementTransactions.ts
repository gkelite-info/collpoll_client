"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/utils/context/UserContext";
import {
  fetchAccountantReimbursementTransactions,
  type AccountantReimbursementTransaction,
} from "@/lib/helpers/accountant/accountantReimbursementDashboardAPI";

export function useReimbursementTransactions() {
  const { collegeId, loading: userLoading } = useUser();
  const [transactions, setTransactions] = useState<AccountantReimbursementTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (userLoading) return;
    Promise.resolve().then(() => {
      if (!active) return;
      setLoading(true);
      setError(null);
    });
    fetchAccountantReimbursementTransactions(collegeId)
      .then((data) => {
        if (active) setTransactions(data);
      })
      .catch((reason) => {
        if (!active) return;
        console.error("Unable to load paid employee expenses:", reason);
        setTransactions([]);
        setError(reason instanceof Error ? reason.message : "Unable to load expenses.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [collegeId, userLoading]);

  return { transactions, loading, error };
}
