import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Car, Users, Activity, type LucideIcon } from 'lucide-react';

// 1. Define the specific type interface to replace 'any'
interface StatCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
}

// 2. Apply the interface to the component props
function StatCard({ title, value, subtext, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
}

export default function SaccoOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        {/* 3. Escaped the apostrophe in "fleet's" */}
        <p className="text-muted-foreground">Overview of your fleet&apos;s performance today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value="KES 45,231" subtext="+20.1% from last month" icon={DollarSign} />
        <StatCard title="Active Fleet" value="12/15" subtext="3 vehicles currently idle" icon={Car} />
        <StatCard title="Pending Bookings" value="7" subtext="Requires immediate attention" icon={Activity} />
        <StatCard title="Total Clients" value="573" subtext="+12 new this week" icon={Users} />
      </div>
    </div>
  );
}