import { Hero, HeroFeature, HeroFeatureGrid } from "@/app/hero";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Upload,
  Shield,
  Database,
  Zap,
  Newspaper
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Hero
        subtitle="IoT Management Platform"
        title="Comprehensive Product Management System"
        description="Enterprise-grade admin panel for managing IoT products, orders, and user accounts. Built with Next.js 14, TypeScript, and PostgreSQL for maximum performance and reliability."
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/admin">
            <Button size="lg" className="px-8">
              Go to Admin Panel
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="px-8">
              Sign In
            </Button>
          </Link>
        </div>

        <HeroFeatureGrid>
          <HeroFeature
            title="Product Management"
            description="Create, edit, sync, and view IoT products with complete firmware information, version tracking, and product lifecycle control."
            icon={<Package className="h-6 w-6 text-primary" />}
            href="/admin/products"
          />

          <HeroFeature
            title="Order Management"
            description="Process and track manufacturing orders with Excel import/export capabilities, automated workflows, and comprehensive order history."
            icon={<ShoppingCart className="h-6 w-6 text-primary" />}
            href="/admin/orders"
          />

          <HeroFeature
            title="User Management"
            description="Manage user accounts, permissions, and access control with secure JWT-based authentication and role management."
            icon={<Users className="h-6 w-6 text-primary" />}
            href="/admin/users"
          />

          <HeroFeature
            title="Dashboard Analytics"
            description="Real-time insights, statistics, and operational metrics to monitor your IoT ecosystem and make data-driven decisions."
            icon={<BarChart3 className="h-6 w-6 text-primary" />}
            href="/admin/dashboard"
          />

          <HeroFeature
            title="Attachment Management"
            description="Upload, download, and manage file attachments with secure hash-based storage and comprehensive file tracking."
            icon={<FileText className="h-6 w-6 text-primary" />}
            href="/admin/attachments"
          />

          <HeroFeature
            title="Excel Integration"
            description="Import and export order data seamlessly with XLSX support, bulk operations, and automated data validation."
            icon={<Upload className="h-6 w-6 text-primary" />}
            href="/admin/orders"
          />

          <HeroFeature
            title="Hacker News"
            description="Browse and sync the latest tech news and stories from Hacker News with real-time updates and search."
            icon={<Newspaper className="h-6 w-6 text-primary" />}
            href="/hackernews"
          />
        </HeroFeatureGrid>

        {/* Additional Features Section */}
        <div className="mt-24 mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            Built with Modern Technology
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
            Powered by industry-leading tools and frameworks to ensure reliability, security, and performance
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
              <Shield className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Secure Authentication</h3>
              <p className="text-sm text-muted-foreground">
                OAuth flow with JWT tokens and bcrypt password hashing for enterprise-grade security
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
              <Database className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">PostgreSQL Database</h3>
              <p className="text-sm text-muted-foreground">
                Type-safe Kysely query builder with advanced filtering, sorting, and pagination
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 border rounded-lg bg-card">
              <Zap className="h-10 w-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Next.js 14 Performance</h3>
              <p className="text-sm text-muted-foreground">
                App Router, Server Components, and SWR for optimal loading speeds and user experience
              </p>
            </div>
          </div>
        </div>
      </Hero>
    </main>
  );
}
