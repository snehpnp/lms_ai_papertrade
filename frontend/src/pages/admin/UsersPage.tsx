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
  Eye,
} from "lucide-react";
import { adminUsersService, AdminUser } from "@/services/admin.users.service";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import UserDetailModal from "@/components/admin/UserDetailModal";
import { useAuth } from "@/contexts/AuthContext";

const UsersPage = () => {
  const { user } = useAuth();
  const basePath = `/${user?.role}`;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "block" | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);

  const queryClient = useQueryClient();

  // Fetch Users
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, limit, search, statusFilter],
    queryFn: () =>
      adminUsersService.getAll({
        page,
        limit,
        search,
        status: statusFilter,
      }),
  });

  const users = data?.items || [];
  const total = data?.total || 0;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminUsersService.delete(id),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Block / Unblock Mutation
  const blockMutation = useMutation({
    mutationFn: ({ id, blocked }: { id: string; blocked: boolean }) =>
      blocked ? adminUsersService.unblock(id) : adminUsersService.block(id),
    onSuccess: (_, variables) => {
      toast.success(variables.blocked ? "User unblocked" : "User blocked");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
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
        {
          id: selectedUser.id,
          blocked: selectedUser.isBlocked,
        },
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

  // Table Columns
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
      render: (user: AdminUser) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 border border-border/40">
            <AvatarImage src={user.avatar || ""} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-black uppercase transition-colors group-hover:bg-primary/20">
              {user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0">
            <span className="font-bold text-foreground line-clamp-1 leading-tight">{user.name}</span>
            <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-tighter">ID: {user.id.slice(0, 8)}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Phone",
      accessor: "phoneNumber",
    },
    {
      header: "Referrer",
      accessor: "referrerName",
    },
    // {
    //   header: "Paper Trade",
    //   className: "text-center",
    //   render: (user: any) => (
    //     <Badge
    //       className={`px-3 py-1 rounded-full text-xs font-medium ${user.isPaperTradeDefault
    //         ? "bg-emerald-100 text-emerald-600"
    //         : "bg-zinc-100 text-zinc-500"
    //         }`}
    //     >
    //       {user.isPaperTradeDefault ? "ON" : "OFF"}
    //     </Badge>
    //   ),
    // },
    {
      header: "Learning",
      className: "text-center",
      render: (user: any) => (
        <Badge
          className={`px-3 py-1 rounded-full text-xs font-medium ${user.isLearningMode
            ? "bg-blue-100 text-blue-600"
            : "bg-zinc-100 text-zinc-500"
            }`}
        >
          {user.isLearningMode ? "Paper Trade" : "Learning"}
        </Badge>
      ),
    },
    {
      header: "Status",
      render: (user: any) => (
        // <Badge
        //   className={`px-3 py-1 rounded-full text-xs font-medium ${user.isBlocked
        //     ? "bg-red-100 text-red-600"
        //     : "bg-emerald-100 text-emerald-600"
        //     }`}
        // >
        //   {user.isBlocked ? "Blocked" : "Active"}
        // </Badge>
        < Switch
          checked={!user.isBlocked
          }
          onCheckedChange={() => {
            setSelectedUser(user);
            setConfirmType("block");
            setConfirmOpen(true);
          }}
          className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
        />
      ),
    },
    {
      header: "Actions",
      render: (user: any) => (
        <div className="flex gap-3">


          {/* View */}
          <Button
            variant="ghost"
            size="icon"
            className="text-blue-500 hover:bg-blue-50 rounded-lg"
            onClick={() => {
              setViewingUser(user);
              setDetailOpen(true);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted rounded-lg"
            asChild
          >
            <Link to={`${basePath}/users/edit/${user.id}`}>
              <Edit className="w-4 h-4" />
            </Link>
          </Button>

          {/* Delete */}
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
        title="Users"
        subtitle="Manage all platform users"
      />

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-3 rounded-xl border border-border shadow-sm mb-6 mt-6">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
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
          <Link to={`${basePath}/users/add`}>
            <Button>
              <Plus className="w-4 h-4 mr-1" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-background rounded-2xl border border-border/60 shadow-md overflow-hidden">

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found"
          page={page}
          totalPages={Math.ceil(total / limit)}
          totalRecords={total}
          onPageChange={setPage}
        />

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm">
          <span>
            Showing {(page - 1) * limit + 1} -{" "}
            {Math.min(page * limit, total)} of {total}
          </span>

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="sm">
              {page}
            </Button>

            <Button
              variant="outline"
              size="icon"
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setSelectedUser(null);
          setConfirmType(null);
        }}
        onConfirm={handleConfirm}
        loading={deleteMutation.isPending || blockMutation.isPending}
        title={
          confirmType === "delete"
            ? "Delete User"
            : selectedUser?.isBlocked
              ? "Unblock User"
              : "Block User"
        }
        description={
          confirmType === "delete"
            ? "This action cannot be undone. This will permanently delete the user."
            : selectedUser?.isBlocked
              ? "This user will regain access to the platform."
              : "This user will not be able to login until unblocked."
        }
        confirmText={
          confirmType === "delete"
            ? "Delete"
            : selectedUser?.isBlocked
              ? "Unblock"
              : "Block"
        }
      />

      <UserDetailModal
        user={viewingUser}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setViewingUser(null);
        }}
      />
    </div>
  );
};

export default UsersPage;