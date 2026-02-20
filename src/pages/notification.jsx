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
  const [processingRequests, setProcessingRequests] = useState({});
  const [userCreatedClubs, setUserCreatedClubs] = useState([]);

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
                console.log("Requests for club", club.club_id, ":", requests); // ✅ Debug log
                allRequests.push(...requests);
              }
            } catch (error) {
              console.error(`Error fetching requests for club ${club.club_id}:`, error);
            }
          }
          console.log("All requests:", allRequests); // ✅ Debug log
          setMembershipRequests(allRequests);
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
    console.log("Processing request:", requestId, "action:", action); // ✅ Debug log
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

      console.log("Response status:", response.status); // ✅ Debug log

      if (response.ok) {
        const responseData = await response.json();
        console.log("Response data:", responseData); // ✅ Debug log

        // ✅ Remove the processed request from state
        setMembershipRequests(prev =>
          prev.filter(req => req.id !== requestId && req.request_id !== requestId)
        );

        const message = action === 'accept'
          ? 'Request accepted successfully!'
          : 'Request rejected successfully!';
        alert(message);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData); // ✅ Debug log
        alert(errorData.error || 'Failed to process request');
      }

    } catch (error) {
      console.error("Error processing request:", error);
      alert("Error processing request: " + error.message);
    } finally {
      setProcessingRequests(prev => ({ ...prev, [requestId]: false }));
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

      {membershipRequests.length === 0 ? (
        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="h6">No pending requests</Typography>
          <Typography variant="body2">
            You don't have any pending membership requests for your clubs.
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={3}>
          {membershipRequests.map((request) => {
            // ✅ Handle both 'id' and 'request_id' field names
            const requestId = request.id || request.request_id;

            return (
              <Card
                key={requestId}
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
                          {request.user?.username || 'Unknown User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          wants to join
                        </Typography>
                        <Chip
                          label={request.club?.name || 'Unknown Club'}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </Box>

                      {request.user?.email && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          📧 {request.user.email}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Requested on {formatDate(request.request_date)}
                        </Typography>
                      </Box>

                      {request.club?.description && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Club:</strong> {request.club.description}
                        </Typography>
                      )}

                      <Divider sx={{ mb: 2 }} />

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<Check />}
                          disabled={processingRequests[requestId]}
                          onClick={() => handleRequestResponse(requestId, 'accept')}
                          sx={{ minWidth: 120 }}
                        >
                          {processingRequests[requestId] ? 'Processing...' : 'Accept'}
                        </Button>

                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Close />}
                          disabled={processingRequests[requestId]}
                          onClick={() => handleRequestResponse(requestId, 'reject')}
                          sx={{ minWidth: 120 }}
                        >
                          {processingRequests[requestId] ? 'Processing...' : 'Reject'}
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Summary Info */}
      <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Summary</Typography>
        <Typography variant="body2" color="text.secondary">
          You own {userCreatedClubs.length} club(s) with {membershipRequests.length} pending membership request(s).
        </Typography>
      </Box>
    </Box>
  );
};

export default Notifications;