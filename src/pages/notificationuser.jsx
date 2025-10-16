import { 
  Box, Typography, Card, CardContent, Avatar, Button, 
  Stack, Chip, Divider, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { CheckCircle, Cancel, Info, Schedule, PostAdd, ThumbUp, ThumbDown } from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const UserNotifications = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const notificationsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/notifications/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const requestsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/my-membership-requests/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        // Fetch posts that need approval (for club creators)
        const postsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          const userNotifications = notificationsData.filter(notif => notif.user.id === user?.id);
          setNotifications(userNotifications);
        }

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          setMembershipRequests(requestsData);
        }

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          // Filter posts that are pending and belong to clubs created by current user
          const userClubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
          
          if (userClubsResponse.ok) {
            const clubsData = await userClubsResponse.json();
            const userClubIds = clubsData
              .filter(club => club.creator?.id === user?.id)
              .map(club => club.club_id);
            
            const pendingPostsForUserClubs = postsData.filter(post => 
              post.status === 'pending' && userClubIds.includes(post.club)
            );
            setPendingPosts(pendingPostsForUserClubs);
          }
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && accessToken) {
      fetchData();
    }
  }, [accessToken, user?.id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequestStatus = (request) => {
    switch(request.status) {
      case 'accepted':
        return { icon: <CheckCircle />, color: 'success', label: 'Accepted' };
      case 'rejected':
        return { icon: <Cancel />, color: 'error', label: 'Rejected' };
      default:
        return { icon: <Schedule />, color: 'info', label: 'Pending' };
    }
  };

  const handleViewPost = (post) => {
    setSelectedPost(post);
    setOpenPostDialog(true);
  };

  const handlePostApproval = async (postId, approve) => {
    setResponding(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/yalahntla9aw/posts/${postId}/`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: approve ? 'approved' : 'rejected'
        }),
      });

      if (response.ok) {
        // Send notification to post author
        const notificationResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/notifications/", {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user: selectedPost.author,
            club: selectedPost.club,
            message: `Your post "${selectedPost.title}" has been ${approve ? 'approved' : 'rejected'} by the club creator.`,
            notification_type: 'post_response'
          }),
        });

        // Update local state
        setPendingPosts(prev => prev.filter(post => post.id_post !== postId));
        setOpenPostDialog(false);
        setSelectedPost(null);
      }
    } catch (error) {
      console.error("Error updating post status:", error);
    } finally {
      setResponding(false);
    }
  };

  const combineAndSortItems = () => {
    const combined = [];
    
    // Add notifications
    notifications.forEach(notif => {
      combined.push({
        id: `notif-${notif.notification_id}`,
        type: 'notification',
        date: notif.sent_date,
        data: notif
      });
    });

    // Add membership requests
    membershipRequests.forEach(req => {
      combined.push({
        id: `request-${req.request_id}`,
        type: 'membership_request',
        date: req.response_date || req.request_date,
        data: req
      });
    });

    // Add pending posts (for club creators)
    pendingPosts.forEach(post => {
      combined.push({
        id: `post-${post.id_post}`,
        type: 'pending_post',
        date: post.creation_date,
        data: post
      });
    });

    return combined.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  if (loading) {
    return (
      <Box 
        flex={4} 
        p={{ xs: 0, md: 2 }}
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const combinedItems = combineAndSortItems();

  return (
    <Box 
      flex={4} 
      p={{ xs: 0, md: 2 }}
      sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        My Notifications
      </Typography>

      {combinedItems.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="h6">No notifications</Typography>
          <Typography variant="body2">
            You don't have any notifications yet.
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={3}>
          {combinedItems.map((item) => {
            if (item.type === 'notification') {
              const notif = item.data;
              return (
                <Card 
                  key={item.id}
                  sx={{ 
                    border: 1,
                    borderColor: 'info.light',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'info.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        <Info />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          Club Notification
                        </Typography>
                        
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {notif.message}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={notif.club.name}
                            color="info"
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notif.sent_date)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            } else if (item.type === 'membership_request') {
              const request = item.data;
              const status = getRequestStatus(request);
              return (
                <Card 
                  key={item.id}
                  sx={{ 
                    border: 1,
                    borderColor: `${status.color}.light`,
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: `${status.color}.main`,
                          width: 48,
                          height: 48
                        }}
                      >
                        {status.icon}
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Membership Request
                          </Typography>
                          <Chip 
                            label={status.label}
                            color={status.color}
                            size="small"
                          />
                        </Box>

                        <Typography variant="body1" sx={{ mb: 2 }}>
                          Your request to join <strong>{request.club.name}</strong> has been {status.label.toLowerCase()}.
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Requested: {formatDate(request.request_date)}
                          </Typography>
                          {request.response_date && (
                            <Typography variant="caption" color="text.secondary">
                              Responded: {formatDate(request.response_date)}
                            </Typography>
                          )}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Club: {request.club.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            } else {
              // pending_post
              const post = item.data;
              return (
                <Card 
                  key={item.id}
                  sx={{ 
                    border: 1,
                    borderColor: 'warning.light',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: 'warning.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        <PostAdd />
                      </Avatar>

                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Post Approval Request
                          </Typography>
                          <Chip 
                            label="Pending Approval"
                            color="warning"
                            size="small"
                          />
                        </Box>

                        <Typography variant="body1" sx={{ mb: 2 }}>
                          New post <strong>"{post.title}"</strong> submitted by a member needs your approval.
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {post.content.substring(0, 100)}...
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Submitted: {formatDate(post.creation_date)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewPost(post)}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            }
          })}
        </Stack>
      )}

      {/* Post Details Dialog */}
      <Dialog 
        open={openPostDialog} 
        onClose={() => setOpenPostDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Post Approval Request
        </DialogTitle>
        <DialogContent>
          {selectedPost && (
            <Stack spacing={3}>
              <TextField
                label="Post Title"
                value={selectedPost.title}
                fullWidth
                InputProps={{
                  readOnly: true,
                }}
              />
              
              <TextField
                label="Post Content"
                value={selectedPost.content}
                fullWidth
                multiline
                rows={4}
                InputProps={{
                  readOnly: true,
                }}
              />
              
              {selectedPost.image_url && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>Post Image:</Typography>
                  <img 
                    src={selectedPost.image_url} 
                    alt="Post" 
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Submitted: {formatDate(selectedPost.creation_date)}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenPostDialog(false)}
            disabled={responding}
          >
            Close
          </Button>
          <Button
            startIcon={<Cancel />}
            color="error"
            onClick={() => handlePostApproval(selectedPost.id_post, false)}
            disabled={responding}
          >
            {responding ? 'Processing...' : 'Reject'}
          </Button>
          <Button
            startIcon={<ThumbUp />}
            variant="contained"
            color="success"
            onClick={() => handlePostApproval(selectedPost.id_post, true)}
            disabled={responding}
          >
            {responding ? 'Processing...' : 'Approve'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Summary</Typography>
        <Typography variant="body2" color="text.secondary">
          You have {notifications.length} general notification(s), {membershipRequests.length} membership request update(s), and {pendingPosts.length} post(s) awaiting approval.
        </Typography>
      </Box>
    </Box>
  );
};

export default UserNotifications;