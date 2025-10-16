import { 
  Box, Typography, Card, CardContent, Avatar, Button, 
  Stack, Chip, Divider, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from "@mui/material";
import { Check, Close, PersonAdd, Schedule, PostAdd, ThumbUp, ThumbDown } from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const Notifications = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [processingRequests, setProcessingRequests] = useState({});
  const [userCreatedClubs, setUserCreatedClubs] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openPostDialog, setOpenPostDialog] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch clubs created by user
        const clubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          const myClubs = clubsData.filter(club => club.creator.id === user?.id);
          setUserCreatedClubs(myClubs);

          // Fetch membership requests for user's clubs
          const allRequests = [];
          for (const club of myClubs) {
            try {
              const requestsResponse = await fetch(
                `http://127.0.0.1:8000/yalahntla9aw/clubs/${club.club_id}/requests/`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (requestsResponse.ok) {
                const requests = await requestsResponse.json();
                allRequests.push(...requests);
              }
            } catch (error) {
              console.error(`Error fetching requests for club ${club.club_id}:`, error);
            }
          }
          setMembershipRequests(allRequests);

          // Fetch posts that need approval for user's clubs
          const postsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (postsResponse.ok) {
            const postsData = await postsResponse.json();
            const userClubIds = myClubs.map(club => club.club_id);
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

  const handleRequestResponse = async (requestId, action) => {
    setProcessingRequests(prev => ({ ...prev, [requestId]: true }));

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/yalahntla9aw/membership-requests/${requestId}/respond/`,
        {
          method: 'PATCH',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ action })
        }
      );

      if (response.ok) {
        setMembershipRequests(prev => 
          prev.filter(req => req.request_id !== requestId)
        );
        
        const message = action === 'accept' 
          ? 'Request accepted successfully!' 
          : 'Request rejected successfully!';
        alert(message);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to process request');
      }

    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error processing request");
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
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
        
        const message = approve ? 'Post approved successfully!' : 'Post rejected successfully!';
        alert(message);
      }
    } catch (error) {
      console.error("Error updating post status:", error);
      alert("Error processing post approval");
    } finally {
      setResponding(false);
    }
  };

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

  const combineAndSortItems = () => {
    const combined = [];
    
    // Add membership requests
    membershipRequests.forEach(req => {
      combined.push({
        id: `request-${req.request_id}`,
        type: 'membership_request',
        date: req.request_date,
        data: req
      });
    });

    // Add pending posts
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
        Club Management
      </Typography>

      {combinedItems.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="h6">No pending requests</Typography>
          <Typography variant="body2">
            You don't have any pending membership requests or post approvals for your clubs.
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={3}>
          {combinedItems.map((item) => {
            if (item.type === 'membership_request') {
              const request = item.data;
              return (
                <Card 
                  key={item.id}
                  sx={{ 
                    border: 1,
                    borderColor: 'primary.light',
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {/* User Avatar */}
                      <Avatar 
                        sx={{ 
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56
                        }}
                      >
                        <PersonAdd />
                      </Avatar>

                      {/* Request Info */}
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {request.user.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            wants to join
                          </Typography>
                          <Chip 
                            label={request.club.name}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📧 {request.user.email}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Requested on {formatDate(request.request_date)}
                          </Typography>
                        </Box>

                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Club:</strong> {request.club.description}
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            disabled={processingRequests[request.request_id]}
                            onClick={() => handleRequestResponse(request.request_id, 'accept')}
                            sx={{ minWidth: 120 }}
                          >
                            {processingRequests[request.request_id] ? 'Processing...' : 'Accept'}
                          </Button>
                          
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<Close />}
                            disabled={processingRequests[request.request_id]}
                            onClick={() => handleRequestResponse(request.request_id, 'reject')}
                            sx={{ minWidth: 120 }}
                          >
                            {processingRequests[request.request_id] ? 'Processing...' : 'Reject'}
                          </Button>
                        </Box>
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
                          width: 56,
                          height: 56
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Submitted on {formatDate(post.creation_date)}
                          </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewPost(post)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<Check />}
                            onClick={() => handlePostApproval(post.id_post, true)}
                            disabled={responding}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<Close />}
                            onClick={() => handlePostApproval(post.id_post, false)}
                            disabled={responding}
                          >
                            Reject
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
          Post Review
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
            startIcon={<Close />}
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

      {/* Summary Info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Summary</Typography>
        <Typography variant="body2" color="text.secondary">
          You own {userCreatedClubs.length} club(s) with {membershipRequests.length} pending membership request(s) and {pendingPosts.length} post(s) awaiting approval.
        </Typography>
      </Box>
    </Box>
  );
};

export default Notifications;