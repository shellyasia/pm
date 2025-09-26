import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart3, Cpu, Package, TrendingUp, Users } from "lucide-react";

const stats = [
  {
    title: "Total Products",
    value: "24",
    description: "12% from last month",
    icon: Package,
    trend: "up",
  },
  {
    title: "Firmware Versions",
    value: "156",
    description: "8 new releases",
    icon: Cpu,
    trend: "up",
  },
  {
    title: "Active Devices",
    value: "1,234",
    description: "5% increase",
    icon: BarChart3,
    trend: "up",
  },
  {
    title: "Total Users",
    value: "12",
    description: "2 new this month",
    icon: Users,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {stat.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Products</CardTitle>
            <CardDescription>
              Latest products added to your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  name: "Industrial Printer Pro",
                  model: "IPP-2024",
                  status: "Active",
                },
                {
                  name: "Office Printer Standard",
                  model: "OPS-2024",
                  status: "Active",
                },
                { name: "Compact Scanner", model: "CS-2024", status: "Draft" },
              ].map((product) => (
                <div
                  key={product.model}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.model}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coverage Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Coverage Overview</CardTitle>
            <CardDescription>
              Device usage and coverage statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Pages Printed</span>
                <span className="font-medium">2,847,593</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average per Device</span>
                <span className="font-medium">2,412</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Error Rate</span>
                <span className="font-medium text-green-600">0.02%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Top Location</span>
                <span className="font-medium">New York Office</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
