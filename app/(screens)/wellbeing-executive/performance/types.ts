export type Issue = {
  id: string;
  title: string;
  category: string;
  priority: string;
  date: string;
  description: string;
  attachments: { name: string; size: string }[];
};

export type Executive = {
  id: number;
  name: string;
  staffId: string;
  role: string;
  category: string;
  image: string;
  phone: string;
  email: string;
  status: string;
  totalIssues: number;
  resolvedIssues: number;
  contribution: number;
  issues: Issue[];
};
