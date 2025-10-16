import React, { useState, useEffect, useContext } from "react";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import { UserContext } from "../UserContext";

const Settings = () => {
  const { user, accessToken, login } = useContext(UserContext);
  const [userForm, setUserForm] = useState({
    id: null,
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [originalUser, setOriginalUser] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user) {
      const userData = {
        id: user.id,
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || ''
      };
      setUserForm(userData);
      setOriginalUser(userData);
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };



  const saveProfile = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!accessToken) {
        setError('token expired ');
        return;
      }

      const response = await fetch(`http://127.0.0.1:8000/yalahntla9aw/users/${userForm.id}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: userForm.username,
          email: userForm.email,
          first_name: userForm.first_name,
          last_name: userForm.last_name
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        

        const updatedUserData = {
          ...user,
          username: updatedUser.username,
          email: updatedUser.email,
          first_name: updatedUser.first_name,
          last_name: updatedUser.last_name
        };
        
        login(updatedUserData, { access: accessToken });
        
        setUserForm(updatedUser);
        setOriginalUser(updatedUser);
        setSuccess('succ');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'failed');
      }
    } catch (err) {
      setError('faile server');
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setUserForm(originalUser);
    setError(null);
    setSuccess(null);
  };

  const hasChanges = () => {
    return JSON.stringify(userForm) !== JSON.stringify(originalUser);
  };

  if (!user) {
    return (
      <Box 
        flex={4} 
        p={{ xs: 2, md: 3 }}
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
             not login
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.href = '/login'}
              sx={{ mt: 2 }}
            >
              login
            </Button>
          </CardContent>
        </Card>
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
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', px: { xs: 2, md: 0 } }}>
       setting
      </Typography>
      
      
      <Card sx={{ mb: 3, mx: { xs: 2, md: 0 } }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {user.username?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Typography variant="h6" color="primary">
                hello {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      
      <Card sx={{ mx: { xs: 2, md: 0 } }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3 }}>
          update profile
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="username"
                name="username"
                value={userForm.username}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="email"
                name="email"
                type="email"
                value={userForm.email}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="first name"
                name="first_name"
                value={userForm.first_name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="last name"
                name="last_name"
                value={userForm.last_name}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={resetForm}
              disabled={!hasChanges() || saving}
            >
              cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveProfile}
              disabled={!hasChanges() || saving}
              startIcon={saving && <CircularProgress size={20} />}
            >
              {saving ? ' ...' : 'save'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Settings;