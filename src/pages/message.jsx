import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { Send as SendIcon, Message as MessageIcon, Group as GroupIcon } from '@mui/icons-material';
import { UserContext } from '../UserContext';

const Messagerie = () => {
  const { user, accessToken } = useContext(UserContext);
  const [clubs, setClubs] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [selectedClubInfo, setSelectedClubInfo] = useState(null);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!user?.id || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        try {
          const allClubsMembersResponse = await fetch('http://127.0.0.1:8000/yalahntla9aw/all-clubs-members/', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (allClubsMembersResponse.ok) {
            const allClubsData = await allClubsMembersResponse.json();
            console.log('All clubs data:', allClubsData);
            
            // filter user
            const userClubs = allClubsData.filter(club => 
              club.members && club.members.some(member => 
                member.user && member.user.id === user.id
              )
            );
            
            setClubs(userClubs);
            console.log('User clubs for messaging:', userClubs);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log("All clubs members endpoint not available, using alternative method");
        }

        //other methode 
        const clubsResponse = await fetch('http://127.0.0.1:8000/yalahntla9aw/clubs/', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (clubsResponse.ok) {
          const allClubs = await clubsResponse.json();
          console.log('All clubs:', allClubs);
          
          // fetch membre club
          const userClubsPromises = allClubs.map(async (club) => {
            try {
              const membersResponse = await fetch(`http://127.0.0.1:8000/yalahntla9aw/clubs/${club.club_id || club.id}/members/`, {
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              });
              
              if (membersResponse.ok) {
                const members = await membersResponse.json();
                const isUserMember = members.some(member => 
                  member.user && member.user.id === user.id
                );
                
                if (isUserMember) {
                  return {
                    ...club,
                    id: club.club_id || club.id, 
                    members: members
                  };
                }
              }
              return null;
            } catch (error) {
              console.error(`Error checking membership for club ${club.club_id || club.id}:`, error);
              return null;
            }
          });

          const userClubs = (await Promise.all(userClubsPromises))
            .filter(club => club !== null && club.id); 
          
          setClubs(userClubs);
          console.log('User clubs for messaging (alternative method):', userClubs);
        } else {
          console.error('Failed to fetch clubs');
          setError('failed fetch club');
        }
      } catch (error) {
        console.error('Error fetching user clubs:', error);
        setError('failed');
      } finally {
        setLoading(false);
      }
    };

    fetchUserClubs();
  }, [user?.id, accessToken]);

  // club choisir
  useEffect(() => {
    const fetchClubMessages = async () => {
      if (!selectedClubId || !accessToken) {
        return;
      }

      setLoadingMessages(true);
      try {
        console.log("Fetching messages for clubId:", selectedClubId);
        const response = await fetch(`http://127.0.0.1:8000/yalahntla9aw/clubs/${selectedClubId}/messages/`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        console.log("Messages response status:", response.status);
        if (response.ok) {
          const data = await response.json();
          console.log("Messages data:", data);
          setMessages(Array.isArray(data) ? data : []);
          setError(null);
        } else if (response.status === 404) {
          console.log("No messages found for this club");
          setMessages([]);
          setError(null);
        } else {
          const errorText = await response.text();
          console.error("Failed to fetch messages:", response.status, errorText);
          throw new Error('فشل في جلب الرسائل');
        }
      } catch (error) {
        console.error('Error fetching club messages:', error);
        setError('حدث خطأ في جلب رسائل النادي');
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchClubMessages();
  }, [selectedClubId, accessToken]);

  // send new message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClubId || !accessToken) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/yalahntla9aw/clubs/${selectedClubId}/messages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
          club: selectedClubId
        }),
      });

      if (response.ok) {
        const newMsg = await response.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
        setError(null);
      } else {
        throw new Error('failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('failed');
    } finally {
      setSendingMessage(false);
    }
  };

  // choisi club
  const handleClubSelect = (club) => {
    const clubId = club.club_id || club.id; 
    setSelectedClubId(clubId);
    setSelectedClubInfo(club);
    setMessages([]);
    setError(null);
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ar-MA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Box sx={{ flex: 4, p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 4, p: 2 }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
        
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon />
                My clubs
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {clubs.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    not membre any club
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                  {clubs.map((club, index) => {
                    const clubId = club.club_id || club.id;
                    return (
                      <ListItem 
                        key={`club-${clubId || `temp-${index}`}`}
                        disablePadding
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: selectedClubId === clubId ? 'primary.light' : 'transparent',
                          '&:hover': {
                            bgcolor: selectedClubId === clubId ? 'primary.light' : 'action.hover',
                          }
                        }}
                      >
                        <Button
                          fullWidth
                          onClick={() => handleClubSelect(club)}
                          sx={{ 
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            p: 2,
                            color: selectedClubId === clubId ? 'white' : 'text.primary'
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              {club.name?.[0] || 'N'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={club.name}
                            secondary={club.description}
                            sx={{
                              '& .MuiListItemText-secondary': {
                                color: selectedClubId === clubId ? 'rgba(255,255,255,0.7)' : 'text.secondary'
                              }
                            }}
                          />
                        </Button>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

      
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {!selectedClubId ? (
               
                <Box sx={{ 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    hello in conversation
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    choisi club 
                  </Typography>
                </Box>
              ) : (
                <>
                 
                  {selectedClubInfo && (
                    <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="h6" component="h1" gutterBottom>
                        message club {selectedClubInfo.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedClubInfo.description}
                      </Typography>
                    </Box>
                  )}

                
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                 
                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                    {loadingMessages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <CircularProgress />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          not have message in this club
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          be frist send message
                        </Typography>
                      </Paper>
                    ) : (
                      <List>
                        {messages.map((message, index) => (
                          <React.Fragment key={`message-${message.id || `temp-${index}`}`}>
                            <ListItem alignItems="flex-start">
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  {message.sender?.first_name?.[0] || message.sender?.username?.[0] || 'U'}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2">
                                      {message.sender?.first_name} {message.sender?.last_name} 
                                      ({message.sender?.username})
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {formatDateTime(message.created_at)}
                                    </Typography>
                                  </Box>
                                }
                                secondary={
                                  <Typography variant="body1" sx={{ mt: 1 }}>
                                    {message.content}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {index < messages.length - 1 && <Divider variant="inset" component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    )}
                  </Box>

                
                  <Box component="form" onSubmit={handleSendMessage}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        multiline
                        maxRows={4}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="write ur message here.."
                        variant="outlined"
                        size="small"
                        disabled={sendingMessage}
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={sendingMessage || !newMessage.trim()}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        {sendingMessage ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SendIcon />
                        )}
                      </Button>
                    </Box>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Messagerie;