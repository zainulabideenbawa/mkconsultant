'use client'
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, Drawer, CssBaseline, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MailIcon from '@mui/icons-material/Mail';
import { Dashboard, CorporateFare, Inventory, Construction, Receipt, Group, Settings, Logout, PersonAdd } from '@mui/icons-material'
import { usePathname,useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react';
import { SessionData } from '@/types';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
    open?: boolean;
}>(({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
        transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
    }),
}));

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
    transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-end',
}));

export default function PersistentDrawerLeft({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const theme = useTheme();
    const path = usePathname()
    const auth  = useSession()
    const [open, setOpen] = React.useState(false);
    const { data: session, status }: { data: null | SessionData, status: string } = useSession()
    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };
    const router = useRouter();

    const handleListItemClick = (route: string) => {
        router.push(route);
    };
    React.useEffect(()=>{
        setlistofdrawer(listofdrawer.map(item=>({...item,selected:item.link===path})))
    },[path])
    const [listofdrawer, setlistofdrawer] = React.useState([
        {
            name: "Dashboard",
            icon: <Dashboard />,
            link: "/dashboard",
            selected: true
        },
        {
            name: "Projects",
            icon: <CorporateFare />,
            link: "/dashboard/projects",
            selected: false
        },
        {
            name: "Suppliers",
            icon: <Inventory />,
            link: "/dashboard/suppliers",
            selected: false
        },
        {
            name: "Sub-Contractors",
            icon: <Construction />,
            link: "/dashboard/subcontractors",
            selected: false
        },
        {
            name: "Invoices",
            icon: <Receipt />,
            link: "/dashboard/invoices",
            selected: false
        },
        {
            name: "Clients",
            icon: <Group />,
            link: "/dashboard/clients",
            selected: false
        },
        {
            name: "Settings",
            icon: <Settings />,
            link: "/dashboard/setting",
            selected: false
        },
        {
            name: "User Management",
            icon: <PersonAdd />,
            link: "/dashboard/usermanagement",
            selected: false
        },
        {
            name: "Log Out",
            icon: <Logout />,
            link: "/dashboard",
            selected: false,
            func:()=>signOut()
        }
    ])

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" open={open} sx={{ background: "#fff" }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon sx={{ color: "black" }} />
                    </IconButton>
                   {session?.user? <div>
                        <Typography sx={{ color: "black" }} variant="h6" component="div">
                            Hello, {session?.user?.name?.toLocaleUpperCase()}
                        </Typography>
                        <Typography sx={{ color: "black" }} variant="subtitle1" component="div">
                        Welcome back to dashboard.
                        </Typography>
                    </div>:null}
                    
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
                variant="persistent"
                anchor="left"
                open={open}
            >
                <DrawerHeader>
                    <IconButton onClick={handleDrawerClose}>
                        {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </IconButton>
                </DrawerHeader>
                <Divider />
                <List>
                    {
                        listofdrawer.map((item, index) => (
                            <ListItem key={index} disablePadding>
                                <ListItemButton onClick={() => item.func? item.func() : handleListItemClick(item.link)} selected={item.selected}>
                                    <ListItemIcon>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name} />
                                </ListItemButton>
                            </ListItem>
                        ))
                    }
                </List>

            </Drawer>
            <Main open={open}>
                <DrawerHeader />
                {children}
            </Main>
        </Box>
    );
}
