import React, { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { Delete, Edit, PersonAdd } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { CircularProgress, IconButton } from "@mui/material";
import AddTaskIcon from '@mui/icons-material/AddTask';
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch } from "react-redux";
import InviteMembers from "../components/InviteMembers";
import UpdateMember from "../components/UpdateMember";
import { getTeam, getTeamMemberTask, getProjectMember } from "../api/index";
import UpdateTeam from "../components/UpdateTeam";
import DeletePopup from "../components/DeletePopup";
import TaskCard from "../components/TaskCard";
import AddTask from "../components/AddTask";
import MemberCard from "../components/MemberCard";

const Container = styled.div`
  padding: 14px 14px;
  @media screen and (max-width: 480px) {
    padding: 10px 4px;
  }
`;

const Header = styled.div``;

const Title = styled.div`
  width: 100%;
  @media screen and (max-width: 480px) {
    font-size: 24px;
  }
  font-size: 30px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  margin-top: 6px;
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Project = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.soft2};
  margin-top: 6px;
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  &:hover {
    background-color: ${({ theme }) => theme.itemHover};
    display: inline-block;  
    border-radius: 2px;
  }
`;

const Desc = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.soft2};
  margin-top: 6px;
  flex: 7;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Hr = styled.hr`
  margin: 18px 0px;
  border: 0.5px solid ${({ theme }) => theme.soft + "99"};
`;

const Body = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  @media screen and (max-width: 1000px) {
    flex-direction: column;
    gap: 10px;
  }
  gap: 20px;
`;

const IcoBtn = styled(IconButton)`
  color: ${({ theme }) => theme.textSoft} !important;
`;

const Extra = styled.div`
  flex: 0.8;
`;

const SubCards = styled.div`
  padding: 10px 12px 18px 12px;
  text-align: left;
  margin: 12px 0px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.card + "99"};
  color: ${({ theme }) => theme.text};
  cursor: pointer;
  box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.09);
`;

const SubCardTop = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-teams: center;
  padding: 3px 4px;
  color: ${({ theme }) => theme.text};
`;

const SubCardsTitle = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.text};
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Tasks = styled.div`
  flex: 1.5;
`;

const InviteButton = styled.button`
  padding: 6px 14px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.primary};
  color: ${({ theme }) => theme.primary};
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  border-radius: 10px;
  transition: all 0.3s ease;
  margin: 0px 16px;
  &:hover {
    background-color: ${({ theme }) => theme.primary};
    color: ${({ theme }) => theme.text};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: 2px 0px 0px 0px;
`;


const TeamDetails = ({setRefreshMenu}) => {
  const { team_id } = useParams();
  const [team, setTeam] = useState([]);
  const [member, setMember] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invitePopup, setInvitePopup] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [inviteMemberPopup, setInviteMemberPopup] = useState(false);
  const [updateMemberPopUp, setUpdateMemberPopUp] = useState(false);
  const [addNewTask, setAddNewTask] = useState(false);
  const [created, setCreated] = useState(false);
  const [projectTeamMember, setProjectTeamMember] = useState([]);
  const token = localStorage.getItem("token");
  const dispatch = useDispatch();

  
  const fetchTeamDetails = async () => {
    try {
      const res = await getTeam(team_id, token); 
      if(res.status === 200 ){
        setTeam(res.data.data); 
        setMember(res.data.data.member);
      }
    } catch (err) {
      console.error("Error fetching team details:", err.message || err);
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to fetch team details",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamTask = async () => {
    try {
      const res = await getTeamMemberTask(team_id, token);
      if (res.status === 200) {
        setTasks(res.data.data);
      }
    }catch (err) {
      console.error("Error fetching team details:", err.message || err);
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || "Failed to fetch team details",
            severity: "error",
          })
        );
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMember = async () => {
    const project_id = await team.project._id;
    console.log("project_id:",project_id );
    if (!project_id) {
      console.error("team.project._id is undefined.");
      setLoading(false);
      return;
    }
    await getProjectMember(project_id, token).
      then((res) => {
        if (res.status === 200) {
          setProjectTeamMember(res.data.data);
        }
      })
      .catch((err) => {
        dispatch(
          openSnackbar({
            message: err.response?.data?.message || "Failed to fetch project members.",
            severity: "error",
          })
        );
      }).finally(() => setLoading(false));
  };

  const handleAddTask = () => {
    setAddNewTask(true);
  }

  const fetchAllData = async () => {
    try {
      const [teamRes, taskRes] = await Promise.all([
        getTeam(team_id, token),
        getTeamMemberTask(team_id, token),
      ]);
      setTeam(teamRes.data.data); 
      setMember(teamRes.data.data.member);
      setTasks(taskRes.data.data);
    }catch (err) {
      console.error("Error fetching data:", err);
      dispatch(
        openSnackbar({
          message: err.response?.data?.message || "Failed to load data.",
          severity: "error",
        })
      );
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAllData();
  }, [team_id, openUpdate, openDelete, created, addNewTask]);

    useEffect(() => {
      fetchProjectMember();
    }, [team]);


  return (
    <Container>
      {openUpdate.state && <UpdateTeam projectId={team.project._id} openUpdate={openUpdate} setOpenUpdate={setOpenUpdate} setRefreshMenu={setRefreshMenu}/>}
      {openDelete.state && <DeletePopup openDelete={openDelete} setOpenDelete={setOpenDelete} setRefreshMenu={setRefreshMenu}/>}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '12px 0px', height: '300px' }}>
          <CircularProgress />
        </div>
      ) : (
        <>
          <Header>
            <Title>{team.team_name}</Title>
            <Link to={`/project/${team.project._id}`}
              style={{ textDecoration: "none", color: "inherit" }}>
              <Project>Project: {team.project.project_name}</Project>
            </Link>
            <Desc>Team Role: {team.team_role}</Desc>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
              <IcoBtn onClick={() => setOpenUpdate({ state: true, type: 'all', data: team })}>
                <Edit sx={{ fontSize: "20px" }} />
              </IcoBtn>
              <IcoBtn onClick={() => setOpenDelete({ state: true, type: 'Team', name: team.team_name, id: team_id, project_id: team.project._id, token: token })}>
                <Delete sx={{ fontSize: "20px" }} />
              </IcoBtn>
            </div>
            <Hr />
            {invitePopup && (
              <InviteMembers setInvitePopup={setInvitePopup} id={team_id} projectId={team.project?._id}
              />
            )}
          </Header>
          <Body>
            <Tasks>
            <SubCards>
                <SubCardTop>
                  <SubCardsTitle>Tasks</SubCardsTitle>
                  <InviteButton style={{ marginRight: '0px' }} onClick={handleAddTask}>
                    <AddTaskIcon sx={{ fontSize: "12px" }} /> Create New Task
                  </InviteButton>
                </SubCardTop>
                <TaskCard project_task={tasks}></TaskCard>
              </SubCards>
              {addNewTask && (
                <AddTask
                  project_member={projectTeamMember}
                  project_id={team.project._id}
                  setCreated={setCreated}
                  setAddNewTask={setAddNewTask}
                />
              )}
            </Tasks>
            <Extra>
              <SubCards>
                <SubCardTop>
                  <SubCardsTitle>Members</SubCardsTitle>
                </SubCardTop>
                <MemberCard team={team} >
                  <ButtonsContainer>
                    <InviteButton onClick={() => setInviteMemberPopup(true)}>
                      <PersonAdd sx={{ fontSize: "12px" }} /> Invite
                    </InviteButton>

                    {member.length > 0 &&
                      <InviteButton onClick={() => setUpdateMemberPopUp(true)}>
                        <Edit sx={{ fontSize: "12px" }} /> Update
                      </InviteButton>}
                  </ButtonsContainer> 
                  {inviteMemberPopup && (<InviteMembers setInvitePopup={setInviteMemberPopup} id={team_id} />)}
                  {updateMemberPopUp && (<UpdateMember project_id={team.project._id} setOpenUpdate={setUpdateMemberPopUp} members={team.member.sort((a, b) => a.user.account.name.localeCompare(b.user.account.name))} team_id={team_id} />)}
                </MemberCard>
              </SubCards>
            </Extra>
          </Body>
        </>
      )}
    </Container>
  );
};

export default TeamDetails;
