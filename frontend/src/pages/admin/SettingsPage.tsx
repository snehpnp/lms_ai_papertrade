import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { adminSettingsService, SystemSetting } from "@/services/settings.service";
import { CreditCard, ShieldCheck, Save, Loader2, Activity, Wifi, WifiOff, Globe, ExternalLink, Info, Mail, Send, Lock, Server, Palette, Upload, ImagePlus, X, Trash2 } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { uploadToCloudinary } from "@/utils/cloudinary";

const SettingsPage = () => {
    const [settings, setSettings] = useState<SystemSetting[]>([]);
    const [loading, setLoading] = useState(true);

    // Razorpay states
    const [razorpayKeyId, setRazorpayKeyId] = useState("");
    const [razorpayKeySecret, setRazorpayKeySecret] = useState("");

    // Alice Blue states
    const [aliceBlueUserId, setAliceBlueUserId] = useState("");
    const [aliceBlueApiKey, setAliceBlueApiKey] = useState("");
    const [aliceStatus, setAliceStatus] = useState<any>(null);
    const [googleClientId, setGoogleClientId] = useState("");

    // Webmail states
    const [smtpHost, setSmtpHost] = useState("");
    const [smtpPort, setSmtpPort] = useState("");
    const [smtpUser, setSmtpUser] = useState("");
    const [smtpPass, setSmtpPass] = useState("");
    const [fromEmail, setFromEmail] = useState("");
    const [fromName, setFromName] = useState("");

    // Branding states
    const [appName, setAppName] = useState("");
    const [appLogo, setAppLogo] = useState("");
    const [appFavicon, setAppFavicon] = useState("");

    // Loading states per section
    const [savingSection, setSavingSection] = useState<string | null>(null);
    const [testingEmail, setTestingEmail] = useState(false);


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
            setGoogleClientId(data.find((s) => s.key === "GOOGLE_CLIENT_ID")?.value || "");

            // Webmail
            setSmtpHost(data.find((s) => s.key === "SMTP_HOST")?.value || "");
            setSmtpPort(data.find((s) => s.key === "SMTP_PORT")?.value || "");
            setSmtpUser(data.find((s) => s.key === "SMTP_USER")?.value || "");
            setSmtpPass(data.find((s) => s.key === "SMTP_PASS")?.value || "");
            setFromEmail(data.find((s) => s.key === "FROM_EMAIL")?.value || "");
            setFromName(data.find((s) => s.key === "FROM_NAME")?.value || "");

            // Branding
            setAppName(data.find((s) => s.key === "APP_NAME")?.value || "");
            setAppLogo(data.find((s) => s.key === "APP_LOGO")?.value || "");
            setAppFavicon(data.find((s) => s.key === "APP_FAVICON")?.value || "");
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

    const saveSection = async (section: string, payload: any[]) => {
        try {
            setSavingSection(section);
            await adminSettingsService.updateBulk(payload);
            toast.success(`${section} settings updated`);
            if (section === "Alice Blue") fetchAliceStatus();
        } catch {
            toast.error(`Failed to update ${section} settings`);
        } finally {
            setSavingSection(null);
        }
    };

    const handleSaveRazorpay = () => saveSection("Razorpay", [
        { key: "RAZORPAY_KEY_ID", value: razorpayKeyId, description: "Razorpay Public Key ID" },
        { key: "RAZORPAY_KEY_SECRET", value: razorpayKeySecret, description: "Razorpay Secret Key" },
    ]);

    const handleSaveAliceBlue = () => saveSection("Alice Blue", [
        { key: "ALICE_BLUE_USER_ID", value: aliceBlueUserId, description: "Alice Blue User ID" },
        { key: "ALICE_BLUE_API_KEY", value: aliceBlueApiKey, description: "Alice Blue API Key / Access Token" },
    ]);

    const handleSaveGoogle = () => saveSection("Google Auth", [
        { key: "GOOGLE_CLIENT_ID", value: googleClientId, description: "Google Client ID for OAuth login" },
    ]);

    const handleSaveWebmail = () => saveSection("Webmail", [
        { key: "SMTP_HOST", value: smtpHost, description: "SMTP Server Host" },
        { key: "SMTP_PORT", value: smtpPort, description: "SMTP Server Port" },
        { key: "SMTP_USER", value: smtpUser, description: "SMTP Username" },
        { key: "SMTP_PASS", value: smtpPass, description: "SMTP Password" },
        { key: "FROM_EMAIL", value: fromEmail, description: "Email Sender Address" },
        { key: "FROM_NAME", value: fromName, description: "Email Sender Name" },
    ]);

    const handleSaveBranding = () => saveSection("Branding", [
        { key: "APP_NAME", value: appName, description: "Application Name" },
        { key: "APP_LOGO", value: appLogo, description: "Application Logo URL" },
        { key: "APP_FAVICON", value: appFavicon, description: "Application Favicon URL" },
    ]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setSavingSection(type === 'logo' ? 'uploading_logo' : 'uploading_favicon');
            const url = await uploadToCloudinary(file);
            if (type === 'logo') setAppLogo(url);
            else setAppFavicon(url);
            toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setSavingSection(null);
            e.target.value = "";
        }
    };

    const handleTestEmail = async () => {
        try {
            setTestingEmail(true);
            await axiosInstance.post("/settings/test-email", { to: fromEmail });
            toast.success("Test email sent to " + fromEmail);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send test email");
        } finally {
            setTestingEmail(false);
        }
    };

    const handleTestConnection = async () => {
        try {
            setSavingSection("AliceBlueTest");
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
            setSavingSection(null);
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
                <p className="text-muted-foreground">Configure payment gateways, market data, and other global options.</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

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
                    <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSaveRazorpay}
                            disabled={savingSection === "Razorpay"}
                        >
                            {savingSection === "Razorpay" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Razorpay
                        </Button>
                    </div>
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
                            disabled={savingSection === "AliceBlueTest" || !aliceBlueUserId || !aliceBlueApiKey}
                        >
                            {savingSection === "AliceBlueTest" ? (
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

                {/* ── Google OAuth Configuration ── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-blue-500" />
                            <CardTitle>Google Auth Configuration</CardTitle>
                        </div>
                        <CardDescription>
                            Enable Google login for your users by entering the Client ID.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Google Client ID
                                </label>
                                {settings.find(s => s.key === "GOOGLE_CLIENT_ID")?.value && (
                                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-medium">
                                        Configured
                                    </span>
                                )}
                            </div>
                            <Input
                                value={googleClientId}
                                onChange={(e) => setGoogleClientId(e.target.value)}
                                placeholder="xxxx-xxxx.apps.googleusercontent.com"
                            />
                        </div>

                        {/* ── Guide Section ── */}
                        <div className="mt-6 p-4 bg-muted/20 border border-border rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-sm font-bold text-primary">
                                <Info className="w-4 h-4" />
                                How to get Google Client ID?
                            </div>

                            <div className="space-y-3 text-[11px] leading-relaxed text-muted-foreground">
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-full font-bold">1</span>
                                    <p>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-primary hover:underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5" /></a> and create a new project.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-full font-bold">2</span>
                                    <p>Navigate to <b>APIs & Services &gt; OAuth consent screen</b>. Select "External" and fill in basic app details.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-full font-bold">3</span>
                                    <p>Go to <b>Credentials &gt; Create Credentials &gt; OAuth client ID</b>.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-full font-bold">4</span>
                                    <p>Select **Web Application** and add your website URL in **Authorised JavaScript Origins** (e.g., `http://localhost:5173` for testing).</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center rounded-full font-bold">5</span>
                                    <p>Copy the **Client ID** generated and paste it above.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSaveGoogle}
                            disabled={savingSection === "Google Auth"}
                        >
                            {savingSection === "Google Auth" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Google Auth
                        </Button>
                    </div>
                </Card>

                {/* ── Webmail Configuration ── */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Mail className="w-5 h-5 text-amber-500" />
                            <CardTitle>Webmail (SMTP) Setup</CardTitle>
                        </div>
                        <CardDescription>
                            Configure your SMTP credentials to send transactional and recovery emails.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Server className="w-3 h-3" /> SMTP Host
                                </label>
                                <Input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    Port
                                </label>
                                <Input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="465 or 587" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    SMTP User
                                </label>
                                <Input value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="your-email@google.com" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Lock className="w-3 h-3" /> App Password
                                </label>
                                <Input type="password" value={smtpPass} onChange={e => setSmtpPass(e.target.value)} placeholder="••••••••••••••••" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From Email</label>
                                <Input value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="noreply@domain.com" />
                            </div>
                            <div className="space-y-2 col-span-2 md:col-span-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">From Name</label>
                                <Input value={fromName} onChange={e => setFromName(e.target.value)} placeholder="TradeAlgo Support" />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-[10px] font-black uppercase tracking-tighter h-8"
                                onClick={handleTestEmail}
                                disabled={testingEmail || !smtpHost || !fromEmail}
                            >
                                {testingEmail ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Send className="w-3 h-3 mr-2" />}
                                Send Test Email
                            </Button>
                        </div>
                    </CardContent>
                    <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSaveWebmail}
                            disabled={savingSection === "Webmail"}
                        >
                            {savingSection === "Webmail" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Webmail
                        </Button>
                    </div>
                </Card>

                {/* ── White-Label Branding ── */}
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-500" />
                            <CardTitle>White-Label Branding</CardTitle>
                        </div>
                        <CardDescription>
                            Customize your application's appearance. These assets will appear across the platform and in emails.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* App Name */}
                            <div className="space-y-4 md:col-span-1">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                        Application Name
                                    </label>
                                    <Input
                                        value={appName}
                                        onChange={e => setAppName(e.target.value)}
                                        placeholder="e.g. TradeAlgo"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">
                                        Used in emails, page titles, and UI.
                                    </p>
                                </div>
                            </div>

                            {/* Logo Upload */}
                            <div className="space-y-4">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Main Logo
                                </label>
                                <div
                                    className="relative w-full h-32 rounded-xl bg-muted/30 border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                                    onClick={() => document.getElementById('logo-upload')?.click()}
                                >
                                    {appLogo ? (
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <img src={appLogo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                            <ImagePlus className="w-8 h-8" />
                                            <span className="text-[10px] font-bold uppercase">Upload Logo</span>
                                        </div>
                                    )}
                                    {savingSection === 'uploading_logo' && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'logo')} />
                                <p className="text-[10px] text-muted-foreground text-center">Transparent PNG recommended. Height: 60px</p>
                            </div>

                            {/* Favicon Upload */}
                            <div className="space-y-4">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    Favicon / Square Icon
                                </label>
                                <div
                                    className="relative w-full h-32 rounded-xl bg-muted/30 border-2 border-dashed border-border hover:border-primary transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
                                    onClick={() => document.getElementById('favicon-upload')?.click()}
                                >
                                    {appFavicon ? (
                                        <div className="relative w-full h-full flex items-center justify-center p-4">
                                            <img src={appFavicon} alt="Favicon Preview" className="w-12 h-12 object-contain" />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                                            <ImagePlus className="w-8 h-8" />
                                            <span className="text-[10px] font-bold uppercase">Upload Favicon</span>
                                        </div>
                                    )}
                                    {savingSection === 'uploading_favicon' && (
                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                                <input type="file" id="favicon-upload" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'favicon')} />
                                <p className="text-[10px] text-muted-foreground text-center">Square 64x64px or 128x128px recommended.</p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
                        <Button
                            size="sm"
                            onClick={handleSaveBranding}
                            disabled={savingSection === "Branding" || savingSection?.startsWith('uploading')}
                        >
                            {savingSection === "Branding" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Update Branding
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
