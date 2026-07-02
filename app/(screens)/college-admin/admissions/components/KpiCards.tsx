"use client";

import { useState, useEffect, useRef } from "react";
import { Users, FileText, CheckCircle } from "@phosphor-icons/react";
import { formatKpiNumber } from "@/lib/helpers/numberFormatter";
import { getKpiCounts, subscribeToAnalytics, subscribeToSubmissions, unsubscribeChannel } from "@/lib/api/gkeliteApi";
import { KpiCardsSkeleton } from "./Skeletons";
import { useUser } from "@/app/utils/context/UserContext";

type KpiData = {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
};

export default function KpiCards() {
  const [visitors, setVisitors] = useState<number>(0);
  const [opens, setOpens] = useState<number>(0);
  const [submissions, setSubmissions] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { collegeCode } = useUser();

  // Keep track of sets to maintain distinct counts
  const visitorIdsSet = useRef<Set<string>>(new Set());
  const openIdsSet = useRef<Set<string>>(new Set());

  // Use a ref to batch realtime events instead of causing UI lag from mass re-renders
  const pendingUpdates = useRef({ visitors: 0, opens: 0, submissions: 0 });

  useEffect(() => {
    // 1. Initial Fetch
    const fetchInitialData = async () => {
      setLoading(true);
      const counts = await getKpiCounts(collegeCode || null);
      setVisitors(counts.visitors);
      setOpens(counts.opens);
      setSubmissions(counts.submissions);
      
      // Store the initial IDs for deduplication
      visitorIdsSet.current = counts.visitorIds;
      openIdsSet.current = counts.openIds;
      setLoading(false);
    };

    fetchInitialData();

    // 2. Batched Updater (Flushes accumulated realtime events every 2 seconds to avoid freezing the UI)
    const batchInterval = setInterval(() => {
      const updates = pendingUpdates.current;
      if (updates.visitors > 0 || updates.opens > 0 || updates.submissions > 0) {
        setVisitors(v => v + updates.visitors);
        setOpens(o => o + updates.opens);
        setSubmissions(s => s + updates.submissions);
        // Reset
        pendingUpdates.current = { visitors: 0, opens: 0, submissions: 0 };
      }
    }, 2000);

    // 3. Setup Supabase Realtime Subscriptions via API
    const analyticsSub = subscribeToAnalytics(
      collegeCode || null,
      (visitorId: string) => { 
        if (!visitorIdsSet.current.has(visitorId)) {
          visitorIdsSet.current.add(visitorId);
          pendingUpdates.current.visitors += 1; 
        }
      },
      (visitorId: string) => { 
        if (!openIdsSet.current.has(visitorId)) {
          openIdsSet.current.add(visitorId);
          pendingUpdates.current.opens += 1; 
        }
      }
    );

    const submissionsSub = subscribeToSubmissions(
      () => { pendingUpdates.current.submissions += 1; }
    );

    return () => {
      clearInterval(batchInterval);
      unsubscribeChannel(analyticsSub);
      unsubscribeChannel(submissionsSub);
    };
  }, [collegeCode]);

  const kpis: KpiData[] = [
    {
      title: "Website Visitors",
      value: visitors,
      icon: <Users size={32} weight="duotone" className="text-blue-500" />,
      color: "bg-blue-50 border-blue-200",
    },
    {
      title: "Admissions Opened",
      value: opens,
      icon: <FileText size={32} weight="duotone" className="text-orange-500" />,
      color: "bg-orange-50 border-orange-200",
    },
    {
      title: "Forms Submitted",
      value: submissions,
      icon: <CheckCircle size={32} weight="duotone" className="text-green-500" />,
      color: "bg-green-50 border-green-200",
    },
  ];

  if (loading) {
    return <KpiCardsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className={`flex items-center p-6 rounded-2xl border shadow-sm transition-transform hover:scale-[1.02] cursor-default ${kpi.color}`}
        >
          <div className="p-4 bg-white rounded-full shadow-sm mr-4 shrink-0">
            {kpi.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1 truncate">{kpi.title}</p>
            <h3 className="text-3xl font-bold text-gray-800 truncate" title={kpi.value.toLocaleString('en-IN')}>
              {formatKpiNumber(kpi.value)}
            </h3>
          </div>
        </div>
      ))}
    </div>
  );
}
