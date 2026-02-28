import { useState, useRef } from "react";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { User, Camera, Lock } from "lucide-react";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/utils/cloudinary";
import axiosInstance from "@/lib/axios";
import { useProfileStore } from "@/store/profileStore";
import { useEffect } from "react";

const SharedProfile = () => {
  const { user } = useAuth();
  const { userProfile, updateProfileState, fetchProfile } = useProfileStore();

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.name || "",
    email: userProfile?.email || user?.email || "",
    avatar: userProfile?.avatar || user?.avatar || "",
    brokerRedirectUrl: userProfile?.brokerRedirectUrl || "",
    referralSignupBonusAmount: userProfile?.referralSignupBonusAmount || 0,
  });

  // Ensure formData updates if userProfile initializes slowly
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || user?.name || "",
        email: userProfile.email || user?.email || "",
        avatar: userProfile.avatar || user?.avatar || "",
        brokerRedirectUrl: userProfile.brokerRedirectUrl || "",
        referralSignupBonusAmount: userProfile.referralSignupBonusAmount || 0,
      });
    }
  }, [userProfile, user]);

  const [pwdData, setPwdData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    try {
      toast.info("Uploading avatar...", { id: "avatar-upload" });
      const url = await uploadToCloudinary(file);
      setFormData(prev => ({ ...prev, avatar: url }));
      toast.success("Avatar uploaded, please save changes.", { id: "avatar-upload" });
    } catch (err: any) {
      toast.error(err.message || "Upload failed", { id: "avatar-upload" });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axiosInstance.patch("/my/profile", formData);
      toast.success(data.message || "Profile updated successfully");

      // Update local Zustand store instantly to reflect visually
      updateProfileState({
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        ...((user?.role === "admin" || user?.role === "subadmin") && {
          brokerRedirectUrl: formData.brokerRedirectUrl,
          referralSignupBonusAmount: formData.referralSignupBonusAmount
        })
      });

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdData.newPassword !== pwdData.confirmPassword) {
      return toast.error("New passwords do not match");
    }

    try {
      setPwdLoading(true);
      const { data } = await axiosInstance.patch("/my/profile/password", {
        currentPassword: pwdData.currentPassword,
        newPassword: pwdData.newPassword,
      });
      toast.success(data.message || "Password updated successfully");
      setPwdData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <PageHeader title="My Profile" subtitle="Manage your personal information and security" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">

        {/* Profile Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            General Information
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="text-center sm:text-left pt-2">
                <h4 className="text-lg font-medium">{user?.role?.toUpperCase()}</h4>
                <p className="text-sm text-muted-foreground">Update your photo and personal details.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Full Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  required
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 opacity-70"
                />
              </div>

              {(user?.role === "admin" || user?.role === "subadmin") && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Broker Redirect URL (Referral)</label>
                  <input
                    placeholder="https://client.angelone.in/referral?..."
                    value={formData.brokerRedirectUrl}
                    onChange={(e) => setFormData(p => ({ ...p, brokerRedirectUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Your users will be redirected to this URL when they click "Connect to Broker".
                  </p>
                </div>
              )}
              {(user?.role === "admin" || user?.role === "subadmin") && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Default Paper Trade Amount (For Referrals)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter default amount (e.g. 10000)"
                    value={formData.referralSignupBonusAmount}
                    onChange={(e) => setFormData(p => ({ ...p, referralSignupBonusAmount: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    New users who register via your referral code will get this amount as initial balance.
                  </p>
                </div>
              )}
            </div>

            <button disabled={loading} type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition w-full sm:w-auto">
              {loading ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        </div>

        {/* Security Card */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security & Password
          </h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdData.currentPassword}
                onChange={(e) => setPwdData(p => ({ ...p, currentPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdData.newPassword}
                onChange={(e) => setPwdData(p => ({ ...p, newPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={pwdData.confirmPassword}
                onChange={(e) => setPwdData(p => ({ ...p, confirmPassword: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="pt-2">
              <button disabled={pwdLoading} type="submit" className="px-6 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition w-full sm:w-auto">
                {pwdLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default SharedProfile;
