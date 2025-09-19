import { Box, Typography, Stack, Skeleton } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const CreatedClubs = () => {
  const { accessToken } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [createdClubs, setCreatedClubs] = useState([]);

  useEffect(() => {
    const fetchCreatedClubs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/created-clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch created clubs");

        const data = await response.json();
        setCreatedClubs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatedClubs();
  }, [accessToken]);

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
        My Created Clubs
      </Typography>
      
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" height={100} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      ) : createdClubs.length > 0 ? (
        <Stack spacing={2}>
          {createdClubs.map((club) => (
            <Box 
              key={club.club_id} 
              sx={{ 
                p: 2, 
                border: 1, 
                borderColor: 'divider', 
                borderRadius: 1,
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h6">{club.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {club.description}
              </Typography>
              <Typography variant="caption" color="primary">
                Created by you
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            You haven't created any clubs yet.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CreatedClubs;