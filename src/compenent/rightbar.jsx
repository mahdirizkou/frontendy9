import {
  Box,
  Divider,
  ImageList,
  ImageListItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Avatar,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const Rightbar = () => {
  const [posts, setPosts] = useState([]);
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
   
    fetch("http://127.0.0.1:8000/yalahntla9aw/posts/")
      .then((res) => res.json())
      .then((data) => {
        const sortedPosts = data
          .sort((a, b) => new Date(b.date_post) - new Date(a.date_post))
          .slice(0, 3);
        setPosts(sortedPosts);
      })
      .catch((err) => console.error(err));

   
    fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/")
      .then((res) => res.json())
      .then((data) => {
        const sortedClubs = data
          .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
          .slice(0, 3);
        setClubs(sortedClubs);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <Box flex={2} p={2} sx={{ display: { xs: "none", sm: "block" } }}>
      <Box position="fixed" width={300}>
        <Typography variant="h6" fontWeight={100} mt={2} mb={2}>
          Latest Posts
        </Typography>
        <ImageList cols={1} rowHeight={150} gap={10}>
          {posts.map((post) => (
            <ImageListItem key={post.id_post}>
              <img src={post.image_url} alt={post.content} />
            </ImageListItem>
          ))}
        </ImageList>

        <Typography variant="h6" fontWeight={100} mt={3}>
          Latest Clubs
        </Typography>
        <List sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
          {clubs.map((club) => (
            <React.Fragment key={club.club_id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt={club.name} src={club.image_url} />
                </ListItemAvatar>
                <ListItemText
                  primary={club.name}
                  secondary={club.description}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Rightbar;
