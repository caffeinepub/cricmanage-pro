import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LogIn, MapPin, MessageCircle, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAppContext } from "../context/AppContext";

type LookingType = "Opponent" | "Team to Join" | "Player";

interface LookingPost {
  id: number;
  type: LookingType;
  title: string;
  description: string;
  postedBy: string;
  initials: string;
  groundType: string;
  dateTime: string;
  postedAgo: string;
  location: string;
  color: string;
}

const DEMO_POSTS: LookingPost[] = [
  {
    id: 1,
    type: "Opponent",
    title: "Mumbai Titans",
    description:
      "Mumbai Titans is looking for an opponent to play a T20 match. Friendly game, serious players preferred.",
    postedBy: "Rajan Mehta",
    initials: "MT",
    groundType: "Turf Ground",
    dateTime: "Sun, 22 Mar 2026 · 08:00 AM",
    postedAgo: "2 hours ago",
    location: "Andheri, Mumbai",
    color: "oklch(0.55 0.18 152)",
  },
  {
    id: 2,
    type: "Player",
    title: "Chennai Kings",
    description:
      "Chennai Kings is looking for a Right-Arm Fast Bowler to join their squad for the upcoming league.",
    postedBy: "Aditya Rajan",
    initials: "CK",
    groundType: "Box Cricket",
    dateTime: "Sat, 21 Mar 2026 · 06:30 PM",
    postedAgo: "5 hours ago",
    location: "T. Nagar, Chennai",
    color: "oklch(0.60 0.19 30)",
  },
  {
    id: 3,
    type: "Team to Join",
    title: "Arjun Kapoor",
    description:
      "Experienced all-rounder looking for a team to join. 800+ runs and 40+ wickets in club cricket. Available weekends.",
    postedBy: "Arjun Kapoor",
    initials: "AK",
    groundType: "Any Ground",
    dateTime: "Sat, 21 Mar 2026 · 10:00 AM",
    postedAgo: "8 hours ago",
    location: "Bandra, Mumbai",
    color: "oklch(0.58 0.20 280)",
  },
  {
    id: 4,
    type: "Opponent",
    title: "Delhi Daredevils CC",
    description:
      "Delhi Daredevils CC is looking for an opponent for a 30-over match. Transport available from metro station.",
    postedBy: "Priya Sharma",
    initials: "DD",
    groundType: "Grass Ground",
    dateTime: "Mon, 23 Mar 2026 · 07:00 AM",
    postedAgo: "1 day ago",
    location: "Dwarka, Delhi",
    color: "oklch(0.55 0.19 250)",
  },
  {
    id: 5,
    type: "Player",
    title: "Hyderabad Hawks",
    description:
      "Hyderabad Hawks requires a specialist wicket-keeper batsman for their franchise team. Playing XI guaranteed.",
    postedBy: "Siddharth Rao",
    initials: "HH",
    groundType: "Turf Ground",
    dateTime: "Fri, 20 Mar 2026 · 05:00 PM",
    postedAgo: "2 days ago",
    location: "Gachibowli, Hyderabad",
    color: "oklch(0.60 0.18 50)",
  },
  {
    id: 6,
    type: "Team to Join",
    title: "Rahul Singh",
    description:
      "Experienced off-spin bowler seeking a competitive team. 5+ years of club cricket experience. Flexible schedule.",
    postedBy: "Rahul Singh",
    initials: "RS",
    groundType: "Any Ground",
    dateTime: "Thu, 19 Mar 2026 · 09:00 AM",
    postedAgo: "3 days ago",
    location: "Koregaon Park, Pune",
    color: "oklch(0.56 0.18 165)",
  },
];

const TYPE_COLORS: Record<LookingType, string> = {
  Opponent: "bg-cricket-green/20 text-cricket-green border-cricket-green/40",
  "Team to Join": "bg-sky-500/20 text-sky-400 border-sky-500/40",
  Player: "bg-amber-500/20 text-amber-400 border-amber-500/40",
};

function LookingCard({ post, index }: { post: LookingPost; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="rounded-xl border border-cricket-border p-4 shadow-card flex flex-col gap-3"
      style={{ background: "oklch(0.22 0.06 230)" }}
      data-ocid={`looking.item.${index + 1}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarFallback
            className="text-white text-sm font-bold"
            style={{ background: post.color }}
          >
            {post.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-foreground text-sm">
              {post.title}
            </span>
            <Badge
              className={`text-[10px] px-2 py-0.5 border ${TYPE_COLORS[post.type]}`}
            >
              {post.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {post.description}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cricket-green inline-block" />
          {post.dateTime}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
          {post.groundType}
        </span>
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-cricket-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{post.postedAgo}</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {post.location}
          </span>
        </div>
        <Button
          size="sm"
          className="h-7 px-3 text-xs bg-cricket-green/15 text-cricket-green border border-cricket-green/30 hover:bg-cricket-green hover:text-white transition-colors"
          variant="outline"
          data-ocid={`looking.contact.button.${index + 1}`}
        >
          <MessageCircle className="w-3 h-3 mr-1" />
          Contact
        </Button>
      </div>
    </motion.div>
  );
}

export default function Looking() {
  const { userRole, setCurrentPage } = useAppContext();
  const [activeFilter, setActiveFilter] = useState<LookingType | "All">("All");
  const [postOpen, setPostOpen] = useState(false);
  const [postType, setPostType] = useState<LookingType>("Opponent");
  const [postDesc, setPostDesc] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postGround, setPostGround] = useState("");
  const [postLocation, setPostLocation] = useState("");

  const canPost = userRole === "organiser" || userRole === "franchisee";

  const filters: Array<"All" | LookingType> = [
    "All",
    "Opponent",
    "Team to Join",
    "Player",
  ];

  const filtered =
    activeFilter === "All"
      ? DEMO_POSTS
      : DEMO_POSTS.filter((p) => p.type === activeFilter);

  function handlePost() {
    if (!postTitle.trim() || !postDesc.trim()) return;
    toast.success("Your post has been submitted!");
    setPostTitle("");
    setPostDesc("");
    setPostGround("");
    setPostLocation("");
    setPostOpen(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Looking Board</h1>
          <p className="text-sm text-muted-foreground">
            Find opponents, join teams, or discover players
          </p>
        </div>
        {!canPost && userRole === null && (
          <Button
            variant="outline"
            size="sm"
            className="border-cricket-border text-muted-foreground"
            onClick={() => setCurrentPage("login")}
            data-ocid="looking.login_to_post.button"
          >
            <LogIn className="w-4 h-4 mr-2" />
            Login to Post
          </Button>
        )}
        {canPost && (
          <Dialog open={postOpen} onOpenChange={setPostOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                data-ocid="looking.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Post
              </Button>
            </DialogTrigger>
            <DialogContent
              className="bg-card border-cricket-border sm:max-w-md"
              data-ocid="looking.dialog"
            >
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  Post a Looking Request
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Looking for</Label>
                  <Select
                    value={postType}
                    onValueChange={(v) => setPostType(v as LookingType)}
                  >
                    <SelectTrigger
                      className="bg-secondary border-cricket-border text-foreground"
                      data-ocid="looking.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-cricket-border">
                      <SelectItem value="Opponent">Opponent</SelectItem>
                      <SelectItem value="Team to Join">Team to Join</SelectItem>
                      <SelectItem value="Player">Player</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Title / Name</Label>
                  <Input
                    placeholder="e.g. Mumbai Titans"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    className="bg-secondary border-cricket-border text-foreground"
                    data-ocid="looking.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Description</Label>
                  <Textarea
                    placeholder="Describe what you're looking for..."
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    className="bg-secondary border-cricket-border text-foreground resize-none"
                    rows={3}
                    data-ocid="looking.textarea"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-foreground">Ground Type</Label>
                    <Input
                      placeholder="e.g. Turf Ground"
                      value={postGround}
                      onChange={(e) => setPostGround(e.target.value)}
                      className="bg-secondary border-cricket-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground">Location</Label>
                    <Input
                      placeholder="e.g. Andheri, Mumbai"
                      value={postLocation}
                      onChange={(e) => setPostLocation(e.target.value)}
                      className="bg-secondary border-cricket-border text-foreground"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setPostOpen(false)}
                  className="border-cricket-border"
                  data-ocid="looking.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePost}
                  disabled={!postTitle.trim() || !postDesc.trim()}
                  className="bg-cricket-green hover:bg-cricket-green/90 text-white"
                  data-ocid="looking.submit_button"
                >
                  Post
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2" data-ocid="looking.filter.tab">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              activeFilter === f
                ? "bg-cricket-green text-white border-cricket-green"
                : "bg-secondary/60 text-muted-foreground border-cricket-border hover:text-foreground"
            }`}
            data-ocid={`looking.${f.toLowerCase().replace(/ /g, "_")}.tab`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((post, i) => (
          <LookingCard key={post.id} post={post} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div
          className="rounded-xl border border-cricket-border p-12 text-center"
          style={{ background: "oklch(0.22 0.06 230)" }}
          data-ocid="looking.empty_state"
        >
          <p className="text-muted-foreground">
            No posts in this category yet.
          </p>
        </div>
      )}
    </div>
  );
}
