import { Mail, Notifications, Pets } from "@mui/icons-material";
import { AppBar, Badge, Box, styled, Toolbar, Typography } from "@mui/material";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { UserContext } from "../UserContext";
import StoreLogo from "../store.png";

const API_BASE = "http://127.0.0.1:8000/yalahntla9aw";

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const Icons = styled(Box)(({ theme }) => ({
  display: "none",
  alignItems: "center",
  gap: "20px",
  [theme.breakpoints.up("sm")]: {
    display: "flex",
  },
}));

const CenterLogo = styled("img")({
  height: 80,
  objectFit: "contain",
});

const Navbar = ({ setActiveComponent }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { accessToken, user } = useContext(UserContext);

  // ── Notification count: only count UNREAD notifications + pending membership requests ──
  const fetchNotificationCount = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    try {
      let total = 0;

      // Count unread system notifications for this user
      const notifRes = await fetch(`${API_BASE}/notifications/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (notifRes.ok) {
        const data = await notifRes.json();
        const unread = data.filter(n => n.user.id === user.id && !n.is_read);
        total += unread.length;
      }

      // Count pending membership requests for clubs the user created
      const clubsRes = await fetch(`${API_BASE}/clubs/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (clubsRes.ok) {
        const clubs = await clubsRes.json();
        const myClubs = clubs.filter(c => c.creator?.id === user.id);

        const requestCounts = await Promise.all(
          myClubs.map(async (club) => {
            try {
              const res = await fetch(`${API_BASE}/clubs/${club.club_id}/requests/`, {
                headers: { Authorization: `Bearer ${accessToken}` },
              });
              if (res.ok) {
                const reqs = await res.json();
                return reqs.length; // already filtered to pending on the backend
              }
            } catch {
              // ignore per-club errors
            }
            return 0;
          })
        );
        total += requestCounts.reduce((sum, n) => sum + n, 0);
      }

      setNotificationCount(total);
    } catch (error) {
      console.error("Error fetching notification count:", error);
    }
  }, [accessToken, user?.id]);

  // ── Message unread count ──
  const fetchUnreadMessages = useCallback(async () => {
    if (!user?.id || !accessToken) return;

    try {
      let totalUnread = 0;

      // Get all clubs
      const clubsRes = await fetch(`${API_BASE}/clubs/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!clubsRes.ok) return;
      const allClubs = await clubsRes.json();

      // Creator clubs — no membership check needed
      const creatorClubs = allClubs
        .filter(c => c.creator?.id === user.id)
        .map(c => ({ ...c, club_id: c.club_id || c.id }));

      // Member clubs — check /members/
      const nonCreatorClubs = allClubs.filter(c => c.creator?.id !== user.id);
      const memberClubChecks = await Promise.all(
        nonCreatorClubs.map(async (club) => {
          const clubId = club.club_id || club.id;
          try {
            const res = await fetch(`${API_BASE}/clubs/${clubId}/members/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) return null;
            const members = await res.json();
            return members.some(m => m.user?.id === user.id)
              ? { ...club, club_id: clubId }
              : null;
          } catch {
            return null;
          }
        })
      );

      const userClubs = [...creatorClubs, ...memberClubChecks.filter(Boolean)];

      // For each club, count messages from the last 24 hours not sent by the current user
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const messageCounts = await Promise.all(
        userClubs.map(async (club) => {
          try {
            const res = await fetch(`${API_BASE}/clubs/${club.club_id}/messages/`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (!res.ok) return 0;
            const msgs = await res.json();
            if (!Array.isArray(msgs)) return 0;
            return msgs.filter(m =>
              new Date(m.created_at) > oneDayAgo && m.sender?.id !== user.id
            ).length;
          } catch {
            return 0;
          }
        })
      );

      totalUnread = messageCounts.reduce((sum, n) => sum + n, 0);
      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  }, [accessToken, user?.id]);

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [fetchNotificationCount]);

  useEffect(() => {
    fetchUnreadMessages();
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadMessages]);

  const handleNotificationClick = () => {
    if (setActiveComponent) {
      setActiveComponent('notifications');
      // ✅ Reset badge immediately — the notification page will mark them read
      setNotificationCount(0);
    }
  };

  const handleMessagesClick = () => {
    if (setActiveComponent) {
      setActiveComponent('messagerie');
      // ✅ Reset badge immediately when user opens messages
      setUnreadMessagesCount(0);
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#6a0dad" }}>
      <StyledToolbar>
        <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
          YalaH ntla9aw
        </Typography>

        <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <CenterLogo src={StoreLogo} alt="Store Logo" />
        </Box>

        <Icons>
          <Badge
            badgeContent={unreadMessagesCount}
            color="error"
            sx={{ cursor: 'pointer' }}
            onClick={handleMessagesClick}
          >
            <Mail />
          </Badge>
          <Badge
            badgeContent={notificationCount}
            color="error"
            sx={{ cursor: 'pointer' }}
            onClick={handleNotificationClick}
          >
            <Notifications />
          </Badge>
        </Icons>

        <Pets sx={{ display: { xs: "block", sm: "none" } }} />
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;