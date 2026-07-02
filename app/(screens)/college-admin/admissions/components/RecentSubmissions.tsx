"use client";

import { useState, useEffect } from "react";
import { CaretRight, FileText } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getRecentApplications, subscribeToSubmissions, subscribeToPayments, unsubscribeChannel } from "@/lib/api/gkeliteApi";
import { RecentSubmissionsSkeleton } from "./Skeletons";

type Submission = {
  id: string;
  name: string;
  course: string;
  date: string;
  status: string;
  rawAppId?: number;
};

export default function RecentSubmissions() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      const data = await getRecentApplications(5);

      if (data && data.length > 0) {
        const formatted = data.map(app => {
          const dateObj = new Date(app.createdAt);
          const now = new Date();
          const isToday = dateObj.toDateString() === now.toDateString();
          const yesterday = new Date();
          yesterday.setDate(now.getDate() - 1);
          const isYesterday = dateObj.toDateString() === yesterday.toDateString();
          
          let dateStr = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(dateObj);
          if (isToday) dateStr = 'Today';
          else if (isYesterday) dateStr = 'Yesterday';
          
          const timeStr = dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

          let paymentStatus = "Pending";
          if (app.lead_payments && app.lead_payments.length > 0) {
            const payments = [...app.lead_payments].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            const status = payments[0].paymentStatus?.toLowerCase();
            if (status === "success") paymentStatus = "Success";
            else if (status === "failed") paymentStatus = "Failed";
          }

          return {
            id: app.applicationNumber || `APP-${app.applicationId}`,
            name: `${app.firstName} ${app.lastName}`,
            course: app.course,
            date: `${dateStr}, ${timeStr}`,
            status: paymentStatus,
            rawAppId: app.applicationId
          };
        });
        setSubmissions(formatted);
      }
      setLoading(false);
    };

    fetchRecent();

    const sub = subscribeToSubmissions((payload: any) => {
      if (!payload) return;
      
      const dateObj = new Date(payload.createdAt || Date.now());
      const timeStr = dateObj.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

      const newSubmission: Submission = {
        id: payload.applicationNumber || `APP-${payload.applicationId}`,
        name: `${payload.firstName} ${payload.lastName}`,
        course: payload.course || "N/A",
        date: `Today, ${timeStr}`,
        status: "Pending",
        rawAppId: payload.applicationId
      };
      
      setSubmissions(prev => [newSubmission, ...prev].slice(0, 5));
    });

    const paymentSub = subscribeToPayments((payload: any) => {
      if (!payload) return;
      setSubmissions(prev => prev.map(sub => {
        if (sub.rawAppId === payload.applicationId) {
          const s = payload.paymentStatus?.toLowerCase();
          let newStatus = "Pending";
          if (s === "success") newStatus = "Success";
          else if (s === "failed") newStatus = "Failed";
          return { ...sub, status: newStatus };
        }
        return sub;
      }));
    });

    return () => {
      unsubscribeChannel(sub);
      unsubscribeChannel(paymentSub);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <span className="px-2.5 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full whitespace-nowrap">Pending</span>;
      case "Success":
        return <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap">Success</span>;
      case "Failed":
        return <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full whitespace-nowrap">Failed</span>;
      case "Reviewed":
        return <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">Reviewed</span>;
      case "Approved":
        return <span className="px-2.5 py-1 text-xs font-medium bg-teal-100 text-teal-700 rounded-full whitespace-nowrap">Approved</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full whitespace-nowrap">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden h-full flex flex-col min-h-[500px]">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-gray-800 truncate">Recent Applications</h3>
          <p className="text-sm text-gray-500 truncate">Latest form submissions from website</p>
        </div>
        <Link href="/college-admin/admissions/applications">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors shrink-0 cursor-pointer">
            View All <CaretRight size={14} weight="bold" />
          </button>
        </Link>
      </div>
      
      <div className="flex-1">
        {loading ? (
          <RecentSubmissionsSkeleton />
        ) : (
          <div className="w-full divide-y divide-gray-100">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No recent applications found.</div>
            ) : (
            submissions.map((sub) => (
              <div 
                key={sub.id} 
                onClick={() => router.push(`/college-admin/admissions/applications?search=${encodeURIComponent(sub.id)}`)}
                className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer gap-4"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText size={20} weight="duotone" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{sub.name}</p>
                    <div className="flex flex-col text-xs text-gray-500 w-full mt-0.5">
                      <span className="truncate text-gray-600">{sub.course}</span>
                      <span className="overflow-x-auto whitespace-nowrap w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] text-[11px] mt-0.5 text-gray-400 font-mono">
                        {sub.id}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {getStatusBadge(sub.status)}
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{sub.date}</span>
                </div>
              </div>
            ))
          )}
        </div>
        )}
      </div>
    </div>
  );
}
