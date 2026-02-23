import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? "User updated successfully" : "User created successfully");
    navigate("/admin/users");
  };

  return (
    <div className="animate-fade-in">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Users
      </Link>

      <PageHeader title={isEdit ? "Edit User" : "Add User"} subtitle={isEdit ? "Update user details" : "Create a new platform user"} />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <Input placeholder="John Doe" defaultValue={isEdit ? "John Doe" : ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <Input type="email" placeholder="john@example.com" defaultValue={isEdit ? "john@example.com" : ""} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
              <Input placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <Input type="password" placeholder="Set initial password" />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit">{isEdit ? "Update User" : "Create User"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/users")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
