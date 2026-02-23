import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const mockUsers = [
  { id: "1", name: "John Doe", email: "john@example.com", status: "active", trades: 145, profit: 2340.5 },
  { id: "2", name: "Jane Smith", email: "jane@example.com", status: "active", trades: 89, profit: -560.3 },
  { id: "3", name: "Mike Chen", email: "mike@example.com", status: "inactive", trades: 234, profit: 8900.0 },
  { id: "4", name: "Sara Wilson", email: "sara@example.com", status: "active", trades: 67, profit: 1230.8 },
  { id: "5", name: "Alex Brown", email: "alex@example.com", status: "active", trades: 312, profit: -890.2 },
  { id: "6", name: "Emily Davis", email: "emily@example.com", status: "inactive", trades: 45, profit: 450.0 },
];

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Users"
        subtitle="Manage all platform users"
        action={
          <Button asChild>
            <Link to="/admin/users/add">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Link>
          </Button>
        }
      />

      {/* Search */}
      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trades</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.trades}</TableCell>
                <TableCell
                  className={`font-semibold ${
                    user.profit >= 0 ? "text-profit-foreground" : "text-loss-foreground"
                  }`}
                >
                  {user.profit >= 0 ? "+" : ""}${user.profit.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/users/edit/${user.id}`}>
                        <Edit className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-loss-foreground hover:text-loss-foreground">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
          <span>Showing {filtered.length} of {mockUsers.length} users</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="w-8 h-8">1</Button>
            <Button variant="outline" size="icon" className="w-8 h-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
