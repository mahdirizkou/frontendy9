import { Box, Stack, Skeleton } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import Post from "./post";
import { UserContext } from "../UserContext";

const Feed = () => {
  const { accessToken } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch clubs");

        const data = await response.json();
        setClubs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [accessToken]);

  return (
    <Box flex={4} p={{ xs: 0, md: 2 }}>
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" height={100} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="text" height={20} />
          <Skeleton variant="rectangular" height={300} />
        </Stack>
      ) : clubs.length > 0 ? (
        clubs.map((club) => (
          <Post key={club.club_id} club={club} />
        ))
      ) : (
        <p>No clubs available.</p>
      )}
    </Box>
  );
};

export default Feed;
