import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Grid, 
  Skeleton,
  CardMedia,
  Divider,
  Stack,
  IconButton,
  CardActions
} from "@mui/material";
import { 
  Groups, 
  AccessTime, 
  LocationOn,
  FavoriteOutlined,
  ChatBubbleOutline,
  Share,
  MoreVert
} from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const YourClubs = () => {
  const { accessToken, user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [clubPosts, setClubPosts] = useState([]);

  useEffect(() => {
    const fetchJoinedClubsAndPosts = async () => {
      try {
        // جلب النوادي التي انضم إليها المستخدم
        const joinedClubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/userclubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!joinedClubsResponse.ok) throw new Error("Failed to fetch joined clubs");

        const joinedClubsData = await joinedClubsResponse.json();
        setJoinedClubs(joinedClubsData);

        // جلب جميع المنشورات
        const postsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/posts/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!postsResponse.ok) throw new Error("Failed to fetch posts");

        const allPosts = await postsResponse.json();

        // IDs النوادي التي انضم إليها
        const joinedClubIds = joinedClubsData.map(joinedClub => joinedClub.club);

        // فلترة المنشورات للنوادي المنضم إليها فقط
        const filteredPosts = allPosts.filter(post => 
          joinedClubIds.includes(post.club.club_id)
        );

        // إضافة بيانات النادي مباشرة (من post.club)
        const postsWithClubDetails = filteredPosts.map(post => ({
          ...post,
          clubDetails: post.club
        }));

        // ترتيب المنشورات حسب التاريخ (الأحدث أولاً)
        postsWithClubDetails.sort((a, b) => new Date(b.date_post) - new Date(a.date_post));
        setClubPosts(postsWithClubDetails);

      } catch (error) {
        console.error("Error fetching joined clubs and posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedClubsAndPosts();
  }, [accessToken, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

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
        <Groups sx={{ mr: 1, verticalAlign: 'middle' }} />
        Your Clubs Feed
      </Typography>

      {/* عرض النوادي المنضم إليها */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Your Joined Clubs ({joinedClubs.length})
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {joinedClubs.length > 0 ? (
            joinedClubs.map((joinedClub, index) => (
              <Chip 
                key={index}
                label={`Club ID: ${joinedClub.club}`}
                color="primary" 
                variant="outlined"
                size="small"
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              You haven't joined any clubs yet
            </Typography>
          )}
        </Box>
        {clubPosts.length > 0 && (
          <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
            Found {clubPosts.length} posts from your clubs
          </Typography>
        )}
      </Card>
      
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} key={item}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box sx={{ ml: 2, flex: 1 }}>
                      <Skeleton variant="text" height={20} width="60%" />
                      <Skeleton variant="text" height={16} width="40%" />
                    </Box>
                  </Box>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : clubPosts.length > 0 ? (
        <Grid container spacing={2}>
          {clubPosts.map((post) => (
            <Grid item xs={12} key={post.id_post}>
              <Card 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4,
                    transition: 'all 0.3s ease-in-out'
                  }
                }}
              >
                {/* Header المنشور */}
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={post.clubDetails?.image_url}
                        sx={{ 
                          bgcolor: 'primary.main', 
                          mr: 2,
                          width: 50,
                          height: 50
                        }}
                      >
                        {post.clubDetails?.name ? post.clubDetails.name[0].toUpperCase() : 'C'}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {post.clubDetails?.name || `Club ${post.club.club_id}`}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip 
                            label={post.clubDetails?.category || 'General'} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            {formatDate(post.date_post)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton>
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* محتوى المنشور */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {post.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {truncateText(post.content)}
                    </Typography>
                  </Box>
                </CardContent>

                {/* صورة المنشور */}
                {post.image_url && (
                  <CardMedia
                    component="img"
                    sx={{ 
                      height: 300,
                      objectFit: 'cover'
                    }}
                    image={post.image_url}
                    alt={post.title}
                  />
                )}

                <Divider />

                {/* إجراءات المنشور */}
                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" color="primary">
                      <FavoriteOutlined />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <ChatBubbleOutline />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <Share />
                    </IconButton>
                  </Box>

                  {/* معلومات النادي */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {post.clubDetails?.city || 'Unknown'}
                    </Typography>
                  </Box>
                </CardActions>

                {/* معلومات إضافية */}
                <Box sx={{ px: 2, pb: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Posted by: {post.clubDetails?.creator?.username || 'Unknown'} • 
                    Club created: {post.clubDetails ? formatDate(post.clubDetails.creation_date) : 'Unknown'}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Groups sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No Posts Available
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {joinedClubs.length === 0 
              ? "You haven't joined any clubs yet. Join clubs to see their posts here!"
              : `You've joined ${joinedClubs.length} club(s), but they haven't posted anything yet.`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Explore clubs and join them to see their latest posts and updates.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default YourClubs;
