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
        <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 md:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            </div>
            <div>
              <h3 className="text-base md:text-lg text-foreground font-bold">{userProfile?.name || user?.name}</h3>
              <p className="text-[11px] md:text-sm text-muted-foreground uppercase font-black tracking-tighter">{userProfile?.role || user?.role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</label>
              <input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/30 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all opacity-80 font-medium cursor-not-allowed"
                required
                disabled
              />
              <p className="text-[10px] text-muted-foreground italic font-medium mt-1">Email cannot be changed.</p>
            </div>

            {(userProfile?.role === "ADMIN" || userProfile?.role === "SUBADMIN") && (
              <div className="space-y-1.5 pt-4 border-t border-border mt-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className="w-3.5 h-3.5 text-primary" />
                  <label className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground">Broker Redirect URL (Referral)</label>
                </div>
                <input
                  value={formData.brokerRedirectUrl}
                  onChange={(e) => setFormData({ ...formData, brokerRedirectUrl: e.target.value })}
                  placeholder="https://client.angelone.in/referral?..."
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                />
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                  Your students will be redirected to this URL when they click "Connect to Broker".
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/20"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            SAVE CHANGES
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentProfile;
