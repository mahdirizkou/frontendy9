import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Chip, 
  Grid, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Badge,
  Divider
} from "@mui/material";
import { ExpandMore, Groups, Person } from "@mui/icons-material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const ClubMembers = () => {
  const { accessToken } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [clubsWithMembers, setClubsWithMembers] = useState([]);
  const [expandedClub, setExpandedClub] = useState(false);

  useEffect(() => {
    const fetchClubsAndMembers = async () => {
      try {
     
        
        try {
          
          const allClubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/all-clubs-members/", {
            headers: {
              "Content-Type": "application/json",
              Authorization: accessToken ? `Bearer ${accessToken}` : "",
            },
          });

          if (allClubsResponse.ok) {
            const allClubsData = await allClubsResponse.json();
            setClubsWithMembers(allClubsData);
            return;
          }
        } catch (error) {
          console.log("All clubs endpoint not available, using alternative method");
        }

        const clubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: accessToken ? `Bearer ${accessToken}` : "",
          },
        });

        if (!clubsResponse.ok) throw new Error("Failed to fetch clubs");

        const clubsData = await clubsResponse.json();

        const clubsWithMembersPromises = clubsData.map(async (club) => {
          try {
            const membersResponse = await fetch(
              `http://127.0.0.1:8000/yalahntla9aw/clubs/${club.club_id}/members/`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: accessToken ? `Bearer ${accessToken}` : "",
                },
              }
            );

            let members = [];
            if (membersResponse.ok) {
              members = await membersResponse.json();
            } else {
              console.log(`Members endpoint not available for club ${club.club_id}`);
            }

            return {
              ...club,
              members: members,
              memberCount: members.length
            };
          } catch (error) {
            console.error(`Error fetching members for club ${club.club_id}:`, error);
            return {
              ...club,
              members: [],
              memberCount: 0
            };
          }
        });

        const clubsWithMembersData = await Promise.all(clubsWithMembersPromises);
        setClubsWithMembers(clubsWithMembersData);

      } catch (error) {
        console.error("Error fetching clubs and members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubsAndMembers();
  }, [accessToken]);

  const handleAccordionChange = (clubId) => (event, isExpanded) => {
    setExpandedClub(isExpanded ? clubId : false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
        Club Members
      </Typography>
      
      {loading ? (
        <Box sx={{ mt: 2 }}>
          {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ mb: 2 }}>
              <CardContent>
                <Skeleton variant="text" height={40} width="60%" />
                <Skeleton variant="text" height={20} width="40%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block', mr: 1 }} />
                  <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block', mr: 1 }} />
                  <Skeleton variant="circular" width={40} height={40} sx={{ display: 'inline-block', mr: 1 }} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : clubsWithMembers.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          {clubsWithMembers.map((club) => (
            <Accordion
              key={club.club_id}
              expanded={expandedClub === club.club_id}
              onChange={handleAccordionChange(club.club_id)}
              sx={{ mb: 2, borderRadius: 2, '&:before': { display: 'none' } }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ 
                  backgroundColor: 'background.paper',
                  borderRadius: 2,
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar
                    src={club.image_url}
                    sx={{ mr: 2, width: 50, height: 50 }}
                  >
                    {club.name[0].toUpperCase()}
                  </Avatar>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                      {club.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <Chip 
                        label={club.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Badge 
                        badgeContent={club.memberCount} 
                        color="secondary"
                        sx={{ ml: 1 }}
                      >
                        <Person />
                      </Badge>
                      <Typography variant="body2" color="text.secondary">
                        {club.memberCount} {club.memberCount === 1 ? 'member' : 'members'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="text.secondary">
                      📍 {club.city}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created by: {club.creator?.username}
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ backgroundColor: 'background.default' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {club.description}
                </Typography>
                
                <Divider sx={{ mb: 2 }} />
                
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  Members ({club.memberCount})
                </Typography>

                {club.members.length > 0 ? (
                  <List>
                    {club.members.map((member, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            {member.user?.username ? member.user.username[0].toUpperCase() : 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {member.user?.username || 'Unknown User'}
                              {member.user?.first_name && ` (${member.user.first_name} ${member.user?.last_name || ''})`}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                Joined: {formatDate(member.date_joined)}
                              </Typography>
                              {member.user?.email && (
                                <Typography variant="body2" color="text.secondary">
                                  📧 {member.user.email}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No members yet
                    </Typography>
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Groups sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
            No Clubs Available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            There are no clubs to display members for at the moment.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ClubMembers;