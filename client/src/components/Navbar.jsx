import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import SearchIcon from "@mui/icons-material/Search";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { IconButton } from "@mui/material";
import { NotificationsRounded } from "@mui/icons-material";
import Badge from "@mui/material/Badge";
import { useDispatch } from "react-redux";
import Avatar from "@mui/material/Avatar";
import AccountDialog from "./AccountDialog";
import NotificationDialog from "./NotificationDialog";
import { getUserByToken, getUserNotification, getSearchResult } from "../api/index";
import { logout } from "../redux/userSlice";
import { CircularProgress } from "@mui/material";

const Container = styled.div`
  position: sticky;
  top: 0;
  height: 56px;
  margin: 6px 6px 0px 6px;
  border-radius: 12px;
  z-index: 99;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.06);
  background-color: ${({ theme }) => theme.bgLighter};
  @media screen and (max-width: 480px) {
    margin: 0px 0px 0px 0px;
    height: 60px;
  }
`;
const Wrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0px 14px;
  @media screen and (max-width: 480px) {
    padding: 0px 4px;
  }
  position: relative;
`;

const IcoButton = styled(IconButton)`
  color: ${({ theme }) => theme.textSoft} !important;
`;

const Search = styled.div`
  width: 40%;
  position: relative; /* Enable positioning for the dropdown */
  @media screen and (max-width: 480px) {
    width: 50%;
  }
  left: 0px;
  right: 0px;
  margin: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 100px;
  color: ${({ theme }) => theme.textSoft};
  background-color: ${({ theme }) => theme.bgDark};
`;

const Input = styled.input`
  width: 100%;
  border: none;
  font-size: 16px;
  padding: 10px 20px;
  border-radius: 8px;
  background-color: transparent;
  outline: none;
  color: ${({ theme }) => theme.textSoft};
`;

const Button = styled.button`
  padding: 5px 18px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 15px;
  border-radius: 100px;
  transition: all 0.3s ease;
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

const User = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  font-size: 18px;
  padding: 0px 8px;
  color: ${({ theme }) => theme.text};
  @media (max-width: 800px) {
    gap: 2px;
}
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%; 
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bgLighter};
  border: 0.5px solid ${({ theme }) => theme.soft + "99"};
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000; 
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const DropdownItem = styled.div`
  padding: 10px 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border: 0.5px solid ${({ theme }) => theme.soft + "99"};
  &:hover {
    background-color: ${({ theme }) => theme.itemHover};
  }
  a {
    text-decoration: none;
    color: ${({ theme }) => theme.textSoft};
    flex-grow: 1;
  }
`;



const Navbar = ({ menuOpen, setMenuOpen }) => {
  const [SignUpOpen, setSignUpOpen] = useState(false);
  const [SignInOpen, setSignInOpen] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [notificationLength, setNotificationLength] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [notification, setNotification] = useState([]);
  const [searchResult, setSearchResult] = useState({ projects: [], teams: [], tasks: [] });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef(null);

  const { currentUser } = useSelector((state) => state.user);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();
  
  useEffect(() => {
    getUserByToken(token).then((res) => {
      setUsers(res.data);
      setLoading(false);
    }).catch((err) => {
      if (err.response.status === 401) {
        dispatch(logout())
      }
    });
  }, [dispatch]);

  const getNotifications = async () => {
    try {
      await getUserNotification(token).then((res) => {
        const data = res.data.data;
        setNotification(data);
        setNotificationLength(data.length);
      });
    } catch (error) {
      console.log("Error loading user notification: ",error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    if (!currentUser && !SignUpOpen) {
      setSignInOpen(true);
      setSignUpOpen(false);
    } else if (!currentUser && SignUpOpen) {
      setSignInOpen(false);
      setSignUpOpen(true);
    }
    
    if (currentUser && !currentUser.verified) {
      setVerifyEmail(true);
    } else {
      setVerifyEmail(false);
    }
  }, [currentUser, SignInOpen, SignUpOpen, setVerifyEmail, users]);

  
  //Open the account dialog
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  //Open the notification dialog
  const [anchorEl2, setAnchorEl2] = useState(null);
  const open2 = Boolean(anchorEl2);
  const id2 = open2 ? "simple-popover" : undefined;
  const notificationClick = (event) => {
    setAnchorEl2(event.currentTarget);
    setNotificationLength(0);
  };

  const notificationClose = () => {
    setAnchorEl2(null);
  };
  
  const handleSearch = async (e) => {
    const searchQuery = e.target.value.trim(); 
  
    setSearchResult({ projects: [], teams: [], tasks: [] });
  
    if (!searchQuery) {
      setIsDropdownOpen(false);
      return; 
    }
    try {
      const res = await getSearchResult(searchQuery, token);
      setIsDropdownOpen(true);
      if (res.status === 200) {
        setSearchResult(res.data.data); 
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };
  
  const handleClickOutside = (event) => {
    if (searchRef.current && !searchRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <>
      <Container>
        {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
                  <CircularProgress />
                </div>
              ) : (
        <Wrapper>
          <IcoButton onClick={() => setMenuOpen(!menuOpen)}>
            <MenuIcon />
          </IcoButton>
          <Search ref={searchRef}>
            <Input placeholder="Search" 
            onChange={(e) => handleSearch(e)}
            />
            <SearchIcon style={{ marginRight: "20px", marginLeft: "20px", marginBotton: "0px"}} />
            {isDropdownOpen && (searchResult.projects.length > 0 || searchResult.teams.length > 0 || searchResult.tasks.length > 0) && (
              <Dropdown>
                {searchResult?.projects.map((project) => (
                  <DropdownItem key={project._id}>
                    <Link to={`/project/${project._id}`}>{project.project_name}</Link>
                  </DropdownItem>
                ))}
                {searchResult?.teams.map((team) => (
                  <DropdownItem key={team._id}>
                    <Link to={`/team/${team._id}`}>{team.team_name}</Link>
                  </DropdownItem>
                ))}
                {searchResult?.tasks.map((task) => (
                  <DropdownItem key={task._id}>
                    <Link to={`/task/${task._id}`}>{task.task_title}</Link>
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </Search>
          <User>
            {currentUser ? (
              <>
                <IcoButton aria-describedby={id} onClick={notificationClick}>
                  <Badge badgeContent={notificationLength} color="primary">
                    <NotificationsRounded />
                  </Badge>
                </IcoButton>
                <IcoButton aria-describedby={id} onClick={handleClick}>
                  <Badge
                    badgeContent="    "
                    color="success"
                    variant="dot"
                    overlap="circular"
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                  >
                    <Avatar
                      src={currentUser.img}
                      sx={{ width: "34px", height: "34px" }}
                    >
                      {currentUser.email[0].toUpperCase()}
                    </Avatar>
                  </Badge>
                </IcoButton>
              </>
            ) : (
              <Button onClick={() => setSignInOpen(true)}>
                <AccountCircleOutlinedIcon /> Sign In
              </Button>
            )}
          </User>
        </Wrapper>
        )}
      </Container>
      {currentUser && (
        <AccountDialog
          open={open}
          anchorEl={anchorEl}
          id={id}
          handleClose={handleClose}
          currentUser={currentUser}
        />
      )}
      {currentUser && (
        <NotificationDialog
          open={open2}
          anchorEl={anchorEl2}
          id={id2}
          handleClose={notificationClose}
          currentUser={currentUser}
          notification={notification}
        />
      )}
    </>
  );
};

export default Navbar;
