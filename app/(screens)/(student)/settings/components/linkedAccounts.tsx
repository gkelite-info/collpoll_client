import React from "react";
import {
  GoogleLogo,
  FacebookLogo,
  GithubLogo,
  LinkedinLogo,
  IconProps,
  MicrosoftWordLogoIcon,
} from "@phosphor-icons/react";
import CourseScheduleCard from "@/app/utils/CourseScheduleCard";

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
}

interface LinkedAccountsProps {
  accounts: LinkedAccount[];
  onToggle: (id: string) => void;
}

export const mockAccountData: LinkedAccount[] = [
  {
    id: "google",
    name: "Google",
    icon: GoogleLogo,
    connected: true,
    description: "Connected to your account",
    color: "text-red-500",
  },
  {
    id: "facebook",
    name: "Facebook",
    icon: FacebookLogo,
    connected: true,
    description: "Connected to your account",
    color: "text-blue-600",
  },
  {
    id: "microsoft",
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
    id: "linkedin",
    name: "LinkedIn",
    icon: LinkedinLogo,
    connected: false,
    description: "Not Connected",
    color: "text-blue-700",
  },
];

const AccountRow: React.FC<AccountRowProps> = ({ account, onToggle }) => {
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
          <p className="text-sm text-gray-500">{account.description}</p>
        </div>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={account.connected}
          onChange={() => onToggle(account.id)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
      </label>
    </div>
  );
};

const LinkedAccounts: React.FC<LinkedAccountsProps> = ({
  accounts,
  onToggle,
}) => {
  const headerData = {
    course: "B.Tech CSE – Year 2",
    date: "23 OCT",
    time: "08:23 am",
  };

  return (
    <div className="p-6 space-y-6 sm:p-8">
      <div className="flex justify-between">
        <div className="text-xl font-semibold flex flex-col">
          <div className="flex justify-start items-center gap-2">
            <span className="text-[#282828]">Manage Linked Accounts</span>
          </div>
          <p className="text-gray-500 text-sm">
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
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LinkedAccounts;
