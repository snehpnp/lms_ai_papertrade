import { useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";

const mockSubadmins = [
  { id: "1", name: "Robert Taylor", email: "robert@lms.com", assignedUsers: 45, status: "active" },
  { id: "2", name: "Lisa Anderson", email: "lisa@lms.com", assignedUsers: 32, status: "active" },
  { id: "3", name: "David Park", email: "david@lms.com", assignedUsers: 28, status: "inactive" },
];

const SubadminsPage = () => {
  const [search, setSearch] = useState("");
  const filtered = mockSubadmins.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="SubAdmins"
        subtitle="Manage sub-administrators"
        action={
          <Button asChild>
            <Link to="/admin/subadmins/add"><Plus className="w-4 h-4 mr-2" /> Add SubAdmin</Link>
          </Button>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-sm">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search subadmins..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Assigned Users</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sa) => (
              <TableRow key={sa.id}>
                <TableCell className="font-medium">{sa.name}</TableCell>
                <TableCell>{sa.email}</TableCell>
                <TableCell>{sa.assignedUsers}</TableCell>
                <TableCell>
                  <Badge variant={sa.status === "active" ? "default" : "secondary"}>{sa.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link to={`/admin/subadmins/edit/${sa.id}`}><Edit className="w-4 h-4" /></Link>
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
      </div>
    </div>
  );
};

export default SubadminsPage;
