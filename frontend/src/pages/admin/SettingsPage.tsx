import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { adminSettingsService, SystemSetting } from "@/services/settings.service";
import { CreditCard, ShieldCheck, Save, Loader2 } from "lucide-react";

const SettingsPage = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states matching keys in SystemSettings
    const [razorpayKeyId, setRazorpayKeyId] = useState("");
    const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await adminSettingsService.getAll();
            setSettings(data);

            // Map to individual states
            setRazorpayKeyId(data.find((s) => s.key === "RAZORPAY_KEY_ID")?.value || "");
            setRazorpayKeySecret(data.find((s) => s.key === "RAZORPAY_KEY_SECRET")?.value || "");
        } catch {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminSettingsService.updateBulk([
                { key: "RAZORPAY_KEY_ID", value: razorpayKeyId, description: "Razorpay Public Key ID" },
                { key: "RAZORPAY_KEY_SECRET", value: razorpayKeySecret, description: "Razorpay Secret Key" },
            ]);
            toast.success("Settings updated successfully");
        } catch {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold">System Settings</h1>
                <p className="text-muted-foreground">Configure payment gateways and other global options.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-primary" />
                            <CardTitle>Razorpay Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Enter your Razorpay API keys to enable course purchases.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Key ID
                            </label>
                            <Input
                                value={razorpayKeyId}
                                onChange={(e) => setRazorpayKeyId(e.target.value)}
                                placeholder="rzp_test_..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Key Secret
                            </label>
                            <Input
                                type="password"
                                value={razorpayKeySecret}
                                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                placeholder="••••••••••••••••"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={saving}>
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save All Settings
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Keys are encrypted and stored securely.
                    </p>
                </div>
            </form>
        </div>
    );
};

export default SettingsPage;
