import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { adminUsersService } from "@/services/admin.users.service";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const SubadminsPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "block" | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subadmins", page, limit, search, statusFilter],
    queryFn: () =>
      adminUsersService.getAll({
        page,
        limit,
        search,
        role: "SUBADMIN",
        status: statusFilter,
      }),
  });

  const subadmins = data?.items || [];
  const total = data?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminUsersService.delete(id),
    onSuccess: () => {
      toast.success("SubAdmin deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-subadmins"] });
    },
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      blocked ? adminUsersService.unblock(id) : adminUsersService.block(id),
    onSuccess: (_, variables) => {
      toast.success(variables.blocked ? "SubAdmin unblocked" : "SubAdmin blocked");
      queryClient.invalidateQueries({ queryKey: ["admin-subadmins"] });
    },
  });

  const handleConfirm = () => {
    if (!selectedUser || !confirmType) return;

    if (confirmType === "delete") {
      deleteMutation.mutate(selectedUser.id, {
        onSuccess: () => {
          setConfirmOpen(false);
          setSelectedUser(null);
          setConfirmType(null);
        },
      });
    }

    if (confirmType === "block") {
      blockMutation.mutate(
        { id: selectedUser.id, blocked: selectedUser.isBlocked },
        {
          onSuccess: () => {
            setConfirmOpen(false);
            setSelectedUser(null);
            setConfirmType(null);
          },
        }
      );
    }
  };

  const columns = [
    {
      header: "#",
      className: "w-12 text-center",
      render: (_: any, index: number) => (
        <span className="font-bold text-[11px] text-muted-foreground/50">
          {(page - 1) * limit + index + 1}
        </span>
      ),
    },
    {
      header: "Name",
      className: "min-w-[180px]",
      render: (user: any) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-border/40">
            <AvatarImage src={user.avatar || ""} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-black uppercase transition-colors group-hover:bg-primary/20">
              {user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0">
            <span className="font-bold text-foreground line-clamp-1 leading-tight">{user.name}</span>
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">ID: {user.id.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    { header: "Email", accessor: "email" as const },
    { header: "Phone", accessor: "phoneNumber" as const },
    {
      header: "Status",
      render: (user: any) => (
        <Badge
          className={`px-3 py-1 rounded-full text-xs font-medium ${user.isBlocked
            ? "bg-red-100 text-red-600"
            : "bg-emerald-100 text-emerald-600"
            }`}
        >
          {user.isBlocked ? "Blocked" : "Active"}
        </Badge>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (user: any) => (
        <div className="flex justify-end items-center gap-3">
          <Switch
            checked={!user.isBlocked}
            onCheckedChange={() => {
              setSelectedUser(user);
              setConfirmType("block");
              setConfirmOpen(true);
            }}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
          />
          <Button variant="ghost" size="icon" className="hover:bg-muted rounded-lg" asChild>
            <Link to={`/admin/subadmins/edit/${user.id}`}>
              <Edit className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-50 rounded-lg"
            onClick={() => {
              setSelectedUser(user);
              setConfirmType("delete");
              setConfirmOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="SubAdmins"
        subtitle="Manage sub-administrators"
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm mb-6 mt-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search subadmins..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
          <span className="text-sm text-muted-foreground font-medium whitespace-nowrap">
            Total Records: {total}
          </span>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>
          <Link to="/admin/subadmins/add">
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add SubAdmin
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border/60 shadow-md overflow-hidden">

        <DataTable
          columns={columns}
          data={subadmins}
          isLoading={isLoading}
          emptyMessage="No subadmins found"
          page={page}
          totalPages={Math.ceil(total / limit)}
          totalRecords={total}
          onPageChange={setPage}
        />

      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setSelectedUser(null); setConfirmType(null); }}
        onConfirm={handleConfirm}
        loading={deleteMutation.isPending || blockMutation.isPending}
        title={confirmType === "delete" ? "Delete SubAdmin" : selectedUser?.isBlocked ? "Unblock SubAdmin" : "Block SubAdmin"}
        description={confirmType === "delete" ? "This action cannot be undone." : selectedUser?.isBlocked ? "This user will regain access to the platform." : "This user will not be able to login until unblocked."}
        confirmText={confirmType === "delete" ? "Delete" : selectedUser?.isBlocked ? "Unblock" : "Block"}
      />
    </div>
  );
};

export default SubadminsPage;
