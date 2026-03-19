import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Bug,
  CheckCircle2,
  Inbox,
  Lightbulb,
  MessageSquare,
  Send,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";

const CATEGORIES = [
  { value: "bug", label: "Bug Report", icon: Bug, color: "text-red-400" },
  {
    value: "feature",
    label: "Feature Request",
    icon: Lightbulb,
    color: "text-amber-400",
  },
  {
    value: "general",
    label: "General Feedback",
    icon: MessageSquare,
    color: "text-sky-400",
  },
];

interface FeedbackMessage {
  id: string;
  authorRole: string;
  category: string;
  message: string;
  timestamp: number;
}

const STORAGE_KEY = "cricmanage_feedback";

function loadFeedback(): FeedbackMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFeedback(items: FeedbackMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CATEGORY_BADGE: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  bug: {
    label: "Bug Report",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
    icon: Bug,
  },
  feature: {
    label: "Feature Request",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    icon: Lightbulb,
  },
  general: {
    label: "General Feedback",
    className: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    icon: MessageSquare,
  },
};

const ROLE_BADGE_COLORS: Record<string, string> = {
  organiser: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  franchisee: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  viewer: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  player: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  umpire: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  scorer: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

function formatTs(ts: number): string {
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Suggestions() {
  const { userRole } = useAppContext();
  const isOrganiser = userRole === "organiser";

  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackList, setFeedbackList] = useState<FeedbackMessage[]>(() =>
    loadFeedback(),
  );

  useEffect(() => {
    if (isOrganiser) {
      setFeedbackList(loadFeedback());
    }
  }, [isOrganiser]);

  function handleSubmit() {
    if (!category || !message.trim()) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const newItem: FeedbackMessage = {
        id: `fb_${Date.now()}`,
        authorRole: userRole ?? "guest",
        category,
        message: message.trim(),
        timestamp: Date.now(),
      };
      const updated = [newItem, ...loadFeedback()];
      saveFeedback(updated);
      setFeedbackList(updated);
      setIsSubmitting(false);
      setSubmitted(true);
      toast.success("Feedback submitted!");
    }, 800);
  }

  function handleNewSuggestion() {
    setSubmitted(false);
    setCategory("");
    setMessage("");
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-4"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.55 0.18 152), oklch(0.45 0.16 170))",
          }}
        >
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Suggestions &amp; Feedback
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Help us improve CricManage Pro — your voice shapes the product.
          </p>
        </div>
      </motion.div>

      {isOrganiser ? (
        <Tabs defaultValue="submit" data-ocid="suggestions.tab">
          <TabsList className="grid grid-cols-2 bg-secondary/40 border border-cricket-border rounded-lg">
            <TabsTrigger
              value="submit"
              className="data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
              data-ocid="suggestions.submit.tab"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Submit Feedback
            </TabsTrigger>
            <TabsTrigger
              value="inbox"
              className="data-[state=active]:bg-cricket-green/20 data-[state=active]:text-cricket-green"
              data-ocid="suggestions.inbox.tab"
            >
              <Inbox className="w-3.5 h-3.5 mr-1.5" />
              Feedback Inbox
              {feedbackList.length > 0 && (
                <span className="ml-1.5 bg-cricket-green text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {feedbackList.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="submit">
            <SubmitForm
              category={category}
              setCategory={setCategory}
              message={message}
              setMessage={setMessage}
              submitted={submitted}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onReset={handleNewSuggestion}
            />
          </TabsContent>
          <TabsContent value="inbox">
            <FeedbackInbox feedbackList={feedbackList} />
          </TabsContent>
        </Tabs>
      ) : (
        <SubmitForm
          category={category}
          setCategory={setCategory}
          message={message}
          setMessage={setMessage}
          submitted={submitted}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onReset={handleNewSuggestion}
        />
      )}
    </div>
  );
}

function SubmitForm({
  category,
  setCategory,
  message,
  setMessage,
  submitted,
  isSubmitting,
  onSubmit,
  onReset,
}: {
  category: string;
  setCategory: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  submitted: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onReset: () => void;
}) {
  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="mt-4"
          data-ocid="suggestions.success_state"
        >
          <Card
            className="border-cricket-green/30"
            style={{ background: "oklch(0.22 0.06 230)" }}
          >
            <CardContent className="pt-10 pb-10 text-center space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 152), oklch(0.45 0.16 170))",
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Feedback Submitted!
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Thank you for helping us improve CricManage Pro. The development
                team will review your feedback shortly.
              </p>
              <Button
                onClick={onReset}
                className="bg-cricket-green hover:bg-cricket-green/90 text-white mt-2"
                data-ocid="suggestions.new.button"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Another
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mt-4"
        >
          <Card
            className="border-cricket-border"
            style={{ background: "oklch(0.22 0.06 230)" }}
            data-ocid="suggestions.form.panel"
          >
            <CardHeader>
              <CardTitle className="text-foreground text-base">
                Send Feedback to Developers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Category Selector */}
              <div className="space-y-2">
                <Label className="text-foreground text-sm">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger
                    className="bg-secondary border-cricket-border text-foreground"
                    data-ocid="suggestions.category.select"
                  >
                    <SelectValue placeholder="Select a category..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-cricket-border">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <c.icon className={`w-3.5 h-3.5 ${c.color}`} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category quick pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      category === c.value
                        ? "bg-cricket-green/20 text-cricket-green border-cricket-green/40"
                        : "bg-secondary/60 text-muted-foreground border-cricket-border hover:border-cricket-green/30"
                    }`}
                  >
                    <c.icon className="w-3 h-3" />
                    {c.label}
                  </button>
                ))}
              </div>

              <Separator className="bg-cricket-border" />

              {/* Message */}
              <div className="space-y-2">
                <Label className="text-foreground text-sm">
                  Your Message
                  <span className="text-muted-foreground ml-1 font-normal">
                    ({message.length}/500)
                  </span>
                </Label>
                <Textarea
                  placeholder="Describe the bug, request a feature, or share your thoughts..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                  rows={5}
                  className="bg-secondary border-cricket-border text-foreground resize-none"
                  data-ocid="suggestions.message.textarea"
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  onClick={onSubmit}
                  disabled={isSubmitting || !category || !message.trim()}
                  className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                  data-ocid="suggestions.submit.button"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Submit Feedback
                    </span>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function FeedbackInbox({ feedbackList }: { feedbackList: FeedbackMessage[] }) {
  if (feedbackList.length === 0) {
    return (
      <div
        className="rounded-xl border border-cricket-border p-12 text-center mt-4"
        style={{ background: "oklch(0.22 0.06 230)" }}
        data-ocid="suggestions.inbox.empty_state"
      >
        <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Feedback Yet
        </h3>
        <p className="text-sm text-muted-foreground">
          No feedback messages have been submitted yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3" data-ocid="suggestions.inbox.list">
      {feedbackList.map((item, i) => {
        const catInfo = CATEGORY_BADGE[item.category] ?? CATEGORY_BADGE.general;
        const CatIcon = catInfo.icon;
        const roleColor =
          ROLE_BADGE_COLORS[item.authorRole] ?? ROLE_BADGE_COLORS.viewer;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            data-ocid={`suggestions.inbox.item.${i + 1}`}
          >
            <Card
              className="border-cricket-border hover:border-cricket-green/30 transition-colors"
              style={{ background: "oklch(0.22 0.06 230)" }}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      className={`text-xs border ${catInfo.className}`}
                      variant="outline"
                    >
                      <CatIcon className="w-3 h-3 mr-1" />
                      {catInfo.label}
                    </Badge>
                    <Badge
                      className={`text-xs border capitalize ${roleColor}`}
                      variant="outline"
                    >
                      {item.authorRole}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground flex-shrink-0">
                    {formatTs(item.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {item.message}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
