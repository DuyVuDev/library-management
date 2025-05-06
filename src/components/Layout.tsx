"use client";

import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Category as CategoryIcon,
  Assignment as AssignmentIcon,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import UserPopover from "./UserPopover";
import { isAdmin, isSuperUserOrHigher } from "../utils/auth-utils";

const drawerWidth = 240;

const Layout = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation(); // Get current location to determine active route

  const toggleDrawer = () => {
    setOpen(!open);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const items = [
      { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
      { text: "Books", icon: <BookIcon />, path: "/books" },
      { text: "Requests", icon: <AssignmentIcon />, path: "/requests" },
    ];

    // Add admin-only menu items
    if (isAdmin(user?.role)) {
      items.push({ text: "Users", icon: <PersonIcon />, path: "/users" });
    }

    // Add SuperUser and Admin menu items
    if (isSuperUserOrHigher(user?.role)) {
      items.push({
        text: "Categories",
        icon: <CategoryIcon />,
        path: "/categories",
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ ...(!isMobile && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Library Management
          </Typography>
          {user && <UserPopover />}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={isMobile ? open : true}
        onClose={handleDrawerClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto", p: 1 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;

              return (
                <ListItem
                  component="button"
                  key={item.text}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) handleDrawerClose();
                  }}
                  sx={{
                    mb: 0.5,
                    borderRadius: 1,
                    backgroundColor: isActive ? "primary.light" : "transparent",
                    color: isActive ? "primary.contrastText" : "inherit",

                    "&:hover": {
                      backgroundColor: isActive
                        ? "primary.light"
                        : "action.hover",
                    },
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: 1,
                    width: "100%",
                    border: "none",
                    cursor: "pointer",
                    "&:focus": {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: "2px",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? "primary.contrastText" : "inherit",
                      minWidth: 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: isActive ? "bold" : "regular",
                    }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
