import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/common/PageHeader";
import DataTable from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminUsersService } from "@/services/admin.users.service";
import { toast } from "sonner";
import ConfirmDialog from "@/components/common/ConfirmDialog";

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmType, setConfirmType] = useState<"delete" | "block" | null>(
    null
  );
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const queryClient = useQueryClient();

  // Fetch Users
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, limit, search],
    queryFn: () =>
      adminUsersService.getAll({
        page,
        limit,
        search,
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
      className: "w-16 text-center",
      render: (_: any, index: number) => (
        <span className="font-medium text-sm">
          {(page - 1) * limit + index + 1}
        </span>
      ),
    },
    {
      header: "Name",
      accessor: "name",
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
      header: "Status",
      render: (user: any) => (
        <Badge
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            user.isBlocked
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
          {/* Toggle */}
          <Switch
            checked={!user.isBlocked}
            onCheckedChange={() => {
              setSelectedUser(user);
              setConfirmType("block");
              setConfirmOpen(true);
            }}
            className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-red-500"
          />

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-muted rounded-lg"
            asChild
          >
            <Link to={`/admin/users/edit/${user.id}`}>
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
        action={
          <Button asChild>
            <Link to="/admin/users/add">
              <Plus className="w-4 h-4 mr-2" /> Add User
            </Link>
          </Button>
        }
      />

      <div className="bg-background rounded-2xl border border-border/60 shadow-md overflow-hidden">
        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={users}
          isLoading={isLoading}
          emptyMessage="No users found"
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
    </div>
  );
};

export default UsersPage;