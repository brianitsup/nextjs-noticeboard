"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Notice } from "@/types/notice";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";

export default function Dashboard() {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching notices:", error);
        return;
      }

      setNotices(data || []);
    };

    fetchNotices();
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Notices</h2>
        <Link
          href="/dashboard/notices/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          Create New Notice
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Posted At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {notices.map((notice) => (
              <tr key={notice.id}>
                <td className="whitespace-nowrap px-6 py-4">{notice.title}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  {notice.category}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {formatDate(notice.posted_at || null)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Link
                    href={`/dashboard/notices/${notice.id}`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 