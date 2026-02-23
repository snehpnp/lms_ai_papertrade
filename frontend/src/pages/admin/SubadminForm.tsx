import { useParams, useNavigate, Link } from "react-router-dom";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const SubadminForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isEdit ? "SubAdmin updated" : "SubAdmin created");
    navigate("/admin/subadmins");
  };

  return (
    <div className="animate-fade-in">
      <Link to="/admin/subadmins" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to SubAdmins
      </Link>

      <PageHeader title={isEdit ? "Edit SubAdmin" : "Add SubAdmin"} subtitle={isEdit ? "Update sub-administrator details" : "Create a new sub-administrator"} />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <Input placeholder="Robert Taylor" defaultValue={isEdit ? "Robert Taylor" : ""} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <Input type="email" placeholder="robert@lms.com" defaultValue={isEdit ? "robert@lms.com" : ""} />
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
            <Button type="submit">{isEdit ? "Update SubAdmin" : "Create SubAdmin"}</Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/subadmins")}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubadminForm;
