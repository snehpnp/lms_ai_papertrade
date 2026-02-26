import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfileStore } from "@/store/profileStore";
import axiosInstance from "@/lib/axios";
import { getAccessToken } from "@/lib/token";

export function useUserStream() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { fetchProfile, userProfile } = useProfileStore();

    useEffect(() => {
        if (!user) return;

        const baseUrl = axiosInstance.defaults.baseURL || "";
        const authToken = getAccessToken() || "";
        const controller = new AbortController();

        const connectSSE = async () => {
            try {
                const response = await fetch(`${baseUrl}/my/stream`, {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        Accept: "text/event-stream",
                    },
                    signal: controller.signal,
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);

                const reader = response.body?.getReader();
                if (!reader) throw new Error("No readable stream");

                const decoder = new TextDecoder();
                let buffer = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || "";

                    for (const line of lines) {
                        if (line.startsWith("data: ")) {
                            try {
                                const data = JSON.parse(line.slice(6));

                                if (data.type === "user_blocked") {
                                    toast.error("Your account has been blocked by the admin.");
                                    logout();
                                    navigate("/login");
                                    return; // Stop processing
                                }

                                if (data.type === "user_updated") {
                                    const updatedUser = data.user;
                                    await fetchProfile(); // re-sync profile store
                                    toast.info("Your permissions have been updated by an admin.");

                                    // If we are on user dashboard and learning mode is disabled, redirect
                                    const uiMode = useProfileStore.getState().userProfile?.isLearningMode;

                                    // Logic to push user out if they are currently inside a revoked permission
                                    const isLearningDisabledNow = !updatedUser.isLearningMode;
                                    const isPaperTradeDisabledNow = !updatedUser.isPaperTradeDefault;

                                    if (uiMode && isLearningDisabledNow) {
                                        await useProfileStore.getState().toggleMode();
                                        navigate("/user/paper-trade/dashboard");
                                        toast.warning("Learning mode access was removed. Switched to Paper Trading.");
                                    } else if (!uiMode && isPaperTradeDisabledNow) {
                                        await useProfileStore.getState().toggleMode();
                                        navigate("/user/dashboard");
                                        toast.warning("Paper trading access was removed. Switched to Learning Mode.");
                                    }
                                }
                            } catch {
                                // Ignore parse errors
                            }
                        }
                    }
                }
            } catch (err: any) {
                // Silently fail, it will reconnect on next mount or just die
            }
        };

        connectSSE();

        return () => {
            controller.abort();
        };
    }, [user, logout, navigate, fetchProfile]);
}
