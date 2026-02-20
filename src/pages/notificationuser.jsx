import {
  Box, Typography, Card, CardContent, Avatar, Button,
  Stack, Chip, Divider, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip
} from "@mui/material";
import { CheckCircle, Cancel, Info, Schedule, PostAdd, ThumbUp, Close, DoneAll } from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const API_BASE = "http://127.0.0.1:8000/yalahntla9aw";

const UserNotifications = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [responding, setResponding] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notifRes, reqRes] = await Promise.all([
          fetch(`${API_BASE}/notifications/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_BASE}/my-membership-requests/`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (notifRes.ok) {
          const data = await notifRes.json();
          // Only show unread notifications belonging to current user
          const unread = data.filter(n => n.user.id === user?.id && !n.is_read);
          setNotifications(unread);
        }

        if (reqRes.ok) {
          const data = await reqRes.json();
          // Only show requests that have been responded to (not still pending)
          const responded = data.filter(r => r.status !== 'pending');
          setMembershipRequests(responded);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && accessToken) {
      fetchData();
    }
  }, [accessToken, user?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getRequestStatus = (request) => {
    switch (request.status) {
      case 'approved':
        return { icon: <CheckCircle />, color: 'success', label: 'Approved' };
      case 'rejected':
        return { icon: <Cancel />, color: 'error', label: 'Rejected' };
      default:
        return { icon: <Schedule />, color: 'info', label: 'Pending' };
    }
  };

  // Mark a single notification as read and hide it
  const handleDismissNotification = async (notifId) => {
    try {
      await fetch(`${API_BASE}/notifications/${notifId}/read/`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
    // Remove from UI immediately regardless of server response
    setNotifications(prev => prev.filter(n => n.notification_id !== notifId));
  };

  // Dismiss a membership request card (just hide it locally, it's already responded to)
  const handleDismissRequest = (requestId) => {
    setMembershipRequests(prev => prev.filter(r => r.request_id !== requestId));
  };

  // Mark all notifications as read at once
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await Promise.all(
        notifications.map(n =>
          fetch(`${API_BASE}/notifications/${n.notification_id}/read/`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${accessToken}` },
          })
        )
      );
      setNotifications([]);
    } catch (e) {
      console.error("Failed to mark all as read:", e);
    } finally {
      setMarkingAll(false);
    }
  };

  const combineAndSortItems = () => {
    const combined = [];

    notifications.forEach(notif => combined.push({
      id: `notif-${notif.notification_id}`,
      type: 'notification',
      date: notif.sent_date,
      data: notif,
    }));

    membershipRequests.forEach(req => combined.push({
      id: `request-${req.request_id}`,
      type: 'membership_request',
      date: req.reviewed_date || req.request_date,
      data: req,
    }));

    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return (
      <Box flex={4} p={{ xs: 0, md: 2 }} sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  const combinedItems = combineAndSortItems();
  const totalCount = combinedItems.length;

  return (
    <Box flex={4} p={{ xs: 1, md: 2 }} sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" fontWeight="bold">
            My Notifications
          </Typography>
          {totalCount > 0 && (
            <Chip label={`${totalCount} unread`} color="error" size="small" />
          )}
        </Box>

        {notifications.length > 1 && (
          <Button
            startIcon={<DoneAll />}
            variant="outlined"
            size="small"
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? 'Clearing...' : 'Mark all as read'}
          </Button>
        )}
      </Box>

      {combinedItems.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="h6">All caught up!</Typography>
          <Typography variant="body2">You have no unread notifications.</Typography>
        </Alert>
      ) : (
        <Stack spacing={2}>
          {combinedItems.map((item) => {

            // ── Notification card ──
            if (item.type === 'notification') {
              const notif = item.data;
              return (
                <Card
                  key={item.id}
                  sx={{ border: 1, borderColor: 'info.light', borderRadius: 2, '&:hover': { boxShadow: 4 } }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 48, height: 48 }}>
                        <Info />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" mb={1}>
                          Club Notification
                        </Typography>
                        <Typography variant="body1" mb={2}>
                          {notif.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={notif.club?.name} color="info" variant="outlined" size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notif.sent_date)}
                          </Typography>
                        </Box>
                      </Box>

                      {/* ✅ Dismiss button */}
                      <Tooltip title="Mark as read">
                        <IconButton
                          size="small"
                          onClick={() => handleDismissNotification(notif.notification_id)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'success.main' } }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              );
            }

            // ── Membership request card ──
            if (item.type === 'membership_request') {
              const request = item.data;
              const status = getRequestStatus(request);
              return (
                <Card
                  key={item.id}
                  sx={{ border: 1, borderColor: `${status.color}.light`, borderRadius: 2, '&:hover': { boxShadow: 4 } }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar sx={{ bgcolor: `${status.color}.main`, width: 48, height: 48 }}>
                        {status.icon}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight="bold">
                            Membership Request
                          </Typography>
                          <Chip label={status.label} color={status.color} size="small" />
                        </Box>

                        <Typography variant="body1" mb={2}>
                          Your request to join <strong>{request.club?.name}</strong> was {status.label.toLowerCase()}.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Requested: {formatDate(request.request_date)}
                          </Typography>
                          {request.reviewed_date && (
                            <Typography variant="caption" color="text.secondary">
                              Reviewed: {formatDate(request.reviewed_date)}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {/* ✅ Dismiss button */}
                      <Tooltip title="Dismiss">
                        <IconButton
                          size="small"
                          onClick={() => handleDismissRequest(request.request_id)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              );
            }

            return null;
          })}
        </Stack>
      )}

      {/* Summary */}
      {totalCount > 0 && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            You have {notifications.length} unread notification(s) and {membershipRequests.length} membership update(s).
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UserNotifications;