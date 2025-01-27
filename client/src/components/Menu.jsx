import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import { Link } from "react-router-dom";
import { CloseRounded, Groups2Rounded, Logout, WorkspacesRounded, AccountTreeRounded, DashboardRounded, AddTaskRounded } from "@mui/icons-material";
import { useDispatch } from "react-redux";
import { logout } from "../redux/userSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import { useSelector } from "react-redux";
import { getUserByToken } from "../api/index";
import { Avatar, CircularProgress } from "@mui/material";
import { tagColors } from "../data/data";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  flex: 1.3;
  background-color: ${({ theme }) => theme.bgLighter};
  height: 100vh;
  border-top-right-radius: 14px;
  border-bottom-right-radius: 14px;
  color: ${({ theme }) => theme.text};
  font-size: 14px;
  position: sticky;
  top: 0;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.04);
  transition: 0.3s ease-in-out;
  @media (max-width: 1100px) {
    position: fixed;
    z-index: 100;
    width: 100%;
    max-width: 250px;
    left: ${({ setMenuOpen }) => (setMenuOpen ? "0" : "-100%")};
    transition: 0.3s ease-in-out;
  }
`;
const ContainerWrapper = styled.div`
  height: 90%;
  overflow-y: scroll !important;
  margin-top: 0px;
`;
const Space = styled.div`
  height: 50px;
`;
const Flex = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px;
`;

const Logo = styled.div`
  color: ${({ theme }) => theme.primary};
  display: flex;
  align-items: center;
  gap: 16px;
  font-weight: bold;
  font-size: 26px;
`;

const Close = styled.div`
  display: none;
  @media (max-width: 1100px) {
    display: block;
  }
`;

const Item = styled.div`
  font-size: 12px;
  display: flex;
  margin: 5px;
  color: ${({ theme }) => theme.textSoft + "99"};
  align-items: justify;
  gap: 20px;
  cursor: pointer;
  padding: 7.5px 26px;
  &:hover {
    background-color: ${({ theme }) => theme.itemHover};
  }
`;

const Hr = styled.hr`
  margin: 10px 5px 10px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft};
`;

const Title = styled.h2`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.itemText };
  margin-bottom: 12px;
  padding: 0px 26px;
  display: flex;
  align-items: center;
  gap: 12px;
`;



const Menu = ({ darkMode, setDarkMode, setMenuOpen, refreshMenu }) => {
  const token = localStorage.getItem("token");
  const [project, setProject] = useState([]);
  const [team, setTeams] = useState([]);
  const [projectLoading, setProjectLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutUser = () => {
    dispatch(logout());
    navigate(`/`);
  };
  const fecthData = async () => {
    setTeamsLoading(true);
   await getUserByToken(token)
      .then((res) => {
        setProject(res.data.data.project);
        setProjectLoading(false);
        setTeams(res.data.data.team);
        setTeamsLoading(false);
      })
      .catch((err) => {
        console.log("err", err);
        dispatch(openSnackbar({ message: err.message, type: "error" }));
        if (err.response.status === 401 || err.response.status === 402) logoutUser();
      });
  };

  useEffect(() => {
    fecthData();
  },[currentUser, refreshMenu]);

  return (
    <Container setMenuOpen={setMenuOpen}>
      <Flex>
        <Link to="/" style={{ textDecoration: "none", color: "inherit", alignItems: 'center',display: 'flex' }}>
          <Logo>
            TASKIT
          </Logo>
        </Link>
        <Close>
          <CloseRounded onClick={() => setMenuOpen(false)} />
        </Close>
      </Flex>
      <ContainerWrapper>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <Title>
            <DashboardRounded />
            Dashboard
          </Title>
        </Link>
        <Link
          to="project"
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={() => setShowProject(!showProject)}
        >
          <Title>
            <AccountTreeRounded />
            Projects
          </Title>
        </Link>
          {projectLoading ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px'}}>
            <CircularProgress size='24px' />
          </div>
          ) : ( showProject &&
            project.map((p, i) => (
              <Link to={`/project/${p._id}`}
              style={{ textDecoration: "none", color: "inherit" }}>
              <Item>
                <AccountTreeRounded sx={{ fontSize: "18px" }} tagColor={tagColors[i]} />
                {p.project_name}
              </Item>
            </Link>
           )))}
        <Hr />
        <Link
          to="team"
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={() => setShowTeam(!showTeam)}
        >
          <Title>
            <Groups2Rounded />
            Teams
          </Title>
        </Link>
        { teamsLoading ? (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px'}}>
            <CircularProgress size='24px' />
          </div>
          ) : ( showTeam &&
            team.map((t, i) => (
              <Link to={`/team/${t._id}`}
              style={{ textDecoration: "none", color: "inherit" }}>
              <Item>
                <Groups2Rounded sx={{ fontSize: "18px" }} tagColor={tagColors[i]} />
                {t.team_name}
              </Item>
            </Link>
           )))}
        <Hr />
        <Link
          to="task"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Title>
            <AddTaskRounded />
            My Tasks
          </Title>
        </Link>
        <div style={{bottom: '20px', position: 'absolute'}}>
        
          <Title onClick={() => setDarkMode(!darkMode)}>
          <SettingsBrightnessOutlinedIcon />
          {darkMode ? "Light" : "Dark"} Mode
        </Title>
        <Title onClick={() => logoutUser()}>
          <Logout />
          Logout
        </Title>
        </div>
        <Space />
      </ContainerWrapper>
    </Container >
  );
};

export default Menu;
