import { Mail, Notifications, Pets } from "@mui/icons-material";
import { AppBar, Badge, Box, styled, Toolbar, Typography } from "@mui/material";
import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

import StoreLogo from "../store.png";

const StyledToolbar = styled(Toolbar)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
});

const Icons = styled(Box)(({ theme }) => ({
  display: "none",
  alignItems: "center",
  gap: "20px",
  [theme.breakpoints.up("sm")]: {
    display: "flex",
  },
}));

const CenterLogo = styled("img")({
  height: 80, 
  objectFit: "contain",
});

const Navbar = ({ setActiveComponent }) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { accessToken, user } = useContext(UserContext);

  
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user?.id || !accessToken) return;

      try {
        let totalCount = 0;

        const clubsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/clubs/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (clubsResponse.ok) {
          const clubsData = await clubsResponse.json();
          const myClubs = clubsData.filter(club => club.creator.id === user.id);

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
                totalCount += requests.length;
              }
            } catch (error) {
              console.error(`Error fetching requests for club ${club.club_id}:`, error);
            }
          }
        }

        const notificationsResponse = await fetch("http://127.0.0.1:8000/yalahntla9aw/notifications/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json();
          const userNotifications = notificationsData.filter(notif => notif.user.id === user.id);
          totalCount += userNotifications.length;
        }

        setNotificationCount(totalCount);
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 60000);
    return () => clearInterval(interval);
  }, [accessToken, user?.id]);

  
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!user?.id || !accessToken) return;

      try {
        let totalUnreadCount = 0;
        
       
        try {
          const allClubsMembersResponse = await fetch('http://127.0.0.1:8000/yalahntla9aw/all-clubs-members/', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (allClubsMembersResponse.ok) {
            const allClubsData = await allClubsMembersResponse.json();
            
           
            const userClubs = allClubsData.filter(club => 
              club.members && club.members.some(member => 
                member.user && member.user.id === user.id
              )
            );

           
            for (const club of userClubs) {
              try {
                const messagesResponse = await fetch(`http://127.0.0.1:8000/yalahntla9aw/clubs/${club.club_id || club.id}/messages/`, {
                  headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                });

                if (messagesResponse.ok) {
                  const messages = await messagesResponse.json();
                  if (Array.isArray(messages)) {
                    
                    const oneDayAgo = new Date();
                    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                    
                    const newMessages = messages.filter(message => {
                      const messageDate = new Date(message.created_at);
                      return messageDate > oneDayAgo && message.sender?.id !== user.id;
                    });
                    
                    totalUnreadCount += newMessages.length;
                  }
                }
              } catch (error) {
                console.error(`Error fetching messages for club ${club.club_id || club.id}:`, error);
              }
            }
          }
        } catch (error) {
          console.error('Error fetching clubs data:', error);
        }

        setUnreadMessagesCount(totalUnreadCount);
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    fetchUnreadMessages();
    
    const interval = setInterval(fetchUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [user?.id, accessToken]);

  const handleNotificationClick = () => {
    if (setActiveComponent) {
      setActiveComponent('notifications');
    }
  };

  const handleMessagesClick = () => {
    if (setActiveComponent) {
      setActiveComponent('messagerie');
     
      setUnreadMessagesCount(0);
    }
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#6a0dad" }}>
      <StyledToolbar>
       
        <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
          YalaH ntla9aw
        </Typography>

       
        <Box sx={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
          <CenterLogo src={StoreLogo} alt="Store Logo" />
        </Box>

      
        <Icons>
          <Badge 
            badgeContent={unreadMessagesCount} 
            color="error"
            sx={{ cursor: 'pointer' }}
            onClick={handleMessagesClick}
          >
            <Mail />
          </Badge>
          <Badge 
            badgeContent={notificationCount} 
            color="error"
            sx={{ cursor: 'pointer' }}
            onClick={handleNotificationClick}
          >
            <Notifications />
          </Badge>
        </Icons>

        
        <Pets sx={{ display: { xs: "block", sm: "none" } }} />
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;