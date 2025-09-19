import { Box, Typography, Stack, Skeleton } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const Explore = () => {
  const { accessToken } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [exploreClubs, setExploreClubs] = useState([]);

  useEffect(() => {
    const fetchExploreClubs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/explore/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch explore clubs");

        const data = await response.json();
        setExploreClubs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchExploreClubs();
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
        Explore Clubs
      </Typography>
      
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" height={100} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      ) : exploreClubs.length > 0 ? (
        <Stack spacing={2}>
          {exploreClubs.map((club) => (
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
              <Typography variant="caption" color="success.main">
                Available to join
              </Typography>
            </Box>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No clubs to explore right now.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Explore;