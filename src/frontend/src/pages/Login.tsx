import { Button } from "@/components/ui/button";
import { Loader2, LogIn, Shield, Trophy, Users } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../context/AppContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Login() {
  const { login, loginStatus, isLoginError } = useInternetIdentity();
  const { setCurrentPage } = useAppContext();
  const isLoggingIn = loginStatus === "logging-in";

  async function handleLogin() {
    await login();
    setCurrentPage("dashboard");
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-2xl border border-cricket-border p-8 shadow-card"
          style={{ background: "oklch(0.22 0.06 230)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.70 0.18 152), oklch(0.55 0.16 170))",
              }}
            >
              🏏
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              CricManage Pro
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tournament Management Platform
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {[
              { icon: Trophy, text: "Manage multiple tournaments" },
              { icon: Users, text: "Team & player management" },
              {
                icon: Shield,
                text: "Secure admin access via Internet Identity",
              },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Icon className="w-4 h-4 text-cricket-green flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Login Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            data-ocid="login.submit_button"
            className="w-full bg-cricket-green hover:bg-cricket-green/90 text-white font-semibold py-6 rounded-xl text-base"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="mr-2 w-5 h-5" />
                Login with Internet Identity
              </>
            )}
          </Button>

          {isLoginError && (
            <p
              className="text-destructive text-sm text-center mt-3"
              data-ocid="login.error_state"
            >
              Login failed. Please try again.
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center mt-4">
            Admins can manage tournaments, teams, and players after login.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
