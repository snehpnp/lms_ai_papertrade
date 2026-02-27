import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { adminSettingsService, SystemSetting } from "@/services/settings.service";
import { CreditCard, ShieldCheck, Save, Loader2, Activity, Wifi, WifiOff } from "lucide-react";
import axiosInstance from "@/lib/axios";

const SettingsPage = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Razorpay states
    const [razorpayKeyId, setRazorpayKeyId] = useState("");
    const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

    // Alice Blue states
    const [aliceBlueUserId, setAliceBlueUserId] = useState("");
    const [aliceBlueApiKey, setAliceBlueApiKey] = useState("");
    const [aliceStatus, setAliceStatus] = useState<any>(null);
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchAliceStatus();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const data = await adminSettingsService.getAll();
            setSettings(data);

            // Map to individual states
            setRazorpayKeyId(data.find((s) => s.key === "RAZORPAY_KEY_ID")?.value || "");
            setRazorpayKeySecret(data.find((s) => s.key === "RAZORPAY_KEY_SECRET")?.value || "");
            setAliceBlueUserId(data.find((s) => s.key === "ALICE_BLUE_USER_ID")?.value || "");
            setAliceBlueApiKey(data.find((s) => s.key === "ALICE_BLUE_API_KEY")?.value || "");
        } catch {
            toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const fetchAliceStatus = async () => {
        try {
            const res: any = await axiosInstance.get("/market/status");
            if (res.success) setAliceStatus(res.data);
        } catch {
            // ignore
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await adminSettingsService.updateBulk([
                { key: "RAZORPAY_KEY_ID", value: razorpayKeyId, description: "Razorpay Public Key ID" },
                { key: "RAZORPAY_KEY_SECRET", value: razorpayKeySecret, description: "Razorpay Secret Key" },
                { key: "ALICE_BLUE_USER_ID", value: aliceBlueUserId, description: "Alice Blue User ID" },
                { key: "ALICE_BLUE_API_KEY", value: aliceBlueApiKey, description: "Alice Blue API Key / Access Token" },
            ]);
            toast.success("Settings updated successfully");
            fetchAliceStatus();
        } catch {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        try {
            setConnecting(true);
            const res: any = await axiosInstance.post("/market/connect");
            if (res.success) {
                toast.success("Connected to Alice Blue successfully!");
            } else {
                toast.error("Failed to connect: " + (res.message || "Unknown error"));
            }
            fetchAliceStatus();
        } catch {
            toast.error("Connection test failed");
        } finally {
            setConnecting(false);
        }
    };

    console.log("aliceStatus", aliceStatus)

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
                <p className="text-muted-foreground">Configure payment gateways, market data, and other global options.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6 max-w-2xl">

                {/* ── Razorpay Configuration ── */}
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
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Key ID
                                </label>
                                {settings.find(s => s.key === "RAZORPAY_KEY_ID")?.value && (
                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                                        Configured
                                    </span>
                                )}
                            </div>
                            <Input
                                value={razorpayKeyId}
                                onChange={(e) => setRazorpayKeyId(e.target.value)}
                                placeholder="rzp_test_..."
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Key Secret
                                </label>
                                {settings.find(s => s.key === "RAZORPAY_KEY_SECRET")?.value && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">
                                        Secret Saved
                                    </span>
                                )}
                            </div>
                            <Input
                                type="password"
                                value={razorpayKeySecret}
                                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                placeholder="••••••••••••••••"
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                Note: Key secret is hidden for security.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* ── Alice Blue Configuration ── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-emerald-500" />
                                <CardTitle>Alice Blue — Live Market Data</CardTitle>
                            </div>
                            {aliceStatus && (
                                <div className="flex items-center gap-1.5">
                                    {aliceStatus.connected ? (
                                        <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <Wifi className="w-3 h-3" /> Connected
                                        </span>
                                    ) : (
                                        <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                            <WifiOff className="w-3 h-3" /> Disconnected
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                        <CardDescription>
                            Enter your Alice Blue API credentials for live price streaming in paper trading.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    User ID
                                </label>
                                {settings.find(s => s.key === "ALICE_BLUE_USER_ID")?.value && (
                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                                        Configured
                                    </span>
                                )}
                            </div>
                            <Input
                                value={aliceBlueUserId}
                                onChange={(e) => setAliceBlueUserId(e.target.value)}
                                placeholder="e.g., AB1234"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    API Key / Access Token
                                </label>
                                {settings.find(s => s.key === "ALICE_BLUE_API_KEY")?.value && (
                                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full font-medium">
                                        Key Saved
                                    </span>
                                )}
                            </div>
                            <Input
                                type="password"
                                value={aliceBlueApiKey}
                                onChange={(e) => setAliceBlueApiKey(e.target.value)}
                                placeholder="••••••••••••••••"
                            />
                            <p className="text-[10px] text-muted-foreground italic">
                                Get your API key from Alice Blue dashboard → API section.
                            </p>
                        </div>

                        {/* Status info */}
                        {aliceStatus && (
                            <div className="grid grid-cols-3 gap-3 mt-4 p-3 bg-muted/30 rounded-lg border border-border">
                                <div className="text-center">
                                    <p className="text-lg font-bold text-foreground">{aliceStatus.subscribedChannels || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Channels</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-foreground">{aliceStatus.cachedPrices || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cached</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-foreground">{aliceStatus.activeListeners || 0}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Listeners</p>
                                </div>
                            </div>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleTestConnection}
                            disabled={connecting || !aliceBlueUserId || !aliceBlueApiKey}
                        >
                            {connecting ? (
                                <>
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                <>
                                    <Activity className="mr-2 h-3.5 w-3.5" />
                                    Test Connection
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* ── Save All ── */}
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
