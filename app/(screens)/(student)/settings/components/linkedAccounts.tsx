"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GoogleLogo,
  FacebookLogo,
  GithubLogo,
  LinkedinLogo,
  IconProps,
  MicrosoftWordLogoIcon,
  CaretLeft,
  CircleNotch,
} from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";
import { useUser } from "@/app/utils/context/UserContext";
import toast from "react-hot-toast";
import {
  syncAndFetchLinkedAccounts,
  linkUserIdentity,
  unlinkUserIdentity,
} from "@/lib/helpers/settings/linkedAccountsAPI";
import { supabase } from "@/lib/supabaseClient";

export interface LinkedAccount {
  id: string;
  name: string;
  icon: React.ComponentType<IconProps>;
  connected: boolean;
  description: string;
  color: string;
}

interface AccountRowProps {
  account: LinkedAccount;
  onToggle: (id: string) => void;
  isProcessing: boolean;
}

export const initialAccountData: LinkedAccount[] = [
  {
    id: "google",
    name: "Google",
    icon: GoogleLogo,
    connected: false,
    description: "Not Connected",
    color: "text-red-500",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: FacebookLogo,
    connected: false,
    description: "Not Connected",
    color: "text-blue-600",
  },
  {
    id: "azure",
    name: "Microsoft",
    icon: MicrosoftWordLogoIcon,
    connected: false,
    description: "Not Connected",
    color: "text-orange-500",
  },
  {
    id: "github",
    name: "GitHub",
    icon: GithubLogo,
    connected: false,
    description: "Not Connected",
    color: "text-gray-900",
  },
  {
    id: "linkedin_oidc",
    name: "LinkedIn",
    icon: LinkedinLogo,
    connected: false,
    description: "Not Connected",
    color: "text-blue-700",
  },
];

const AccountRow: React.FC<AccountRowProps> = ({
  account,
  onToggle,
  isProcessing,
}) => {
  const Icon = account.icon;

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm mb-4">
      <div className="flex items-center space-x-4">
        <div className={`p-1 rounded-full text-2xl ${account.color}`}>
          <Icon weight="fill" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {account.name}
          </h3>
          <p className="text-sm text-gray-500">
            {isProcessing ? "Updating..." : account.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isProcessing && (
          <CircleNotch
            size={20}
            className="animate-spin text-[#43C17A]"
            weight="bold"
          />
        )}

        <label
          className={`relative inline-flex items-center ${
            isProcessing
              ? "cursor-not-allowed opacity-60 pointer-events-none"
              : "cursor-pointer"
          }`}
        >
          <input
            type="checkbox"
            checked={account.connected}
            onChange={() => {
              if (!isProcessing) onToggle(account.id);
            }}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#43C17A]"></div>
        </label>
      </div>
    </div>
  );
};

export default function LinkedAccounts() {
  const { userId } = useUser();
  const [accounts, setAccounts] = useState<LinkedAccount[]>(initialAccountData);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadFromSession = async (user: any) => {
    if (!user) return;

    const activeProviders =
      user.identities?.map((id: any) => id.provider) || [];
    setAccounts((prev) =>
      prev.map((acc) => ({
        ...acc,
        connected: activeProviders.includes(acc.id),
        description: activeProviders.includes(acc.id)
          ? "Connected"
          : "Not Connected",
      })),
    );

    if (userId) {
      const { syncedProviders, updatedDbAccounts } =
        await syncAndFetchLinkedAccounts(userId);

      setAccounts((prev) =>
        prev.map((acc) => {
          const isConnected = syncedProviders.includes(acc.id);
          const dbRecord = updatedDbAccounts.find(
            (d: any) => d.provider === acc.id,
          );
          return {
            ...acc,
            connected: isConnected,
            description: isConnected
              ? `Connected to ${dbRecord?.email || "your account"}`
              : "Not Connected",
          };
        }),
      );
    }
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (isMounted && data.user) loadFromSession(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted && session?.user) {
        loadFromSession(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [userId]);

  const handleToggleLinkedAccount = async (accountId: string) => {
    const targetAccount = accounts.find((acc) => acc.id === accountId);
    if (!targetAccount) return;

    setProcessingId(accountId);

    await new Promise((resolve) => setTimeout(resolve, 50));

    if (targetAccount.connected) {
      try {
        await unlinkUserIdentity(accountId, userId!);

        setAccounts((prev) =>
          prev.map((a) =>
            a.id === accountId
              ? { ...a, connected: false, description: "Not Connected" }
              : a,
          ),
        );
        toast.success(`${targetAccount.name} disconnected!`);
      } catch (error: any) {
        toast.error(error.message || "Failed to disconnect.");
      } finally {
        setProcessingId(null);
      }
    } else {
      toast.loading(`Connecting ${targetAccount.name}...`);
      try {
        const redirectUrl = `${window.location.origin}/settings?linked-accounts`;
        await linkUserIdentity(accountId, redirectUrl);
      } catch (error: any) {
        toast.dismiss();
        toast.error(error.message || "Failed to initialize connection.");
        setProcessingId(null);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 sm:p-8">
      <div className="flex justify-between">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2">
            <Link
              href="/settings"
              className="hover:bg-gray-200 p-1 rounded-full transition-colors"
            >
              <CaretLeft size={24} className="text-[#282828]" weight="bold" />
            </Link>
            <span className="text-[#282828]">Manage Linked Accounts</span>
          </div>
          <p className="text-gray-500 text-sm ml-9">
            Connect or disconnect your third party accounts
          </p>
        </div>
        <div className="w-[32%]">
          <CourseScheduleCard />
        </div>
      </div>
      <div>
        <div className="mt-8">
          {accounts.map((account) => (
            <AccountRow
              key={account.id}
              account={account}
              onToggle={handleToggleLinkedAccount}
              isProcessing={processingId === account.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
