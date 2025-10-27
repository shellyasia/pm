"use client";

import { useEffect, useState } from "react";
import { useAuth, withAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Download,
    Factory,
    FileText,
    Filter,
    LogOut,
    Package,
    Search,
} from "lucide-react";

interface Attachment {
    id: number;
    name: string;
    hash: string;
    size: number;
    mimetype: string;
    tag: string;
    product_code: string;
    remark?: string;
}

interface Order {
    id: string;
    name: string;
    product_code: string;
    factory: string;
    priority: string;
    quantity: number;
    batch: string;
    status: string;
    remark: string;
    created_at: string;
    updated_at: string;
    attachments: Attachment[];
}

function OrdersPageContent() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [batchFilter, setBatchFilter] = useState("");
    const [availableBatches, setAvailableBatches] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(
        new Set(),
    );
    const limit = 200;

    // Check if user's company matches allowed factories
    useEffect(() => {
        if (user && user.company.toLowerCase() === "null") {
            // User doesn't have a factory assigned, redirect to unauthorized page
            alert(
                "You don't have a factory assigned. Please contact an administrator.",
            );
            router.push("/admin");
        }
    }, [user, router]);

    // Fetch orders
    const fetchOrders = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search,
            });

            if (batchFilter) {
                params.append("batch", batchFilter);
            }

            const response = await fetch(
                `/api/orders/my-orders?${params.toString()}`,
            );

            if (!response.ok) {
                throw new Error("Failed to fetch orders");
            }

            const data = await response.json();
            setOrders(data.rows);
            setTotal(data.total);

            // Extract unique batches for filter
            const batches = Array.from(
                new Set(
                    data.rows.map((order: Order) => order.batch).filter(
                        Boolean,
                    ),
                ),
            ).sort();
            setAvailableBatches(batches as string[]);
        } catch (error) {
            console.error("Error fetching orders:", error);
            alert("Failed to load orders. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, batchFilter, user]);

    const toggleOrderExpansion = (orderId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const getStatusColor = (status: string): string => {
        switch (status?.toLowerCase()) {
            case "draft":
                return "bg-gray-100 text-gray-800 border-gray-200";
            case "approved":
                return "bg-green-100 text-green-800 border-green-200";
            case "producing":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "completed":
                return "bg-purple-100 text-purple-800 border-purple-200";
            case "cancelled":
                return "bg-red-100 text-red-800 border-red-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getPriorityColor = (priority: string): string => {
        switch (priority?.toLowerCase()) {
            case "urgent":
                return "bg-red-100 text-red-800 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-800 border-orange-200";
            case "normal":
                return "bg-blue-100 text-blue-800 border-blue-200";
            case "low":
                return "bg-gray-100 text-gray-800 border-gray-200";
            default:
                return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    const handleDownload = (attachment: Attachment) => {
        window.open(`/api/attachments/download/${attachment.hash}`, "_blank");
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "GET",
                credentials: "include",
            });
            router.push("/login");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
                        <p className="text-muted-foreground">
                            View orders for your factory:{" "}
                            <span className="font-semibold text-primary">
                                {user.company}
                            </span>
                        </p>
                    </div>

                    {/* User Info Card */}
                    <Card className="min-w-[250px]">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm border border-primary/20 flex-shrink-0">
                                    <span className="text-sm font-semibold text-primary-foreground">
                                        {user.name
                                            ? user.name.charAt(0).toUpperCase()
                                            : user.email.charAt(0)
                                                .toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-sm truncate">
                                        {user.name || user.email}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {user.email}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {user.role}
                                        </Badge>
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            {user.company}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="w-full mt-4"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search orders..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>

                        {/* Batch Filter */}
                        <Select
                            value={batchFilter}
                            onValueChange={(value) => {
                                setBatchFilter(value === "all" ? "" : value);
                                setPage(1);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by batch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Batches</SelectItem>
                                {availableBatches.map((batch) => (
                                    <SelectItem key={batch} value={batch}>
                                        {batch}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            {loading
                ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <Card key={i}>
                                <CardHeader>
                                    <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                                    <div className="h-4 w-1/2 bg-muted animate-pulse rounded mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-20 w-full bg-muted animate-pulse rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )
                : orders.length === 0
                ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">
                                No orders found
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {search || batchFilter
                                    ? "Try adjusting your filters"
                                    : "No orders available for your factory"}
                            </p>
                        </CardContent>
                    </Card>
                )
                : (
                    <>
                        <div className="space-y-4 mb-6">
                            {orders.map((order) => {
                                const isExpanded = expandedOrders.has(order.id);
                                return (
                                    <Card
                                        key={order.id}
                                        className="overflow-hidden"
                                    >
                                        <CardHeader
                                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() =>
                                                toggleOrderExpansion(order.id)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CardTitle className="text-lg">
                                                            {order.name}
                                                        </CardTitle>
                                                        {isExpanded
                                                            ? (
                                                                <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                            )
                                                            : (
                                                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                            )}
                                                    </div>
                                                    <CardDescription className="flex flex-wrap gap-2 items-center">
                                                        <span className="flex items-center gap-1">
                                                            <Package className="h-3 w-3" />
                                                            {order.product_code}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {order.batch}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Factory className="h-3 w-3" />
                                                            Qty:{" "}
                                                            {order.quantity}
                                                        </span>
                                                    </CardDescription>
                                                </div>
                                                <div className="flex flex-col gap-2 items-end">
                                                    <Badge
                                                        className={getStatusColor(
                                                            order.status,
                                                        )}
                                                        variant="outline"
                                                    >
                                                        {order.status}
                                                    </Badge>
                                                    <Badge
                                                        className={`${getPriorityColor(
                                                            order.priority,
                                                        )} font-medium shadow-sm`}
                                                        variant="outline"
                                                    >
                                                        {order.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        {isExpanded && (
                                            <CardContent className="border-t bg-gradient-to-b from-muted/20 to-transparent">
                                                <div className="space-y-6 pt-6">{/* Order Details */}
                                                    <div className="bg-card rounded-lg p-4 border shadow-sm">
                                                        <h4 className="font-semibold mb-3 text-base flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-primary"></div>
                                                            Order Details
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-muted-foreground font-medium min-w-[80px]">
                                                                    Order ID:
                                                                </span>
                                                                <span className="font-mono text-xs bg-secondary/50 px-2 py-0.5 rounded">
                                                                    {order.id}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-start gap-2">
                                                                <span className="text-muted-foreground font-medium min-w-[80px]">
                                                                    Created:
                                                                </span>
                                                                <span>
                                                                    {new Date(
                                                                        order.created_at,
                                                                    ).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                            {order.remark && (
                                                                <div className="col-span-full flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-md border border-amber-200 dark:border-amber-900">
                                                                    <span className="text-muted-foreground font-medium">
                                                                        Remark:
                                                                    </span>
                                                                    <span className="flex-1">
                                                                        {order.remark}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Attachments */}
                                                    <div className="bg-card rounded-lg p-4 border shadow-sm">
                                                        <h4 className="font-semibold mb-3 text-base flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-primary" />
                                                            Attachments
                                                            {order.attachments &&
                                                                order.attachments
                                                                    .length >
                                                                    0 &&
                                                                (
                                                                    <Badge variant="secondary" className="ml-1">
                                                                        {order.attachments.length}
                                                                    </Badge>
                                                                )}
                                                        </h4>
                                                        {order.attachments &&
                                                        order.attachments
                                                                .length > 0
                                                            ? (
                                                                <div className="space-y-2">
                                                                    {order
                                                                        .attachments
                                                                        .map((
                                                                            attachment,
                                                                        ) => (
                                                                            <div
                                                                                key={attachment
                                                                                    .id}
                                                                                className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg hover:from-muted hover:to-muted/50 transition-all duration-200 border border-transparent hover:border-primary/20 group"
                                                                            >
                                                                                <div className="flex-1 min-w-0">
                                                                                    <div className="font-medium text-sm mb-1 truncate group-hover:text-primary transition-colors">
                                                                                        {attachment
                                                                                            .name}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground flex flex-wrap gap-2">
                                                                                        <span className="bg-background/60 px-2 py-0.5 rounded">
                                                                                            {formatFileSize(
                                                                                                attachment
                                                                                                    .size,
                                                                                            )}
                                                                                        </span>
                                                                                        <span className="bg-background/60 px-2 py-0.5 rounded">
                                                                                            {attachment
                                                                                                .mimetype}
                                                                                        </span>
                                                                                        <span className="bg-background/60 px-2 py-0.5 rounded">
                                                                                            {attachment
                                                                                                .product_code}
                                                                                        </span>
                                                                                        {attachment
                                                                                            .tag &&
                                                                                            (
                                                                                                <Badge
                                                                                                    variant="outline"
                                                                                                    className="text-xs h-5"
                                                                                                >
                                                                                                    {attachment
                                                                                                        .tag}
                                                                                                </Badge>
                                                                                            )}
                                                                                    </div>
                                                                                    {attachment.remark && (
                                                                                        <div className="text-xs text-muted-foreground mt-2 italic bg-background/40 px-2 py-1 rounded">
                                                                                            💬 {attachment.remark}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="ghost"
                                                                                    onClick={() =>
                                                                                        handleDownload(
                                                                                            attachment,
                                                                                        )}
                                                                                    className="ml-3 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                                                                                >
                                                                                    <Download className="h-4 w-4" />
                                                                                </Button>
                                                                            </div>
                                                                        ))}
                                                                </div>
                                                            )
                                                            : (
                                                                <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                                                                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                                                                        <FileText className="h-4 w-4" />
                                                                        No attachments available for this order
                                                                    </p>
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {total > limit && (
                            <Card className="shadow-md">
                                <CardContent className="py-4">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing <span className="font-semibold text-foreground">{(page - 1) * limit + 1}</span> to{" "}
                                            <span className="font-semibold text-foreground">{Math.min(page * limit, total)}</span> of{" "}
                                            <span className="font-semibold text-foreground">{total}</span> orders
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page === 1}
                                                onClick={() => setPage(page - 1)}
                                                className="transition-all duration-200 disabled:opacity-50"
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-md">
                                                <span className="text-sm font-medium">
                                                    Page {page} of {Math.ceil(total / limit)}
                                                </span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={page * limit >= total}
                                                onClick={() => setPage(page + 1)}
                                                className="transition-all duration-200 disabled:opacity-50"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
        </div>
    );
}

// Export the page wrapped with authentication
export default withAuth(OrdersPageContent);
