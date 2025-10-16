import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Badge
} from "@mui/material";

import {
  AccountBox,
  Article,
  Group,
  Home,
  ModeNight,
  Settings,
  People,
  Notifications,
  Groups,
  Feed,
  Chat 
} from "@mui/icons-material";

import { useState, useEffect, useContext } from "react";
import { UserContext } from "../UserContext";

const Sidebar = ({ mode, setMode, activeComponent, setActiveComponent }) => {
  const { user, accessToken } = useContext(UserContext);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  
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

  // component keys
  const menuItems = [
    { 
      text: "Homepage", 
      icon: <Home />, 
      componentKey: "home" 
    },
    { 
      text: "club Available", 
      icon: <Article />, 
      componentKey: "myClubs" 
    },
    { 
      text: "The clubs I created", 
      icon: <Group />, 
      componentKey: "createdClubs" 
    },
    { 
      text: "The clubs I joined",   
      icon: <People />,             
      componentKey: "joinedClubs"   
    },
    { 
      text: "Club Members",   
      icon: <Groups />,             
      componentKey: "clubMembers"   
    },
    { 
      text: "Messagerie", 
      icon: unreadMessagesCount > 0 ? (
        <Badge badgeContent={unreadMessagesCount} color="error">
          <Chat />
        </Badge>
      ) : <Chat />, 
      componentKey: "messagerie" 
    },
    { 
      text: "Your Clubs",   
      icon: <Feed />,             
      componentKey: "yourClubs"   
    },
    { 
     text: "Notifications", 
     icon: <Notifications />, 
     componentKey: "notifications" 
    },
    { 
      text: "Settings", 
      icon: <Settings />, 
      componentKey: "settings" 
    },
    { 
      text: "Profile", 
      icon: <AccountBox />, 
      componentKey: "profile" 
    },
  ];

  const handleMenuClick = (componentKey) => {
    setActiveComponent(componentKey);
    

    if (componentKey === 'messagerie') {
      setUnreadMessagesCount(0);
    }
  };

  return (
    <Box flex={1} p={2} sx={{ display: { xs: "none", sm: "block" } }}>
      <Box position="fixed">
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component="span"
                onClick={() => handleMenuClick(item.componentKey)}
                sx={{
                  backgroundColor: activeComponent === item.componentKey 
                    ? 'primary.main' 
                    : 'transparent',
                  color: activeComponent === item.componentKey 
                    ? 'white' 
                    : 'text.primary',
                  '&:hover': {
                    backgroundColor: activeComponent === item.componentKey 
                      ? 'primary.dark' 
                      : 'action.hover',
                  },
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                <ListItemIcon sx={{ 
                  color: activeComponent === item.componentKey 
                    ? 'white' 
                    : 'text.primary' 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
          
          {/* Dark Mode Switch */}
          <ListItem disablePadding>
            <ListItemButton component="span">
              <ListItemIcon>
                <ModeNight />
              </ListItemIcon>
              <Switch 
                onChange={() => setMode(mode === "light" ? "dark" : "light")}
                checked={mode === "dark"}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default Sidebar;