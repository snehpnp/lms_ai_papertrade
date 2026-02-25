import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "lucide-react";

const StudentProfile = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      <PageHeader title="Profile" subtitle="Manage your profile settings" />

      <div className="max-w-2xl">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-foreground mb-1.5">Full Name</label>
              <input
                defaultValue={user?.name}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm text-foreground mb-1.5">Email</label>
              <input
                defaultValue={user?.email}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
