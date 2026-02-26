import { useState, useEffect } from "react";
import { useProfileStore } from "@/store/profileStore";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Users, Gift, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

const ReferPage = () => {
    const { userProfile, fetchProfile } = useProfileStore();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!userProfile?.referralCode) {
            fetchProfile();
        }
    }, [userProfile, fetchProfile]);

    const referralCode = userProfile?.referralCode || "LOADING...";
    const signupUrl = `${window.location.origin}/signup?ref=${referralCode}`;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <PageHeader
                title="Referral Program"
                subtitle="Invite new traders to the platform and build your community."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Referral Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ui-card p-6 flex flex-col items-center text-center space-y-4"
                >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Build Team</h3>
                        <p className="text-xs text-muted-foreground">Every user you refer becomes part of your managed network.</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="ui-card p-6 flex flex-col items-center text-center space-y-4"
                >
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Track Growth</h3>
                        <p className="text-xs text-muted-foreground">Monitor performance and commissions from your referred traders.</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="ui-card p-6 flex flex-col items-center text-center space-y-4"
                >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Share2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Easy Sharing</h3>
                        <p className="text-xs text-muted-foreground">Quickly share your unique link via any social platform or email.</p>
                    </div>
                </motion.div>
            </div>

            <div className="ui-card p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-2xl font-bold mb-2">Your Referral Link</h2>
                    <p className="text-muted-foreground mb-8">
                        Share this link with potential students or traders. When they sign up using this link, they will be automatically assigned to you.
                    </p>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Unique Referral URL</label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={signupUrl}
                                    className="bg-muted/50 border-input font-mono text-sm"
                                />
                                <Button
                                    onClick={() => copyToClipboard(signupUrl)}
                                    className="shrink-0"
                                    variant={copied ? "outline" : "default"}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Referral Code Only</label>
                            <div className="flex gap-2 max-w-xs">
                                <Input
                                    readOnly
                                    value={referralCode}
                                    className="bg-muted/50 border-input font-bold tracking-widest text-center"
                                />
                                <Button
                                    onClick={() => copyToClipboard(referralCode)}
                                    variant="outline"
                                    className="shrink-0"
                                >
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-primary text-primary-foreground shrink-0 mt-0.5">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-foreground">How it works</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                When a user registers using your link, the <strong>Referral Code</strong> field will be auto-filled.
                                This links their account to yours for tracking, analytics, and permissions management.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferPage;
