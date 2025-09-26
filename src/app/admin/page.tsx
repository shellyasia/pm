import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

const adminSections = [
  {
    title: "Dashboard",
    description: "View system overview and analytics",
    icon: BarChart3,
    href: "/admin/dashboard" as const,
    color: "text-blue-600",
  },
  {
    title: "Products",
    description: "Manage IoT products and firmware",
    icon: Package,
    href: "/admin/products" as const,
    color: "text-green-600",
  },
  {
    title: "Orders",
    description: "Manage manufacturing orders and requests",
    icon: ShoppingCart,
    href: "/admin/orders" as const,
    color: "text-indigo-600",
  },
  {
    title: "Users",
    description: "Manage user accounts and permissions",
    icon: Users,
    href: "/admin/users" as const,
    color: "text-purple-600",
  },
] as const;

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Welcome to the Product Management System administration panel
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </div>
                <Icon className={`h-8 w-8 ${section.color}`} />
              </CardHeader>
              <CardContent>
                <Link href={section.href} passHref>
                  <Button className="w-full">
                    Access {section.title}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/products" passHref>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Manage Products
              </Button>
            </Link>
            <Link href="/admin/orders" passHref>
              <Button variant="outline">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Manage Orders
              </Button>
            </Link>
            <Link href="/admin/dashboard" passHref>
              <Button variant="outline">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
