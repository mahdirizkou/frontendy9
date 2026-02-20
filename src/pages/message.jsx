import React, { useState, useEffect, useContext, useRef } from 'react';
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
  Grid,
  Chip
} from '@mui/material';
import { Send as SendIcon, Message as MessageIcon, Group as GroupIcon, Star as StarIcon } from '@mui/icons-material';
import { UserContext } from '../UserContext';

const API_BASE = 'http://127.0.0.1:8000/yalahntla9aw';

const Messagerie = () => {
  const { user, accessToken } = useContext(UserContext);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchUserClubs = async () => {
      if (!user?.id || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const clubsRes = await fetch(`${API_BASE}/clubs/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        if (!clubsRes.ok) throw new Error('Failed to fetch clubs');
        const allClubs = await clubsRes.json();

        // ✅ FIX: Identify creator clubs directly from the response — no members check needed
        const creatorClubs = allClubs
          .filter(club => club.creator?.id === user.id)
          .map(club => ({
            ...club,
            club_id: club.club_id || club.id,
            isCreator: true,
          }));

        // For non-creator clubs, check membership via /members/
        const nonCreatorClubs = allClubs.filter(club => club.creator?.id !== user.id);

        const memberClubChecks = await Promise.all(
          nonCreatorClubs.map(async (club) => {
            const clubId = club.club_id || club.id;
            try {
              const membersRes = await fetch(`${API_BASE}/clubs/${clubId}/members/`, {
                headers: { 'Authorization': `Bearer ${accessToken}` },
              });
              if (!membersRes.ok) return null;
              const members = await membersRes.json();
              const isMember = members.some(m => m.user?.id === user.id);
              return isMember ? { ...club, club_id: clubId, isCreator: false } : null;
            } catch {
              return null;
            }
          })
        );

        const memberClubs = memberClubChecks.filter(Boolean);

        // Creator clubs appear first
        setClubs([...creatorClubs, ...memberClubs]);
        console.log(`Found ${creatorClubs.length} creator clubs and ${memberClubs.length} member clubs`);
      } catch (err) {
        console.error(err);
        setError('Failed to load your clubs.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserClubs();
  }, [user?.id, accessToken]);

  useEffect(() => {
    if (!selectedClub || !accessToken) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/clubs/${selectedClub.club_id}/messages/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setMessages(Array.isArray(data) ? data : []);
        } else if (res.status === 404) {
          setMessages([]);
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Error ${res.status}`);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load messages: ' + err.message);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [selectedClub?.club_id, accessToken]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClub || sendingMessage) return;

    setSendingMessage(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/clubs/${selectedClub.club_id}/messages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (res.ok) {
        const newMsg = await res.json();
        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getInitials = (sender) => {
    if (!sender) return '?';
    const first = sender.first_name?.[0] || '';
    const last = sender.last_name?.[0] || '';
    return (first + last).toUpperCase() || sender.username?.[0]?.toUpperCase() || '?';
  };

  const isOwnMessage = (message) => message.sender?.id === user?.id;

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

        {/* Left Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon color="primary" />
                My Clubs
                <Chip label={clubs.length} size="small" color="primary" sx={{ ml: 'auto' }} />
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {clubs.length === 0 ? (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
                  <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    You are not a member of any club yet.
                  </Typography>
                </Paper>
              ) : (
                <List sx={{ overflow: 'auto', flexGrow: 1 }} disablePadding>
                  {clubs.map((club) => {
                    const isSelected = selectedClub?.club_id === club.club_id;
                    return (
                      <ListItem key={`club-${club.club_id}`} disablePadding sx={{ mb: 1 }}>
                        <Button
                          fullWidth
                          onClick={() => {
                            setSelectedClub(club);
                            setMessages([]);
                            setError(null);
                          }}
                          sx={{
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: isSelected ? 'primary.main' : 'transparent',
                            color: isSelected ? 'white' : 'text.primary',
                            '&:hover': { bgcolor: isSelected ? 'primary.dark' : 'action.hover' },
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{
                              bgcolor: isSelected ? 'white' : (club.isCreator ? 'warning.main' : 'secondary.main'),
                              color: isSelected ? 'primary.main' : 'white'
                            }}>
                              {club.name?.[0]?.toUpperCase() || 'C'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="subtitle2" noWrap fontWeight={isSelected ? 700 : 400}>
                                  {club.name}
                                </Typography>
                                {club.isCreator && (
                                  <StarIcon sx={{ fontSize: 14, color: isSelected ? 'rgba(255,255,255,0.8)' : 'warning.main' }} />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" noWrap sx={{
                                color: isSelected ? 'rgba(255,255,255,0.75)' : 'text.secondary'
                              }}>
                                {club.isCreator ? 'Your club' : 'Member'} · {club.category || club.city || ''}
                              </Typography>
                            }
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

        {/* Right Panel */}
        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {!selectedClub ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <MessageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" color="text.secondary" gutterBottom>
                    Welcome to Messaging
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Select a club from the left to start chatting.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: selectedClub.isCreator ? 'warning.main' : 'primary.main', width: 44, height: 44 }}>
                      {selectedClub.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" lineHeight={1.2}>{selectedClub.name}</Typography>
                        {selectedClub.isCreator && (
                          <Chip label="Your Club" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem' }} />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {selectedClub.city} · {selectedClub.category}
                      </Typography>
                    </Box>
                  </Box>

                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                      {error}
                    </Alert>
                  )}

                  <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2, pr: 1 }}>
                    {loadingMessages ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                        <CircularProgress />
                      </Box>
                    ) : messages.length === 0 ? (
                      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
                        <MessageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography variant="body1" color="text.secondary">
                          No messages yet. Be the first to say something!
                        </Typography>
                      </Paper>
                    ) : (
                      <List disablePadding>
                        {messages.map((message, index) => {
                          const own = isOwnMessage(message);
                          return (
                            <ListItem
                              key={message.id || `msg-${index}`}
                              alignItems="flex-start"
                              sx={{ flexDirection: own ? 'row-reverse' : 'row', gap: 1, mb: 1, px: 0 }}
                            >
                              <ListItemAvatar sx={{ minWidth: 40 }}>
                                <Avatar sx={{ width: 36, height: 36, fontSize: '0.8rem', bgcolor: own ? 'primary.main' : 'secondary.main' }}>
                                  {getInitials(message.sender)}
                                </Avatar>
                              </ListItemAvatar>
                              <Box sx={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start' }}>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, px: 1 }}>
                                  {own ? 'You' : (`${message.sender?.first_name || ''} ${message.sender?.last_name || ''}`.trim() || message.sender?.username)}
                                  {' · '}{formatDateTime(message.created_at)}
                                </Typography>
                                <Paper elevation={0} sx={{
                                  px: 2, py: 1,
                                  borderRadius: own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                  bgcolor: own ? 'primary.main' : 'grey.100',
                                  color: own ? 'white' : 'text.primary',
                                  wordBreak: 'break-word',
                                }}>
                                  <Typography variant="body2">{message.content}</Typography>
                                </Paper>
                              </Box>
                            </ListItem>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </List>
                    )}
                  </Box>

                  <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Write your message… (Enter to send, Shift+Enter for new line)"
                      variant="outlined"
                      size="small"
                      disabled={sendingMessage}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={sendingMessage || !newMessage.trim()}
                      sx={{ minWidth: 48, height: 40, borderRadius: 3, px: 2 }}
                    >
                      {sendingMessage ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
                    </Button>
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