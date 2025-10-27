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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      <div className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-3">
            Admin Panel
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to the Product Management System administration panel
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
          {adminSections.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.title}
                className="group overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full transform group-hover:scale-110 transition-transform duration-300"></div>
                  <div className="space-y-2 z-10">
                    <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {section.description}
                    </CardDescription>
                  </div>
                  <div className={`rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 shadow-lg border-2 border-gray-100 group-hover:border-primary/20 group-hover:shadow-xl transition-all duration-300 z-10`}>
                    <Icon className={`h-10 w-10 ${section.color} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                </CardHeader>
                <CardContent className="z-10 relative">
                  <Link href={section.href} passHref>
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                      <span>Access {section.title}</span>
                      <svg
                        className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle className="text-2xl">Quick Actions</CardTitle>
            <CardDescription className="text-base">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              <Link href="/admin/products" passHref>
                <Button variant="outline" className="hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <Package className="mr-2 h-4 w-4" />
                  Manage Products
                </Button>
              </Link>
              <Link href="/admin/orders" passHref>
                <Button variant="outline" className="hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Manage Orders
                </Button>
              </Link>
              <Link href="/admin/dashboard" passHref>
                <Button variant="outline" className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
