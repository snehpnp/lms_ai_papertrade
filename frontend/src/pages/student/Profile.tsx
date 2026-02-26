import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { User, Loader2, Link2 } from "lucide-react";
import { useProfileStore } from "@/store/profileStore";
import { profileService } from "@/services/profile.service";
import { toast } from "sonner";

const StudentProfile = () => {
  const { user } = useAuth();
  const { userProfile, fetchProfile } = useProfileStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    brokerRedirectUrl: "",
  });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        email: userProfile.email || "",
        brokerRedirectUrl: userProfile.brokerRedirectUrl || "",
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await profileService.updateProfile(formData);
      await fetchProfile();
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Profile" subtitle="Manage your profile settings" />

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg text-foreground font-semibold">{userProfile?.name || user?.name}</h3>
              <p className="text-sm text-muted-foreground capitalize font-medium">{userProfile?.role || user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all opacity-80"
                required
                disabled
              />
              <p className="text-[10px] text-muted-foreground italic">Email cannot be changed.</p>
            </div>

            {(userProfile?.role === "ADMIN" || userProfile?.role === "SUBADMIN") && (
              <div className="space-y-1.5 pt-2 border-t border-border mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Broker Redirect URL (Referral)</label>
                </div>
                <input
                  value={formData.brokerRedirectUrl}
                  onChange={(e) => setFormData({ ...formData, brokerRedirectUrl: e.target.value })}
                  placeholder="https://client.angelone.in/referral?..."
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-[10px] text-muted-foreground">
                  Your students will be redirected to this URL when they click "Connect to Broker".
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
